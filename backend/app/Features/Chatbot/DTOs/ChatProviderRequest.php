<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

/**
 * Everything an AI provider needs to generate PRIA AI's next reply,
 * already assembled by the application so provider adapters stay
 * free of business logic (prompts, knowledge, history selection).
 */
final readonly class ChatProviderRequest
{
    /**
     * @param  list<ChatProviderMessage>  $history
     */
    public function __construct(
        public string $systemPrompt,
        public array $history,
        public string $model,
        public int $maxOutputTokens,
        public int $timeoutSeconds,
        public float $temperature = 0.7,
        public float $topP = 0.8,
    ) {}
}
