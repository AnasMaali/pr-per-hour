<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Features\Chatbot\Models\ChatMessage
 */
final class ChatMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'sender' => $this->sender->value,
            'message' => $this->message,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
