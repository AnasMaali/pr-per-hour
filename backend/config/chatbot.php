<?php

declare(strict_types=1);

return [
    'assistant' => [
        'name' => 'PRIA AI',
    ],

    /*
    |--------------------------------------------------------------------------
    | AI provider
    |--------------------------------------------------------------------------
    |
    | The chatbot must never depend directly on one AI vendor.
    | "fallback" keeps PRIA AI operational without an external provider.
    |
    */
    'ai' => [
        'driver' => env('CHATBOT_AI_DRIVER', 'fallback'),

        'model' => env(
            'CHATBOT_AI_MODEL',
            'qwen/qwen3.6-27b',
        ),

        'history_messages' => (int) env(
            'CHATBOT_AI_HISTORY_MESSAGES',
            12,
        ),

        'max_output_tokens' => (int) env(
            'CHATBOT_AI_MAX_OUTPUT_TOKENS',
            500,
        ),

        'timeout_seconds' => (int) env(
            'CHATBOT_AI_TIMEOUT_SECONDS',
            10,
        ),

        // Groq's documented "instruct / non-thinking" defaults for the Qwen3
        // family (qwen3.6-27b and qwen3.8-27b alike): temperature 0.7,
        // top_p 0.80. Kept configurable per environment rather than
        // hard-coded, since a future model swap may recommend different
        // values.
        'temperature' => (float) env(
            'CHATBOT_AI_TEMPERATURE',
            0.7,
        ),

        'top_p' => (float) env(
            'CHATBOT_AI_TOP_P',
            0.8,
        ),
    ],

    'groq' => [
        'api_key' => env('GROQ_API_KEY'),

        'base_url' => env(
            'GROQ_BASE_URL',
            'https://api.groq.com/openai/v1',
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Company knowledge
    |--------------------------------------------------------------------------
    |
    | Static company facts live here.
    | Services and categories are loaded dynamically from the database.
    |
    */
    'company' => [
        'name' => 'PR Per Hour',

        'website' => 'https://prperhour.com',

        'email' => 'info@prperhour.com',

        'phone' => '+970 593486465',

        'description' => 'PR Per Hour is a strategic communication, public relations, training, data, AI, and technology consultancy.',

        // Canonical bilingual leadership names. The model must never be
        // trusted to transliterate these itself (it has previously produced
        // "أناس مالي" and "فاتنا مالي"), so both exact forms are supplied
        // here and echoed verbatim in the system prompt's CANONICAL NAMES
        // rule, with AnasResponseQualityGuard as a deterministic backstop.
        'leadership' => [
            [
                'name_en' => 'Fatina Maali',
                'name_ar' => 'فاتنة معالي',
                'role' => 'Founder & Principal Consultant',
                'role_ar' => 'المؤسس والمستشار الرئيسي',
                'expertise' => [
                    'Public Relations & Advertising',
                    'Strategic Communication',
                    'Corporate Training',
                    'Public Relations',
                ],
            ],
            [
                'name_en' => 'Anas Maali',
                'name_ar' => 'أنس معالي',
                'role' => 'Head of Technology',
                'role_ar' => 'رئيس قسم التكنولوجيا',
                'expertise' => [
                    'Data Analytics & Business Intelligence',
                    'Artificial Intelligence & Automation',
                    'Software & Digital Solutions',
                    'Technology Strategy',
                ],
            ],
        ],
    ],
];
