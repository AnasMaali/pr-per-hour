<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS) Configuration
|--------------------------------------------------------------------------
|
| Allowed origins come from CORS_ALLOWED_ORIGINS (comma-separated).
| Production must set explicit SPA origins. Local development defaults
| are used only when the variable is missing or blank (see .env.example).
|
| This API uses Sanctum Bearer tokens (Authorization header), not cookie
| sessions. supports_credentials remains false. Wildcard "*" is never
| accepted — especially important if credentials are enabled later.
|
*/

$parseOrigins = static function (?string $value): array {
    $defaults = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    if ($value === null || trim($value) === '') {
        return $defaults;
    }

    $origins = array_map(
        static fn (string $origin): string => trim($origin),
        explode(',', $value),
    );

    $origins = array_values(array_filter(
        $origins,
        static fn (string $origin): bool => $origin !== '' && $origin !== '*',
    ));

    return $origins !== [] ? $origins : $defaults;
};

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $parseOrigins(env('CORS_ALLOWED_ORIGINS')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-Locale',
        'X-Request-ID',
    ],

    'exposed_headers' => [
        'X-Request-ID',
        'Content-Language',
    ],

    'max_age' => 0,

    /*
    | Bearer-token SPA auth does not send cookies cross-origin.
    | Keep false. Never pair true with allowed_origins "*".
    */
    'supports_credentials' => false,

];
