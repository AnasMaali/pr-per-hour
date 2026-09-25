<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\Contracts\StreamingChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;
use App\Features\Chatbot\Exceptions\PartialStreamChatProviderException;
use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Resolves the AI provider configured via CHATBOT_AI_DRIVER and
 * guarantees the chatbot keeps responding even when that provider fails.
 *
 * This is the only class in the application aware of concrete vendor
 * driver names. HandleChatTurn, HandleStreamingChatTurn, and the
 * controller depend on the ChatProvider/StreamingChatProvider contracts
 * only, so adding a new vendor never touches them.
 */
final class ChatProviderManager implements ChatProvider
{
    public function __construct(
        private readonly Container $container,
        private readonly AnasResponseQualityGuard $qualityGuard,
    ) {}

    public function generate(ChatProviderRequest $request): ChatProviderResult
    {
        $driver = (string) config('chatbot.ai.driver', 'fallback');

        if ($driver !== 'fallback') {
            try {
                return $this->resolve($driver)->generate($request);
            } catch (Throwable $exception) {
                Log::warning('Chatbot AI provider failed; using fallback.', [
                    'driver' => $driver,
                    'exception' => $exception::class,
                    'message' => $exception->getMessage(),
                    'previous' => $exception->getPrevious()?->getMessage(),
                ]);
            }
        }

        return $this->localFallback($request);
    }

    /**
     * Streaming counterpart to generate(), with the same "always return a
     * safe result, never throw" guarantee — but two distinct failure modes
     * to react to instead of one:
     *
     *  - The streaming provider fails before producing anything useful
     *    (network/auth/HTTP failure, or empty response): falls through to
     *    the same guaranteed local-fallback chain generate() uses for its
     *    own "fallback"-driver case. Critically, this does NOT call
     *    generate() itself — that would re-attempt the very same external
     *    driver that just failed via stream(), i.e. a second real network
     *    call for this turn. Both methods instead share one
     *    localFallback() that only ever touches the local
     *    FallbackChatProvider.
     *  - The streaming provider fails AFTER producing some raw content
     *    (PartialStreamChatProviderException): a graceful, deterministic
     *    completion is attempted from that partial content — truncated to
     *    its last complete sentence — rather than discarding it. If even
     *    that isn't possible (too little usable content), it falls back
     *    to the same guaranteed chain as above. Never a second LLM call
     *    either way.
     *
     * @param  callable(string $rawFragment): void  $onRawFragment
     */
    public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
    {
        $driver = (string) config('chatbot.ai.driver', 'fallback');

        if ($driver !== 'fallback') {
            try {
                $provider = $this->resolve($driver);

                if ($provider instanceof StreamingChatProvider) {
                    return $provider->stream($request, $onRawFragment);
                }
            } catch (PartialStreamChatProviderException $exception) {
                Log::warning('Chatbot AI streaming provider failed mid-stream; completing gracefully.', [
                    'driver' => $driver,
                ]);

                return $this->completeGracefullyFromPartialContent($exception->partialRawContent, $request);
            } catch (Throwable $exception) {
                Log::warning('Chatbot AI streaming provider failed before any content; using fallback.', [
                    'driver' => $driver,
                    'exception' => $exception::class,
                    'message' => $exception->getMessage(),
                    'previous' => $exception->getPrevious()?->getMessage(),
                ]);
            }
        }

        return $this->localFallback($request);
    }

    /**
     * Salvages whatever safe visible content a streaming provider produced
     * before dying mid-stream: sanitized and truncated to its last complete
     * sentence, so the visitor never sees (or has persisted) an answer
     * that trails off mid-word or mid-thought. If there isn't even one
     * complete sentence to salvage, falls through to the ordinary,
     * fully-guaranteed local-fallback chain — never a second LLM call.
     */
    private function completeGracefullyFromPartialContent(
        string $partialVisibleContent,
        ChatProviderRequest $request,
    ): ChatProviderResult {
        $sanitized = $this->qualityGuard->sanitizeText($partialVisibleContent);
        $truncated = $this->truncateToLastCompleteSentence($sanitized);

        if ($truncated !== null) {
            return new ChatProviderResult(
                content: $truncated,
                provider: 'groq',
                model: null,
                fallbackUsed: false,
                usage: null,
            );
        }

        return $this->localFallback($request);
    }

    private function truncateToLastCompleteSentence(string $text): ?string
    {
        if (
            preg_match_all('/[.!?؟]/u', $text, $matches, PREG_OFFSET_CAPTURE)
            && $matches[0] !== []
        ) {
            $last = end($matches[0]);
            $cut = $last[1] + strlen((string) $last[0]);
            $truncated = trim(substr($text, 0, $cut));

            return $truncated === '' ? null : $truncated;
        }

        return null;
    }

    /**
     * The one true "always safe, local-only" chain: FallbackChatProvider,
     * with emergencyFallbackContent() as the backstop if even that throws.
     * Shared by generate() (its own "fallback"-driver / driver-failed
     * case) and stream() (both of its failure modes) so that no matter
     * which entry point led here, the external driver is never touched
     * again for this turn.
     */
    private function localFallback(ChatProviderRequest $request): ChatProviderResult
    {
        try {
            return $this->container->make(FallbackChatProvider::class)->generate($request);
        } catch (Throwable $exception) {
            Log::error('Chatbot fallback provider failed unexpectedly.', [
                'exception' => $exception::class,
            ]);

            return new ChatProviderResult(
                content: $this->emergencyFallbackContent($request),
                provider: 'fallback',
                model: null,
                fallbackUsed: true,
                usage: null,
            );
        }
    }

    /**
     * Last-resort copy for the case where even FallbackChatProvider itself
     * threw — the one path with no safe local reply already computed.
     * Calling FallbackChatProvider::generate() again here would risk
     * repeating whatever just failed, so this reuses only its stateless
     * language detection (messageLooksArabic()) and never its generate()
     * method: no recursion between the two classes.
     *
     * From the visitor's perspective this must read as an ordinary,
     * silent redirection — never a hint that an AI provider, model, or
     * technical system failed or is unavailable.
     */
    private function emergencyFallbackContent(ChatProviderRequest $request): string
    {
        return FallbackChatProvider::messageLooksArabic($request)
            ? 'يمكن الاستمرار بالتعرّف على خدمات PR Per Hour، أو التواصل مع الفريق مباشرة عبر القنوات المتاحة.'
            : "You can continue exploring PR Per Hour's services, or contact the team directly through the available contact channels.";
    }

    private function resolve(string $driver): ChatProvider
    {
        return match ($driver) {
            'groq' => $this->container->make(GroqChatProvider::class),
            default => $this->container->make(FallbackChatProvider::class),
        };
    }
}
