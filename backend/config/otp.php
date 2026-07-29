<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | One-time code settings
    |--------------------------------------------------------------------------
    |
    | Used for email verification and password-reset codes. Plain codes are
    | never stored; only keyed HMAC digests are persisted.
    |
    */

    'length' => (int) env('OTP_CODE_LENGTH', 6),

    'expires_minutes' => (int) env('OTP_EXPIRES_MINUTES', 10),

    'max_attempts' => (int) env('OTP_MAX_ATTEMPTS', 5),

    'resend_seconds' => (int) env('OTP_RESEND_SECONDS', 60),

    /*
    |--------------------------------------------------------------------------
    | Cleanup retention
    |--------------------------------------------------------------------------
    |
    | Used and expired rows older than this many days are removed by otp:prune.
    |
    */

    'prune_after_days' => (int) env('OTP_PRUNE_AFTER_DAYS', 7),

];
