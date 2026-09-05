<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

/**
 * A single turn of conversation history handed to an AI provider,
 * expressed in the vendor-agnostic "user"/"assistant" vocabulary.
 */
final readonly class ChatProviderMessage
{
    private function __construct(
        public string $role,
        public string $content,
    ) {}

    public static function user(string $content): self
    {
        return new self('user', $content);
    }

    public static function assistant(string $content): self
    {
        return new self('assistant', $content);
    }
}
