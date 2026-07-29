<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ChatSender;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    protected $model = ChatMessage::class;

    public function definition(): array
    {
        return [
            'conversation_id' => ChatConversation::factory(),
            'sender' => ChatSender::Visitor,
            'message' => fake()->sentence(),
        ];
    }
}
