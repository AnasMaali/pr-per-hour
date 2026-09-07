<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\GroqStreamTransport;
use CurlHandle;

/**
 * Native PHP curl implementation of GroqStreamTransport, using
 * CURLOPT_WRITEFUNCTION so response bytes reach $onChunk the moment curl's
 * own read loop sees them on the socket.
 *
 * This deliberately bypasses Laravel's HTTP client (Guzzle). Measurement
 * during the streaming-UX pass showed that Guzzle's `stream => true`
 * option — backed by its default synchronous curl handler — does not
 * release upstream chunks to `StreamInterface::read()` as they arrive: a
 * fixed-cadence upstream test (three fragments, ~1.5s apart) delivered
 * everything from the second chunk onward in a single burst timed to when
 * the upstream connection closed, not when each chunk was actually sent.
 * CURLOPT_WRITEFUNCTION does not have that limitation.
 */
final class CurlGroqStreamTransport implements GroqStreamTransport
{
    public function stream(
        string $url,
        array $headers,
        string $payload,
        int $timeoutSeconds,
        int $connectTimeoutSeconds,
        callable $onChunk,
    ): array {
        $handle = curl_init();

        if ($handle === false) {
            return ['status' => 0, 'succeeded' => false, 'error' => 'Failed to initialize the streaming transport.'];
        }

        curl_setopt_array($handle, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $payload,
            // No CURLOPT_RETURNTRANSFER: $onChunk receives bytes
            // incrementally instead of curl buffering the whole body.
            CURLOPT_TIMEOUT => $timeoutSeconds,
            CURLOPT_CONNECTTIMEOUT => $connectTimeoutSeconds,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_WRITEFUNCTION => static function (CurlHandle $curlHandle, string $chunk) use ($onChunk): int {
                $onChunk($chunk);

                // curl aborts the transfer as an error unless the callback
                // reports having consumed every byte it was handed.
                return strlen($chunk);
            },
        ]);

        $succeeded = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $error = curl_error($handle);
        curl_close($handle);

        return [
            'status' => $status,
            'succeeded' => $succeeded !== false,
            'error' => $error,
        ];
    }
}
