<?php

declare(strict_types=1);

use App\Support\EnvBoolean;

/**
 * Cloudflare Turnstile (server-side verification only).
 * Never expose TURNSTILE_SECRET_KEY to the frontend.
 */
return [

    'enabled' => EnvBoolean::get('TURNSTILE_ENABLED', false),

    'secret_key' => (string) env('TURNSTILE_SECRET_KEY', ''),

    /*
    | Comma-separated hostnames allowed in the Siteverify response.
    | Empty list skips hostname checks (useful in automated tests).
    */
    'expected_hostnames' => array_values(array_filter(array_map(
        static fn (string $host): string => strtolower(trim($host)),
        explode(',', (string) env('TURNSTILE_EXPECTED_HOSTNAMES', '')),
    ), static fn (string $host): bool => $host !== '')),

    'timeout_seconds' => max(1, min(30, (int) env('TURNSTILE_TIMEOUT_SECONDS', 8))),

    'siteverify_url' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',

];
