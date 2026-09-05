<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Actions;

use App\Enums\ChatSender;
use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatTurnResult;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Providers\FallbackChatProvider;
use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use App\Features\Chatbot\Support\AnasSystemPromptBuilder;
use App\Features\Chatbot\Support\ChatHistoryBuilder;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrates one visitor/client chat turn:
 * persist the incoming message, ask the configured AI provider for a
 * reply (outside of any database transaction), run it through the
 * deterministic quality guard, then persist Anas's reply.
 *
 * Exactly one external AI generation call happens per turn. A provider
 * failure never loses the visitor's message, because ChatProviderManager
 * guarantees a safe fallback reply, and a quality-guard rejection never
 * reaches the visitor, because the guard either repairs the text locally
 * or the caller replaces it with FallbackChatProvider's local response —
 * never a second live call.
 */
final readonly class HandleChatTurn
{
    public function __construct(
        private SendChatMessage $sendMessage,
        private ChatHistoryBuilder $historyBuilder,
        private AnasSystemPromptBuilder $systemPromptBuilder,
        private ChatProvider $provider,
        private AnasResponseQualityGuard $qualityGuard,
        private FallbackChatProvider $fallbackProvider,
    ) {}

    public function execute(
        ChatConversation $conversation,
        string $message,
        ChatSender $sender,
    ): ChatTurnResult {
        $userMessage = $this->sendMessage->execute($conversation, $message, $sender);

        $historyLimit = max(0, (int) config('chatbot.ai.history_messages', 12));

        $providerRequest = new ChatProviderRequest(
            systemPrompt: $this->systemPromptBuilder->build(),
            history: $this->historyBuilder->build($conversation, $historyLimit),
            model: (string) config('chatbot.ai.model', ''),
            maxOutputTokens: (int) config('chatbot.ai.max_output_tokens', 500),
            timeoutSeconds: (int) config('chatbot.ai.timeout_seconds', 10),
        );

        $replyText = $this->generateQualityCheckedReply($providerRequest);

        $botMessage = $this->sendMessage->execute($conversation, $replyText, ChatSender::Bot);

        return new ChatTurnResult($userMessage, $botMessage);
    }

    /**
     * One provider call, then the deterministic quality guard. If the
     * guard can't make the text safe on its own, the reply is replaced
     * with FallbackChatProvider's local, conversation-aware response —
     * never a second call to the AI provider.
     */
    private function generateQualityCheckedReply(ChatProviderRequest $providerRequest): string
    {
        $draft = $this->provider->generate($providerRequest);
        $quality = $this->qualityGuard->evaluate($draft->content);

        if ($quality->accepted) {
            return $quality->text;
        }

        Log::warning('Anas response failed quality guard; using local fallback.', [
            'issues' => $quality->issues,
            'provider' => $draft->provider,
            'model' => $draft->model,
        ]);

        return $this->fallbackProvider->generate($providerRequest)->content;
    }
}
