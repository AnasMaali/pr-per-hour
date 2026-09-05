<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Resources;

use App\Features\Chatbot\DTOs\ChatTurnResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ChatTurnResource extends JsonResource
{
    public function __construct(
        private readonly ChatTurnResult $turn,
    ) {
        parent::__construct($turn);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'message' => (new ChatMessageResource($this->turn->userMessage))->resolve($request),
            'reply' => (new ChatMessageResource($this->turn->botMessage))->resolve($request),
        ];
    }
}
