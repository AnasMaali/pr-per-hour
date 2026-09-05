<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Features\Chatbot\Models\ChatConversation
 */
final class ChatConversationResource extends JsonResource
{
    public function __construct(
        mixed $resource,
        private readonly string $conversationToken,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'conversation_token' => $this->conversationToken,
            'status' => $this->status->value,
            'visitor_name' => $this->visitor_name,
            'messages' => $this->relationLoaded('messages')
                ? ChatMessageResource::collection(
                    $this->messages,
                )->resolve($request)
                : [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
