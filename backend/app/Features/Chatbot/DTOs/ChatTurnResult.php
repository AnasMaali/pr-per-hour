<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

use App\Features\Chatbot\Models\ChatMessage;

/**
 * The two persisted messages produced by one visitor/client turn:
 * the message they sent, and Anas's reply.
 */
final readonly class ChatTurnResult
{
    public function __construct(
        public ChatMessage $userMessage,
        public ChatMessage $botMessage,
    ) {}
}
