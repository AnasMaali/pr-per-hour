<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ChatConversationStatus;
use App\Features\Chatbot\Models\ChatConversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatConversation>
 */
class ChatConversationFactory extends Factory
{
    protected $model = ChatConversation::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'visitor_name' => fake()->optional()->name(),
            'visitor_email' => fake()->optional()->safeEmail(),
            'status' => ChatConversationStatus::Open,
        ];
    }
}
