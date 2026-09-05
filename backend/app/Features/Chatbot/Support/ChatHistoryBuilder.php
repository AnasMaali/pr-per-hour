<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Enums\ChatSender;
use App\Features\Chatbot\DTOs\ChatProviderMessage;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;

/**
 * Builds a bounded, deterministic slice of conversation history for the
 * AI provider: the most recent N messages, oldest first, with visitor
 * and client messages mapped to the "user" role and bot (and admin)
 * messages mapped to "assistant". Never sends visitor_name/visitor_email.
 */
final class ChatHistoryBuilder
{
    /**
     * @return list<ChatProviderMessage>
     */
    public function build(ChatConversation $conversation, int $limit): array
    {
        if ($limit <= 0) {
            return [];
        }

        return $conversation->messages()
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values()
            ->map(fn (ChatMessage $message): ChatProviderMessage => $this->toProviderMessage($message))
            ->all();
    }

    private function toProviderMessage(ChatMessage $message): ChatProviderMessage
    {
        $isAssistant = in_array($message->sender, [ChatSender::Bot, ChatSender::Admin], true);

        return $isAssistant
            ? ChatProviderMessage::assistant($message->message)
            : ChatProviderMessage::user($message->message);
    }
}
