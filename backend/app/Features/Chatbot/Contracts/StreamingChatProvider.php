<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Contracts;

use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;

/**
 * Optional capability a ChatProvider may additionally implement. Kept
 * separate from ChatProvider itself so a provider that cannot stream
 * (FallbackChatProvider) is never forced to fake it.
 */
interface StreamingChatProvider
{
    /**
     * Generates a reply exactly like ChatProvider::generate(), but invokes
     * $onRawFragment with each new piece of raw, reasoning-stripped model
     * text as it arrives, in order. $onRawFragment receives *raw* text —
     * safety processing (chunk buffering, quality-guard normalization) is
     * the caller's responsibility, not the provider's.
     *
     * @param  callable(string $rawFragment): void  $onRawFragment
     */
    public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult;
}
