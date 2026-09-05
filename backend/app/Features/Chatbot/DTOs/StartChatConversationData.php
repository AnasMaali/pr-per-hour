<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

final readonly class StartChatConversationData
{
    public function __construct(
        public ?string $visitorName,
        public ?string $visitorEmail,
    ) {}

    /**
     * @param array{
     *     visitor_name?: string|null,
     *     visitor_email?: string|null
     * } $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            visitorName: $validated['visitor_name'] ?? null,
            visitorEmail: $validated['visitor_email'] ?? null,
        );
    }
}
