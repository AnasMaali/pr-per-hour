<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Actions;

use App\Enums\ChatSender;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Providers\ChatProviderManager;
use App\Features\Chatbot\Providers\FallbackChatProvider;
use App\Features\Chatbot\Resources\ChatMessageResource;
use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use App\Features\Chatbot\Support\AnasSystemPromptBuilder;
use App\Features\Chatbot\Support\ChatHistoryBuilder;
use App\Features\Chatbot\Support\PrPerHourSmartResponder;
use App\Features\Chatbot\Support\SafeStreamChunker;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * Streaming counterpart to HandleChatTurn (kept unchanged as the
 * non-streaming compatibility/fallback path).
 *
 * SSE event contract (all data payloads are JSON):
 *   event: start   data: {}
 *   event: delta   data: {"content": "..."}
 *   event: done    data: {"message": {...ChatMessageResource shape...}}
 *   event: error   data: {}
 *
 * Never exposes provider name, model, API details, quality-guard
 * diagnostics, database IDs, or internal exception messages in any event.
 *
 * At most one external Groq request per turn. Authoritative first-party questions bypass Groq entirely; other turns use
 * ChatProviderManager::stream() — which itself guarantees a safe result
 * under every failure mode with no second LLM call (see that class).
 *
 * Persistence invariants:
 *  - The visitor's message is persisted BEFORE the provider is called, so
 *    it survives regardless of what happens next.
 *  - Exactly one bot message is persisted, once, after the stream (or its
 *    fallback substitute) has fully resolved — never one-per-chunk, never
 *    zero.
 *  - The persisted bot message is always the exact text of the final
 *    "done" event, which is itself the authoritative,
 *    fully-quality-guarded answer — not necessarily an exact concatenation
 *    of the "delta" events (see SafeStreamChunker for why boundary-
 *    spanning corrections are a rare, self-healing residual risk). The
 *    frontend is expected to replace its displayed text with "done"'s
 *    message on completion for exactly this reason.
 */
final readonly class HandleStreamingChatTurn
{
    public function __construct(
        private SendChatMessage $sendMessage,
        private ChatHistoryBuilder $historyBuilder,
        private AnasSystemPromptBuilder $systemPromptBuilder,
        private ChatProviderManager $provider,
        private AnasResponseQualityGuard $qualityGuard,
        private PrPerHourSmartResponder $smartResponder,
        private FallbackChatProvider $fallbackProvider,
    ) {}

    public function execute(
        ChatConversation $conversation,
        string $message,
        ChatSender $sender,
    ): StreamedResponse {
        // Persisted BEFORE any external generation — the visitor's message
        // survives regardless of what happens to the provider call. The
        // streaming contract never echoes it back (the frontend already
        // has it optimistically), so the returned model isn't needed here.
        $this->sendMessage->execute($conversation, $message, $sender);

        $providerRequest = new ChatProviderRequest(
            systemPrompt: $this->systemPromptBuilder->build(),
            history: $this->historyBuilder->build(
                $conversation,
                max(0, (int) config('chatbot.ai.history_messages', 12)),
            ),
            model: (string) config('chatbot.ai.model', ''),
            maxOutputTokens: (int) config('chatbot.ai.max_output_tokens', 500),
            timeoutSeconds: (int) config('chatbot.ai.timeout_seconds', 10),
            temperature: (float) config('chatbot.ai.temperature', 0.7),
            topP: (float) config('chatbot.ai.top_p', 0.8),
        );

        $authoritativeReply = $this->smartResponder
            ->respondAuthoritatively(
                $providerRequest,
                FallbackChatProvider::messageLooksArabic(
                    $providerRequest,
                ),
            );

        return new StreamedResponse(
            function () use (
                $conversation,
                $providerRequest,
                $authoritativeReply,
            ): void {
                $this->stream(
                    $conversation,
                    $providerRequest,
                    $authoritativeReply,
                );
            },
            200,
            [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache, no-transform',
                'X-Accel-Buffering' => 'no',
                'Connection' => 'keep-alive',
            ],
        );
    }

    private function stream(
        ChatConversation $conversation,
        ChatProviderRequest $providerRequest,
        ?string $authoritativeReply,
    ): void {
        $this->prepareOutputForStreaming();
        $this->emit('start', []);

        /*
         * Preserve the exact same SSE contract for authoritative local
         * answers. The frontend does not need to know whether the answer
         * came from first-party knowledge or from an external model.
         */
        if ($authoritativeReply !== null) {
            $quality = $this->qualityGuard->evaluate(
                $authoritativeReply,
            );

            $finalText = $quality->accepted
                ? $quality->text
                : $this->fallbackProvider
                    ->generate($providerRequest)
                    ->content;

            if (! $quality->accepted) {
                Log::warning(
                    'Authoritative streamed PRIA reply failed quality guard; using local fallback.',
                    ['issues' => $quality->issues],
                );
            }

            $botMessage = $this->sendMessage->execute(
                $conversation,
                $finalText,
                ChatSender::Bot,
            );

            if (! connection_aborted()) {
                $this->emit(
                    'delta',
                    ['content' => $finalText],
                );

                $this->emit('done', [
                    'message' => (
                        new ChatMessageResource($botMessage)
                    )->resolve(),
                ]);
            }

            return;
        }

        $chunker = new SafeStreamChunker($this->qualityGuard);
        $clientGone = false;

        try {
            $result = $this->provider->stream(
                $providerRequest,
                function (string $rawFragment) use ($chunker, &$clientGone): void {
                    if ($clientGone) {
                        return;
                    }

                    if (connection_aborted()) {
                        $clientGone = true;

                        return;
                    }

                    $chunk = $chunker->feed($rawFragment);

                    if ($chunk !== null) {
                        $this->emit('delta', ['content' => $chunk]);
                    }
                },
            );
        } catch (Throwable $exception) {
            // ChatProviderManager::stream() is designed to never throw (it
            // always resolves to a safe local-fallback result) — this is a
            // final, defensive catch-all for a truly unexpected failure.
            Log::error('Unexpected failure while streaming a chat turn.', [
                'exception' => $exception::class,
            ]);
            $this->emit('error', []);

            return;
        }

        if (! $clientGone) {
            $tail = $chunker->finish();

            if ($tail !== null) {
                $this->emit('delta', ['content' => $tail]);
            }
        }

        // Authoritative final pass over the complete assembled answer.
        // This is what gets persisted, and what the frontend is expected
        // to sync its displayed text to on "done" — regardless of exactly
        // what the incremental deltas above showed.
        $quality = $this->qualityGuard->evaluate($result->content);
        $finalText = $quality->accepted
            ? $quality->text
            : $this->fallbackProvider->generate($providerRequest)->content;

        if (! $quality->accepted) {
            Log::warning('Streamed chatbot response failed the final quality guard; using local fallback text.', [
                'issues' => $quality->issues,
            ]);
        }

        $botMessage = $this->sendMessage->execute($conversation, $finalText, ChatSender::Bot);

        if (! $clientGone) {
            $this->emit('done', [
                'message' => (new ChatMessageResource($botMessage))->resolve(),
            ]);
        }
    }

    /**
     * Deliberately does NOT drain/close existing output buffers (e.g. via
     * ob_end_flush() in a loop): a test runner (or some other layer) may
     * already have its own output buffer active for reasons unrelated to
     * this response, and forcibly closing it out from underneath breaks
     * that caller once this method returns. emit() below flushes the
     * *current* buffer level after every event instead, which is enough
     * to push each event out immediately without touching buffers this
     * class didn't create.
     */
    private function prepareOutputForStreaming(): void
    {
        if (function_exists('ob_implicit_flush')) {
            ob_implicit_flush(true);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function emit(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: '.json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();
    }
}
