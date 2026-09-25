<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\Contracts\GroqStreamTransport;
use App\Features\Chatbot\Contracts\StreamingChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;
use App\Features\Chatbot\Exceptions\ChatProviderException;
use App\Features\Chatbot\Exceptions\PartialStreamChatProviderException;
use App\Features\Chatbot\Support\ReasoningStreamFilter;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Groq's OpenAI-compatible chat completions API, behind the ChatProvider
 * contract. Never throws outward except ChatProviderException (or its
 * PartialStreamChatProviderException subtype for stream()), which
 * ChatProviderManager catches to fall back safely.
 *
 * $transport defaults to the real network implementation
 * (CurlGroqStreamTransport). The default-value-via-new-expression here
 * means Laravel's container needs no explicit binding to construct this
 * class normally in production (it falls back to the default when it
 * can't resolve the GroqStreamTransport interface on its own) — while
 * tests can still override it by binding GroqStreamTransport to a fake in
 * the container, exactly like Http::fake() would for a Guzzle-based call.
 */
final class GroqChatProvider implements ChatProvider, StreamingChatProvider
{
    public function __construct(
        private readonly GroqStreamTransport $transport = new CurlGroqStreamTransport,
    ) {}

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
     * Streaming counterpart to generate(). Makes exactly one HTTP request
     * to Groq with `stream: true` and forwards each raw, reasoning-
     * stripped text fragment to $onRawFragment as it arrives — safety
     * chunking/normalization is the caller's job (SafeStreamChunker via
     * ChatProviderManager::stream()), not this provider's.
     *
     * Delegates the actual network transfer to $this->transport
     * (GroqStreamTransport), deliberately bypassing Laravel's HTTP client
     * (Guzzle). Measurement during the streaming-UX pass showed that
     * Guzzle's `stream => true` option, backed by its synchronous curl
     * handler, does not release upstream chunks to
     * `StreamInterface::read()` as they arrive — a fixed-cadence upstream
     * test (fragments 1.5s apart) delivered everything from the second
     * chunk onward in one burst, timed to when the upstream connection
     * closed, not when each chunk was actually sent. The real transport
     * (CurlGroqStreamTransport) instead uses CURLOPT_WRITEFUNCTION, which
     * curl's own read loop calls the moment bytes land on the socket.
     * This method owns all Groq-specific knowledge (headers, payload
     * shape, SSE line framing, JSON delta extraction, reasoning
     * stripping) — the transport only knows how to move bytes, so the
     * StreamingChatProvider contract, and everything that calls it,
     * remains unaware of how the bytes were fetched.
     *
     * On failure, throws PartialStreamChatProviderException (carrying
     * whatever visible reasoning-stripped content had already been produced) if the stream broke
     * down after some content arrived, or the plain ChatProviderException
     * if nothing was ever produced — letting the caller tell the two
     * cases apart and react accordingly.
     */
    public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
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
        $payload = json_encode($this->buildStreamingPayload($request), JSON_THROW_ON_ERROR);

        /*
         * Keep one authoritative reasoning-stripped representation of the
         * provider output. This is used for BOTH successful completion and
         * partial-stream recovery, so a connection failure while the model
         * is inside <think>...</think> can never make hidden reasoning
         * eligible for visitor-facing salvage.
         */
        $visibleContent = '';
        $filter = new ReasoningStreamFilter;

        $forwardSafeText = static function (string $text) use (&$visibleContent, $onRawFragment): void {
            if ($text !== '') {
                $visibleContent .= $text;
                $onRawFragment($text);
            }
        };

        $sseBuffer = '';

        $onChunk = function (string $chunk) use (&$sseBuffer, $filter, $forwardSafeText): void {
            $sseBuffer .= $chunk;

            while (($newlinePos = strpos($sseBuffer, "\n")) !== false) {
                $line = rtrim(substr($sseBuffer, 0, $newlinePos), "\r");
                $sseBuffer = substr($sseBuffer, $newlinePos + 1);

                if (! str_starts_with($line, 'data:')) {
                    continue;
                }

                $data = trim(substr($line, 5));

                if ($data === '' || $data === '[DONE]') {
                    continue;
                }

                $decoded = json_decode($data, true);
                $delta = is_array($decoded)
                    ? ($decoded['choices'][0]['delta']['content'] ?? null)
                    : null;

                if (is_string($delta) && $delta !== '') {
                    $filter->feed($delta, $forwardSafeText);
                }
            }
        };

        $result = $this->transport->stream(
            "{$baseUrl}/chat/completions",
            [
                "Authorization: Bearer {$apiKey}",
                'Content-Type: application/json',
                'Accept: text/event-stream',
            ],
            $payload,
            $timeout,
            min(5, $timeout),
            $onChunk,
        );

        if (! $result['succeeded']) {
            if ($visibleContent !== '') {
                throw new PartialStreamChatProviderException(
                    $visibleContent,
                    previous: new ChatProviderException($result['error'] !== '' ? $result['error'] : 'Groq streaming connection failed.'),
                );
            }

            throw new ChatProviderException(
                'Groq streaming connection failed: '.($result['error'] !== '' ? $result['error'] : 'unknown transport error'),
            );
        }

        if ($result['status'] !== 200) {
            if ($visibleContent !== '') {
                throw new PartialStreamChatProviderException($visibleContent);
            }

            throw new ChatProviderException(sprintf('Groq returned HTTP %d.', $result['status']));
        }

        $filter->finish($forwardSafeText);

        $finalContent = trim($visibleContent);

        if ($finalContent === '') {
            throw new ChatProviderException('Groq streaming response contained no visible content after stripping reasoning.');
        }

        return new ChatProviderResult(
            content: $finalContent,
            provider: 'groq',
            model: $request->model,
            fallbackUsed: false,
            usage: null,
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
        $payload = [
            'model' => $request->model,
            'max_tokens' => $request->maxOutputTokens,
            'messages' => $this->buildMessages($request),
            'temperature' => $request->temperature,
            'top_p' => $request->topP,
        ];

        /*
         * Groq exposes reasoning_effort through one API field, but the
         * accepted values are model-specific:
         *
         * - Qwen 3.6 / 3.8 support "none" for fast instruct dialogue.
         * - GPT-OSS 20B / 120B do NOT support "none"; "low" is the
         *   appropriate starting point for this customer-facing chatbot.
         * - For an unknown future model, omit the field rather than risk
         *   sending a value that model rejects with HTTP 400.
         *
         * Reasoning removal below remains a defensive backstop regardless.
         */
        $reasoningEffort = $this->reasoningEffortForModel(
            $request->model,
        );

        if ($reasoningEffort !== null) {
            $payload['reasoning_effort'] = $reasoningEffort;
        }

        return $payload;
    }

    private function reasoningEffortForModel(string $model): ?string
    {
        return match ($model) {
            'qwen/qwen3.6-27b',
            'qwen/qwen3.8-27b' => 'none',

            'openai/gpt-oss-20b',
            'openai/gpt-oss-120b' => 'low',

            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function buildStreamingPayload(ChatProviderRequest $request): array
    {
        return [...$this->buildPayload($request), 'stream' => true];
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
