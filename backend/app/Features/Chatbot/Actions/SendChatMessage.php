<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Actions;

use App\Enums\ChatSender;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use Illuminate\Support\Facades\DB;

final class SendChatMessage
{
    public function execute(
        ChatConversation $conversation,
        string $message,
        ChatSender $sender,
    ): ChatMessage {
        return DB::transaction(function () use (
            $conversation,
            $message,
            $sender,
        ): ChatMessage {
            $chatMessage = new ChatMessage;

            $chatMessage->conversation_id = $conversation->id;
            $chatMessage->sender = $sender;
            $chatMessage->message = $message;
            $chatMessage->save();

            // Keep conversation ordering based on recent activity.
            $conversation->touch();

            return $chatMessage;
        });
    }
}
