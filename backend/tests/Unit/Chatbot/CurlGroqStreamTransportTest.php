<?php

declare(strict_types=1);

namespace Tests\Unit\Chatbot;

use App\Features\Chatbot\Providers\CurlGroqStreamTransport;
use PHPUnit\Framework\TestCase;

/**
 * Proves, against a real local HTTP server (not a fake), that
 * CurlGroqStreamTransport delivers response bytes to its callback as they
 * arrive rather than only once the connection closes.
 *
 * This is the regression test for the transport-level buffering bug: an
 * earlier implementation built on Laravel's HTTP client (Guzzle, via
 * `Http::withOptions(['stream' => true])`) was measured — using this same
 * delayed-fragment technique against a real socket — to deliver a
 * multi-second-spaced sequence of upstream writes to the application in
 * only two bursts, timed to the connection's close rather than to when
 * each fragment was actually sent. Pointing this test at that
 * implementation instead of CurlGroqStreamTransport reproduces the
 * failure: the gap this test asserts on collapses to near zero.
 */
final class CurlGroqStreamTransportTest extends TestCase
{
    private int $port;

    /** @var resource|null */
    private $serverProcess;

    protected function tearDown(): void
    {
        if (is_resource($this->serverProcess)) {
            proc_terminate($this->serverProcess);
            proc_close($this->serverProcess);
        }

        parent::tearDown();
    }

    public function test_response_bytes_are_delivered_incrementally_not_only_at_connection_close(): void
    {
        // The server's environment must be fully set BEFORE it is spawned:
        // proc_open() copies the environment at spawn time, so putenv()
        // calls made afterward would never reach the child process.
        $this->port = $this->reserveEphemeralPort();
        $this->serverProcess = $this->startDelayedSseServer($this->port, [
            'DELAYED_SSE_FRAGMENTS' => json_encode([
                "data: fragment-one\n\n",
                "data: fragment-two\n\n",
                "data: fragment-three\n\n",
            ]),
            'DELAYED_SSE_DELAY_MICROSECONDS' => '150000',
        ]);
        $this->waitUntilServerAcceptsConnections($this->port);

        $timings = [];
        $transport = new CurlGroqStreamTransport;

        $result = $transport->stream(
            "http://127.0.0.1:{$this->port}/",
            [],
            '',
            timeoutSeconds: 10,
            connectTimeoutSeconds: 5,
            onChunk: function (string $chunk) use (&$timings): void {
                $timings[] = microtime(true);
            },
        );

        $this->assertTrue($result['succeeded'], 'The streaming request itself must succeed: '.$result['error']);
        $this->assertGreaterThanOrEqual(
            2,
            count($timings),
            'Expected the response body to arrive as at least two separate write-function calls.',
        );

        $firstChunkAt = $timings[0];
        $lastChunkAt = $timings[array_key_last($timings)];

        // Two 150ms server-side delays between three fragments means
        // genuinely incremental delivery must span at least ~200ms
        // between the first and last callback invocation (kept below the
        // full ~300ms to absorb CI scheduling jitter without becoming
        // fragile). A transport that only releases bytes once the
        // connection closes would show this gap as close to zero
        // regardless of the configured server-side delay — that is
        // exactly the bug this test exists to catch.
        $this->assertGreaterThan(
            0.2,
            $lastChunkAt - $firstChunkAt,
            'Response bytes were not delivered incrementally — they appear to have arrived in a single burst, '.
            'which means a test that only inspects content after completion would not detect the buffering bug.',
        );
    }

    private function reserveEphemeralPort(): int
    {
        $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);

        if ($socket === false) {
            self::fail("Failed to reserve an ephemeral port: {$errstr}");
        }

        $name = stream_socket_get_name($socket, false);
        fclose($socket);

        $port = (int) substr((string) $name, strrpos((string) $name, ':') + 1);

        if ($port <= 0) {
            self::fail('Failed to determine the reserved ephemeral port.');
        }

        return $port;
    }

    /**
     * @param  array<string, string>  $env
     * @return resource
     */
    private function startDelayedSseServer(int $port, array $env)
    {
        $script = realpath(__DIR__.'/../../Support/delayed-sse-server.php');

        if ($script === false) {
            self::fail('Could not resolve the delayed SSE test server script path.');
        }

        $process = proc_open(
            [PHP_BINARY, '-S', "127.0.0.1:{$port}", $script],
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
            $pipes,
            dirname($script),
            [...getenv(), ...$env],
        );

        if ($process === false) {
            self::fail('Failed to start the delayed SSE test server.');
        }

        return $process;
    }

    private function waitUntilServerAcceptsConnections(int $port): void
    {
        $deadline = microtime(true) + 5.0;

        while (microtime(true) < $deadline) {
            $connection = @fsockopen('127.0.0.1', $port, $errno, $errstr, 0.1);

            if ($connection !== false) {
                fclose($connection);

                return;
            }

            usleep(20000);
        }

        self::fail("The delayed SSE test server never started listening on port {$port}.");
    }
}
