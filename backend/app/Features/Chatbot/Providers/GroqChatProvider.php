<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;
use App\Features\Chatbot\Exceptions\ChatProviderException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Groq's OpenAI-compatible chat completions API, behind the ChatProvider
 * contract. Never throws outward except ChatProviderException, which
 * ChatProviderManager catches to fall back safely.
 */
final class GroqChatProvider implements ChatProvider
{
    public function generate(ChatProviderRequest $request): ChatProviderResult
    {
        $apiKey = trim((string) config('chatbot.groq.api_key', ''));

        if ($apiKey === '') {
            throw new ChatProviderException('Groq API key is not configured.');
        }

        $baseUrl = rtrim((string) config('chatbot.groq.base_url', ''), '/');

        if ($baseUrl === '') {
            throw new ChatProviderException('Groq base URL is not configured.');
        }

        $timeout = max(1, $request->timeoutSeconds);

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout($timeout)
                ->connectTimeout(min(5, $timeout))
                ->post("{$baseUrl}/chat/completions", $this->buildPayload($request));
        } catch (ConnectionException $exception) {
            throw new ChatProviderException('Groq connection failure.', previous: $exception);
        } catch (Throwable $exception) {
            throw new ChatProviderException('Groq request failure.', previous: $exception);
        }

        if ($response->failed()) {
            throw new ChatProviderException(
                sprintf('Groq returned HTTP %d.', $response->status()),
            );
        }

        $body = $response->json();

        if (! is_array($body)) {
            throw new ChatProviderException('Groq returned a malformed payload.');
        }

        $content = $body['choices'][0]['message']['content'] ?? null;

        if (! is_string($content) || trim($content) === '') {
            throw new ChatProviderException('Groq response is missing assistant content.');
        }

        $content = $this->stripReasoning($content);

        if (trim($content) === '') {
            throw new ChatProviderException('Groq response contained no visible content after stripping reasoning.');
        }

        $usage = is_array($body['usage'] ?? null) ? $body['usage'] : null;
        $model = is_string($body['model'] ?? null) ? $body['model'] : $request->model;

        return new ChatProviderResult(
            content: trim($content),
            provider: 'groq',
            model: $model,
            fallbackUsed: false,
            usage: $usage,
        );
    }

    /**
     * Reasoning-capable models (e.g. Qwen3) can inline their chain-of-thought
     * as literal <think>...</think> text ahead of the real answer. That's an
     * internal implementation detail and must never reach the visitor.
     */
    private function stripReasoning(string $content): string
    {
        $withoutThinkBlocks = preg_replace('/<think>.*?<\/think>/isu', '', $content);

        if ($withoutThinkBlocks === null) {
            return $content;
        }

        // A model that opens a <think> block but is cut off by max_tokens
        // before closing it would otherwise leak the entire block.
        $withoutUnclosedThink = preg_replace('/<think>.*$/isu', '', $withoutThinkBlocks);

        return trim($withoutUnclosedThink ?? $withoutThinkBlocks);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(ChatProviderRequest $request): array
    {
        return [
            'model' => $request->model,
            'max_tokens' => $request->maxOutputTokens,
            'messages' => $this->buildMessages($request),
            // Anas's replies are customer-service dialogue, not multi-step
            // problem solving: chain-of-thought reasoning isn't needed and,
            // left on, can consume the whole max_tokens budget before the
            // visitor-facing answer is produced. stripReasoning() below is
            // kept as a defensive backstop regardless.
            'reasoning_effort' => 'none',
        ];
    }

    /**
     * @return list<array{role: string, content: string}>
     */
    private function buildMessages(ChatProviderRequest $request): array
    {
        $messages = [
            ['role' => 'system', 'content' => $request->systemPrompt],
        ];

        foreach ($request->history as $historyMessage) {
            $messages[] = [
                'role' => $historyMessage->role,
                'content' => $historyMessage->content,
            ];
        }

        return $messages;
    }
}
