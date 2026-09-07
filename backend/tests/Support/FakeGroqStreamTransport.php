<?php

declare(strict_types=1);

namespace Tests\Support;

use App\Features\Chatbot\Contracts\GroqStreamTransport;

/**
 * Deterministic test double for GroqStreamTransport. Exists because the
 * real streaming path bypasses Laravel's HTTP client (Guzzle) in favor of
 * a native curl handle, so Http::fake() cannot intercept it — this is
 * bound into the container instead, the same role Http::fake() plays for
 * the non-streaming generate() path.
 *
 * Supports a per-chunk delay so integration tests can prove that
 * downstream SSE events become observable as chunks arrive rather than
 * only once the whole (fake) transfer finishes.
 */
final class FakeGroqStreamTransport implements GroqStreamTransport
{
    public int $callCount = 0;

    /** @var list<array{url: string, headers: list<string>, payload: string}> */
    public array $calls = [];

    /**
     * @param  list<string>  $chunks  raw response body chunks, delivered to
     *         $onChunk in order
     * @param  list<int>  $delayMicrosecondsBeforeChunk  optional per-chunk
     *         delay (parallel array to $chunks, indexed the same way)
     *         applied via usleep() immediately before delivering that
     *         chunk, to simulate genuine upstream pacing
     */
    public function __construct(
        private readonly array $chunks,
        private readonly array $delayMicrosecondsBeforeChunk = [],
        private readonly int $status = 200,
        private readonly bool $succeeded = true,
        private readonly string $error = '',
    ) {}

    public function stream(
        string $url,
        array $headers,
        string $payload,
        int $timeoutSeconds,
        int $connectTimeoutSeconds,
        callable $onChunk,
    ): array {
        $this->callCount++;
        $this->calls[] = ['url' => $url, 'headers' => $headers, 'payload' => $payload];

        foreach ($this->chunks as $index => $chunk) {
            $delay = $this->delayMicrosecondsBeforeChunk[$index] ?? 0;

            if ($delay > 0) {
                usleep($delay);
            }

            $onChunk($chunk);
        }

        return [
            'status' => $this->status,
            'succeeded' => $this->succeeded,
            'error' => $this->error,
        ];
    }
}
