<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;
use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Resolves the AI provider configured via CHATBOT_AI_DRIVER and
 * guarantees Anas keeps responding even when that provider fails.
 *
 * This is the only class in the application aware of concrete vendor
 * driver names. HandleChatTurn and the controller depend on the
 * ChatProvider contract only, so adding a new vendor never touches them.
 */
final class ChatProviderManager implements ChatProvider
{
    public function __construct(
        private readonly Container $container,
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
                ]);
            }
        }

        try {
            return $this->container->make(FallbackChatProvider::class)->generate($request);
        } catch (Throwable $exception) {
            Log::error('Chatbot fallback provider failed unexpectedly.', [
                'exception' => $exception::class,
            ]);

            return new ChatProviderResult(
                content: "I'm sorry, Anas is temporarily unavailable. Please try again shortly.",
                provider: 'fallback',
                model: null,
                fallbackUsed: true,
                usage: null,
            );
        }
    }

    private function resolve(string $driver): ChatProvider
    {
        return match ($driver) {
            'groq' => $this->container->make(GroqChatProvider::class),
            default => $this->container->make(FallbackChatProvider::class),
        };
    }
}
