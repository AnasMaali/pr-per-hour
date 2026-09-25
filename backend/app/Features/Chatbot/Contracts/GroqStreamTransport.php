<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Contracts;

/**
 * The raw network transport behind GroqChatProvider::stream(): fetches an
 * HTTP response and delivers its body to $onChunk as bytes arrive, rather
 * than only once the transfer completes. Deliberately narrow — it knows
 * nothing about SSE framing, JSON, or reasoning stripping; GroqChatProvider
 * owns all of that. Existing purely so the real network implementation
 * (CurlGroqStreamTransport) can be swapped for a deterministic fake in
 * tests — Laravel's Http::fake() cannot intercept this, since it fakes
 * Guzzle, not raw curl.
 */
interface GroqStreamTransport
{
    /**
     * @param  array<int, string>  $headers  raw "Name: value" header lines
     * @param  callable(string $chunk): void  $onChunk  called once per
     *         chunk of raw response body bytes, in order, as they arrive
     * @return array{status: int, succeeded: bool, error: string} HTTP
     *         status code (0 if the request never got a response),
     *         whether the transfer completed without a transport-level
     *         error, and a human-readable error description when it didn't
     */
    public function stream(
        string $url,
        array $headers,
        string $payload,
        int $timeoutSeconds,
        int $connectTimeoutSeconds,
        callable $onChunk,
    ): array;
}
