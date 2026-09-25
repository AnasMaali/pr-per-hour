<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Exceptions;

use RuntimeException;
use Throwable;

/**
 * A streaming provider call failed AFTER it had already produced some raw
 * visible content (as opposed to failing before anything visitor-facing
 * was generated). GroqChatProvider supplies reasoning-stripped content here,
 * so the caller (ChatProviderManager::stream()) can attempt a graceful,
 * deterministic completion instead of discarding
 * everything and starting over — never a second LLM call.
 *
 * Deliberately extends RuntimeException directly rather than
 * ChatProviderException (which is `final`): callers that only care about
 * "did the provider fail" still catch it via Throwable/RuntimeException,
 * while ChatProviderManager::stream() catches this specific type first to
 * tell the two failure modes apart.
 */
final class PartialStreamChatProviderException extends RuntimeException
{
    public function __construct(
        public readonly string $partialRawContent,
        string $message = 'Groq streaming connection failed after partial content was received.',
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, previous: $previous);
    }
}
