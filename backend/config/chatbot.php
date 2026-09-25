<?php

declare(strict_types=1);

return [
    'assistant' => [
        'name' => 'PRIA',
    ],

    /*
    |--------------------------------------------------------------------------
    | AI provider
    |--------------------------------------------------------------------------
    |
    | The chatbot must never depend directly on one AI vendor.
    | "fallback" keeps PRIA operational without an external provider.
    |
    */
    'ai' => [
        'driver' => env('CHATBOT_AI_DRIVER', 'fallback'),

        'model' => env(
            'CHATBOT_AI_MODEL',
            'qwen/qwen3.8-27b',
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

    /*
    |--------------------------------------------------------------------------
    | Organizations PR Per Hour Has Worked With
    |--------------------------------------------------------------------------
    |
    | Authoritative list used by PRIA. "Worked with" is intentionally used
    | instead of assuming every relationship was a client or partnership.
    |
    */
    'worked_with' => [
        [
            'name_en' => 'Al-Quds Open University',
            'name_ar' => 'جامعة القدس المفتوحة',
            'type_en' => 'Public University • Blended Learning',
            'type_ar' => 'جامعة عامة • تعليم مدمج',
        ],
        [
            'name_en' => 'Koton',
            'name_ar' => 'Koton',
            'type_en' => 'Global Fashion & Retail',
            'type_ar' => 'أزياء وتجزئة عالمية',
        ],
        [
            'name_en' => 'Karawan Studio',
            'name_ar' => 'ستوديو الكروان ديجيتال',
            'type_en' => 'Photography & Digital Production',
            'type_ar' => 'تصوير • إنتاج رقمي',
        ],
        [
            'name_en' => "Rural Women's Development Society (RWDS)",
            'name_ar' => 'جمعية تنمية المرأة الريفية',
            'type_en' => 'Palestinian Nonprofit Organization',
            'type_ar' => 'مؤسسة أهلية فلسطينية غير ربحية',
        ],
        [
            'name_en' => 'Dyarna Real Estate Development & Investment',
            'name_ar' => 'شركة ديارنا للتطوير العقاري والاستثمار',
            'type_en' => 'Real Estate Development & Investment',
            'type_ar' => 'تطوير عقاري • استثمار',
        ],
        [
            'name_en' => 'REFORM',
            'name_ar' => 'المؤسسة الفلسطينية للتمكين والتنمية المحلية - REFORM',
            'type_en' => 'Independent Nonprofit Organization',
            'type_ar' => 'منظمة أهلية مستقلة غير ربحية',
        ],
        [
            'name_en' => 'Nablus Municipality',
            'name_ar' => 'بلدية نابلس',
            'type_en' => 'Municipality • Public Services',
            'type_ar' => 'هيئة محلية • خدمات عامة',
        ],
        [
            'name_en' => 'Palestinian Business Forum',
            'name_ar' => 'ملتقى رجال الأعمال الفلسطيني',
            'type_en' => 'Independent Nonprofit Organization',
            'type_ar' => 'مؤسسة أهلية مستقلة غير ربحية',
        ],
        [
            'name_en' => 'Al Qaser Hotel',
            'name_ar' => 'فندق القصر',
            'type_en' => 'Hotel • Hospitality',
            'type_ar' => 'فندق • ضيافة',
        ],
        [
            'name_en' => 'Tajer',
            'name_ar' => 'Tajer',
            'type_en' => 'Company',
            'type_ar' => 'شركة',
        ],
        [
            'name_en' => 'Mohandam',
            'name_ar' => 'مهندم',
            'type_en' => "Men's Fashion",
            'type_ar' => 'أزياء رجالية',
        ],
    ],

];
