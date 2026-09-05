<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Actions;

use App\Enums\ChatConversationStatus;
use App\Features\Chatbot\DTOs\StartChatConversationData;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Users\Models\User;

final class StartChatConversation
{
    public function execute(
        StartChatConversationData $data,
        ?User $user,
    ): ChatConversation {
        $conversation = new ChatConversation;

        $conversation->user_id = $user?->id;

        if ($user === null) {
            $conversation->visitor_name = $data->visitorName;
            $conversation->visitor_email = $data->visitorEmail;
        }

        $conversation->status = ChatConversationStatus::Open;
        $conversation->save();

        return $conversation;
    }
}
