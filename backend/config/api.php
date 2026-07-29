<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Named Rate Limiters
    |--------------------------------------------------------------------------
    |
    | Development defaults. Validate and tune thresholds for production.
    |
    */

    'rate_limits' => [
        'api' => (int) env('RATE_LIMIT_API', 60),
        'auth' => (int) env('RATE_LIMIT_AUTH', 5),
        'contact' => (int) env('RATE_LIMIT_CONTACT', 5),
        'chatbot' => (int) env('RATE_LIMIT_CHATBOT', 20),
        'auth_email_verification_code' => (int) env('RATE_LIMIT_AUTH_EMAIL_VERIFICATION_CODE', 5),
        'auth_email_verify' => (int) env('RATE_LIMIT_AUTH_EMAIL_VERIFY', 10),
        'auth_password_forgot' => (int) env('RATE_LIMIT_AUTH_PASSWORD_FORGOT', 5),
        'auth_password_reset' => (int) env('RATE_LIMIT_AUTH_PASSWORD_RESET', 10),
    ],

];
