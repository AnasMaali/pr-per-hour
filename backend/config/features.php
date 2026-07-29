<?php

declare(strict_types=1);

use App\Support\EnvBoolean;

return [
    /*
    |--------------------------------------------------------------------------
    | Product feature switches
    |--------------------------------------------------------------------------
    |
    | Version 1 launches the public site, authentication, service catalogue,
    | contact messages and admin management. Future modules remain in the
    | codebase/database, but their HTTP routes stay disabled until explicitly
    | enabled in a later release.
    |
    | Booleans are parsed safely: the string "false" / "0" / "off" / "no"
    | must never cast to true (unlike PHP's (bool) string cast).
    |
    */
    'bookings' => EnvBoolean::get('FEATURE_BOOKINGS_ENABLED', false),
    'chatbot' => EnvBoolean::get('FEATURE_CHATBOT_ENABLED', false),
    'payments' => EnvBoolean::get('FEATURE_PAYMENTS_ENABLED', false),
    'invoices' => EnvBoolean::get('FEATURE_INVOICES_ENABLED', false),
];
