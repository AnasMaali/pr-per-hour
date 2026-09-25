<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Controllers;

use App\Enums\ChatConversationStatus;
use App\Enums\ChatSender;
use App\Features\Chatbot\Actions\HandleChatTurn;
use App\Features\Chatbot\Actions\HandleStreamingChatTurn;
use App\Features\Chatbot\Actions\StartChatConversation;
use App\Features\Chatbot\DTOs\StartChatConversationData;
use App\Features\Chatbot\Models\ChatConversation;
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
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        $conversation = $this->resolveOpenConversation($conversationToken, $user, $access);

        if ($conversation instanceof JsonResponse) {
            return $conversation;
        }

        $turn = $handleChatTurn->execute(
            $conversation,
            (string) $request->validated('message'),
            $this->resolveSender($conversation),
        );

        return ApiResponse::created(
            data: (new ChatTurnResource($turn))->resolve(),
            message: __('chatbot.message_saved'),
        );
    }

    /**
     * Streaming counterpart to storeMessage() — see HandleStreamingChatTurn
     * for the SSE event contract. Kept as a separate endpoint alongside the
     * non-streaming one above, which remains available as a compatibility/
     * fallback path.
     */
    public function streamMessage(
        SendChatMessageRequest $request,
        string $conversationToken,
        ChatConversationAccess $access,
        HandleStreamingChatTurn $handleStreamingChatTurn,
    ): JsonResponse|StreamedResponse {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        $conversation = $this->resolveOpenConversation($conversationToken, $user, $access);

        if ($conversation instanceof JsonResponse) {
            return $conversation;
        }

        return $handleStreamingChatTurn->execute(
            $conversation,
            (string) $request->validated('message'),
            $this->resolveSender($conversation),
        );
    }

    /**
     * Shared access/ownership/status checks for both the non-streaming and
     * streaming message endpoints — same conversation token resolution,
     * same guest/client ownership rule, same closed-conversation rejection.
     */
    private function resolveOpenConversation(
        string $conversationToken,
        ?User $user,
        ChatConversationAccess $access,
    ): ChatConversation|JsonResponse {
        $conversation = $access->find($conversationToken, $user);

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

        return $conversation;
    }

    private function resolveSender(ChatConversation $conversation): ChatSender
    {
        return $conversation->user_id === null
            ? ChatSender::Visitor
            : ChatSender::Client;
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
