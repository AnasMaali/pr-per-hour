<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Users\Models\User;

final readonly class ChatConversationAccess
{
    public function __construct(
        private ChatConversationToken $tokens,
    ) {}

    public function find(
        string $token,
        ?User $user,
        bool $withMessages = false,
    ): ?ChatConversation {
        $conversationId = $this->tokens->resolve($token);

        if ($conversationId === null) {
            return null;
        }

        $query = ChatConversation::query();

        if ($withMessages) {
            $query->with([
                'messages' => static function ($query): void {
                    $query->orderBy('id');
                },
            ]);
        }

        $conversation = $query->find($conversationId);

        if ($conversation === null) {
            return null;
        }

        /*
         * Guest conversation:
         * possession of the opaque encrypted token grants access.
         */
        if ($conversation->user_id === null) {
            return $conversation;
        }

        /*
         * Client conversation:
         * the authenticated Sanctum user must own it.
         */
        if (
            $user === null
            || (int) $conversation->user_id !== (int) $user->getKey()
        ) {
            return null;
        }

        return $conversation;
    }
}
