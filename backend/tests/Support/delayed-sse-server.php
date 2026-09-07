<?php

declare(strict_types=1);

// Tiny script run under PHP's built-in server (`php -S`) by
// CurlGroqStreamTransportTest. Writes a configurable sequence of raw body
// fragments with a real delay between each, so the test can prove that
// CurlGroqStreamTransport::stream() receives them incrementally as they
// are sent rather than only once the connection closes. Configuration
// comes from environment variables set by the test before the server
// process is spawned.

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: close');

$fragments = json_decode((string) getenv('DELAYED_SSE_FRAGMENTS'), true);
$fragments = is_array($fragments) ? $fragments : [];
$delayMicroseconds = max(0, (int) getenv('DELAYED_SSE_DELAY_MICROSECONDS'));

foreach ($fragments as $index => $fragment) {
    if ($index > 0 && $delayMicroseconds > 0) {
        usleep($delayMicroseconds);
    }

    echo $fragment;

    if (ob_get_level() > 0) {
        @ob_flush();
    }

    flush();
}
