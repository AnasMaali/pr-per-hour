<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

/**
 * The outcome of asking a provider for a reply.
 *
 * Metadata (provider/model/usage) is kept for internal logging and
 * possible future admin surfaces; it is intentionally never exposed
 * through the public chatbot API.
 */
final readonly class ChatProviderResult
{
    /**
     * @param  array<string, mixed>|null  $usage
     */
    public function __construct(
        public string $content,
        public string $provider,
        public ?string $model,
        public bool $fallbackUsed,
        public ?array $usage = null,
    ) {}
}
