<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Controllers;

use App\Enums\ChatConversationStatus;
use App\Enums\ChatSender;
use App\Features\Chatbot\Actions\HandleChatTurn;
use App\Features\Chatbot\Actions\StartChatConversation;
use App\Features\Chatbot\DTOs\StartChatConversationData;
use App\Features\Chatbot\Requests\SendChatMessageRequest;
use App\Features\Chatbot\Requests\StartChatConversationRequest;
use App\Features\Chatbot\Resources\ChatConversationResource;
use App\Features\Chatbot\Resources\ChatTurnResource;
use App\Features\Chatbot\Support\ChatConversationAccess;
use App\Features\Chatbot\Support\ChatConversationToken;
use App\Features\Users\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PublicChatbotController
{
    public function store(
        StartChatConversationRequest $request,
        StartChatConversation $startConversation,
        ChatConversationToken $tokens,
    ): JsonResponse {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        $conversation = $startConversation->execute(
            StartChatConversationData::fromValidated(
                $request->validated(),
            ),
            $user,
        );

        $token = $tokens->issue($conversation);

        return ApiResponse::created(
            data: (new ChatConversationResource(
                $conversation,
                $token,
            ))->resolve(),
            message: __('chatbot.conversation_started'),
        );
    }

    public function show(
        Request $request,
        string $conversationToken,
        ChatConversationAccess $access,
    ): JsonResponse {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        $conversation = $access->find(
            $conversationToken,
            $user,
            withMessages: true,
        );

        if ($conversation === null) {
            return $this->notFound();
        }

        return ApiResponse::success(
            data: (new ChatConversationResource(
                $conversation,
                $conversationToken,
            ))->resolve(),
        );
    }

    public function storeMessage(
        SendChatMessageRequest $request,
        string $conversationToken,
        ChatConversationAccess $access,
        HandleChatTurn $handleChatTurn,
    ): JsonResponse {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        $conversation = $access->find(
            $conversationToken,
            $user,
        );

        if ($conversation === null) {
            return $this->notFound();
        }

        if ($conversation->status === ChatConversationStatus::Closed) {
            return ApiResponse::error(
                message: __('chatbot.conversation_closed'),
                status: 409,
                errorCode: 'CHAT_CONVERSATION_CLOSED',
            );
        }

        $sender = $conversation->user_id === null
            ? ChatSender::Visitor
            : ChatSender::Client;

        $turn = $handleChatTurn->execute(
            $conversation,
            (string) $request->validated('message'),
            $sender,
        );

        return ApiResponse::created(
            data: (new ChatTurnResource($turn))->resolve(),
            message: __('chatbot.message_saved'),
        );
    }

    private function notFound(): JsonResponse
    {
        return ApiResponse::error(
            message: __('chatbot.conversation_not_found'),
            status: 404,
            errorCode: 'CHAT_CONVERSATION_NOT_FOUND',
        );
    }
}
