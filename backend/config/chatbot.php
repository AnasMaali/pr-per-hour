<?php

declare(strict_types=1);

return [
    'assistant' => [
        'name' => 'Anas',
    ],

    /*
    |--------------------------------------------------------------------------
    | AI provider
    |--------------------------------------------------------------------------
    |
    | The chatbot must never depend directly on one AI vendor.
    | "fallback" keeps Anas operational without an external provider.
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

        'leadership' => [
            [
                'name' => 'Fatina Maali',
                'role' => 'Founder & Principal Consultant',
                'expertise' => [
                    'Public Relations & Advertising',
                    'Strategic Communication',
                    'Corporate Training',
                    'Public Relations',
                ],
            ],
            [
                'name' => 'Anas Maali',
                'role' => 'Head of Technology',
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
