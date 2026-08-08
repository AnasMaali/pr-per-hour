<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Version 2 Master Switch
    |--------------------------------------------------------------------------
    |
    | V2 functionality must remain disabled by default.
    | Individual modules cannot be considered active unless V2 development
    | explicitly enables and implements them.
    |
    */

    'enabled' => env('V2_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Version 2 Modules
    |--------------------------------------------------------------------------
    |
    | Status values describe development maturity only.
    |
    | proposed   = Possible future module, not approved for implementation.
    | foundation = Some reusable technical foundation already exists.
    | development = Currently being implemented.
    | testing    = Implementation complete and under verification.
    | ready      = Approved technically but not released.
    | released   = Released as part of an approved V2 deployment.
    |
    */

    'bookings' => [
        'calendar_mode' => env('V2_BOOKING_CALENDAR_MODE', 'shared'),
        'default_calendar_slug' => env(
            'V2_BOOKING_DEFAULT_CALENDAR_SLUG',
            'pr-per-hour-shared'
        ),
        'default_calendar_timezone' => env(
            'V2_BOOKING_DEFAULT_CALENDAR_TIMEZONE',
            'Asia/Hebron'
        ),
        'slot_step_minutes' => (int) env(
            'V2_BOOKING_SLOT_STEP_MINUTES',
            30
        ),
    ],

    'modules' => [

        'payments' => [
            'enabled' => env('V2_PAYMENTS_ENABLED', false),
            'status' => 'foundation',
        ],

        'invoices' => [
            'enabled' => env('V2_INVOICES_ENABLED', false),
            'status' => 'foundation',
        ],

        'consultants' => [
            'enabled' => env('V2_CONSULTANTS_ENABLED', false),
            'status' => 'proposed',
        ],

        'advanced_scheduling' => [
            'enabled' => env('V2_ADVANCED_SCHEDULING_ENABLED', false),
            'status' => 'development',
        ],

        'roles_permissions' => [
            'enabled' => env('V2_ROLES_PERMISSIONS_ENABLED', false),
            'status' => 'proposed',
        ],

        'crm' => [
            'enabled' => env('V2_CRM_ENABLED', false),
            'status' => 'proposed',
        ],

        'leads' => [
            'enabled' => env('V2_LEADS_ENABLED', false),
            'status' => 'proposed',
        ],

        'coupons' => [
            'enabled' => env('V2_COUPONS_ENABLED', false),
            'status' => 'proposed',
        ],

        'advanced_chatbot' => [
            'enabled' => env('V2_ADVANCED_CHATBOT_ENABLED', false),
            'status' => 'proposed',
        ],

        'knowledge_base' => [
            'enabled' => env('V2_KNOWLEDGE_BASE_ENABLED', false),
            'status' => 'proposed',
        ],

        'analytics' => [
            'enabled' => env('V2_ANALYTICS_ENABLED', false),
            'status' => 'proposed',
        ],

        'cms' => [
            'enabled' => env('V2_CMS_ENABLED', false),
            'status' => 'proposed',
        ],

        'blog' => [
            'enabled' => env('V2_BLOG_ENABLED', false),
            'status' => 'proposed',
        ],

        'notifications' => [
            'enabled' => env('V2_NOTIFICATIONS_ENABLED', false),
            'status' => 'proposed',
        ],

    ],

];
