<?php

declare(strict_types=1);

namespace Tests\Feature\Chatbot;

use App\Features\Chatbot\Support\AnasSystemPromptBuilder;
use App\Features\Chatbot\Support\PrPerHourKnowledgeBuilder;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ChatbotKnowledgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_knowledge_uses_active_database_catalog(): void
    {
        $activeCategory = ServiceCategory::factory()->create([
            'name' => 'Data, AI & Technology',
            'is_active' => true,
        ]);

        $activeService = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'title' => 'AI Solutions & Automation',
            'description' => 'Practical AI automation.',
            'is_active' => true,
        ]);

        Service::factory()->create([
            'category_id' => $activeCategory->id,
            'title' => 'Hidden Service',
            'is_active' => false,
        ]);

        $inactiveCategory = ServiceCategory::factory()->create([
            'name' => 'Inactive Category',
            'is_active' => false,
        ]);

        Service::factory()->create([
            'category_id' => $inactiveCategory->id,
            'title' => 'Inactive Category Service',
            'is_active' => true,
        ]);

        $context = app(
            PrPerHourKnowledgeBuilder::class,
        )->toPromptContext();

        $this->assertStringContainsString(
            'Data, AI & Technology',
            $context,
        );

        $this->assertStringContainsString(
            $activeService->title,
            $context,
        );

        $this->assertStringNotContainsString(
            'Hidden Service',
            $context,
        );

        $this->assertStringNotContainsString(
            'Inactive Category',
            $context,
        );
    }

    public function test_knowledge_contains_company_and_bilingual_leadership_facts(): void
    {
        $context = app(
            PrPerHourKnowledgeBuilder::class,
        )->toPromptContext();

        $this->assertStringContainsString(
            'PR Per Hour',
            $context,
        );

        $this->assertStringContainsString(
            'Fatina Maali',
            $context,
        );

        $this->assertStringContainsString(
            'فاتنة معالي',
            $context,
        );

        $this->assertStringContainsString(
            'Founder & Principal Consultant',
            $context,
        );

        $this->assertStringContainsString(
            'Anas Maali',
            $context,
        );

        $this->assertStringContainsString(
            'أنس معالي',
            $context,
        );

        $this->assertStringContainsString(
            'Head of Technology',
            $context,
        );

        $this->assertStringContainsString(
            'المؤسس والمستشار الرئيسي',
            $context,
        );

        $this->assertStringContainsString(
            'رئيس قسم التكنولوجيا',
            $context,
        );
    }

    public function test_knowledge_keeps_data_ai_technology_and_training_categories_distinct(): void
    {
        $dataAiTechnology = ServiceCategory::factory()->create([
            'name' => 'Data, AI & Technology',
            'is_active' => true,
        ]);

        $training = ServiceCategory::factory()->create([
            'name' => 'Training & Capacity Building',
            'is_active' => true,
        ]);

        foreach ([
            'Data Analysis & Business Intelligence',
            'AI Solutions & Automation',
            'Dashboards & Decision Support',
            'Software & Digital Solutions',
            'Technology & AI Consulting',
        ] as $title) {
            Service::factory()->create([
                'category_id' => $dataAiTechnology->id,
                'title' => $title,
                'is_active' => true,
            ]);
        }

        Service::factory()->create([
            'category_id' => $training->id,
            'title' => 'AI in Strategic Communication',
            'is_active' => true,
        ]);

        $knowledge = app(PrPerHourKnowledgeBuilder::class)->build();

        $categoriesByName = collect($knowledge['service_categories'])
            ->keyBy('name');

        $dataAiTitles = collect($categoriesByName['Data, AI & Technology']['services'])
            ->pluck('title')
            ->all();

        $this->assertEqualsCanonicalizing([
            'Data Analysis & Business Intelligence',
            'AI Solutions & Automation',
            'Dashboards & Decision Support',
            'Software & Digital Solutions',
            'Technology & AI Consulting',
        ], $dataAiTitles);

        $trainingTitles = collect($categoriesByName['Training & Capacity Building']['services'])
            ->pluck('title')
            ->all();

        $this->assertContains('AI in Strategic Communication', $trainingTitles);
        $this->assertNotContains('AI in Strategic Communication', $dataAiTitles);
    }

    public function test_system_prompt_defines_pria_ai_safely(): void
    {
        $prompt = app(
            AnasSystemPromptBuilder::class,
        )->build();

        $this->assertStringContainsString(
            'official AI assistant for PR Per Hour',
            $prompt,
        );

        $this->assertStringContainsString(
            'You are PRIA',
            $prompt,
        );

        $this->assertStringContainsString(
            'You are not Anas Maali',
            $prompt,
        );

        $this->assertStringContainsString(
            'Never invent a service',
            $prompt,
        );

        $this->assertStringContainsString(
            'automatically respond in the language',
            strtolower($prompt),
        );
    }

    public function test_system_prompt_defines_exact_canonical_names(): void
    {
        $prompt = app(AnasSystemPromptBuilder::class)->build();

        $this->assertStringContainsString('أنس معالي', $prompt);
        $this->assertStringContainsString('فاتنة معالي', $prompt);
        $this->assertStringContainsString('Anas Maali', $prompt);
        $this->assertStringContainsString('Fatina Maali', $prompt);
        $this->assertStringContainsString('never transliterate', strtolower($prompt));
    }

    public function test_system_prompt_forbids_unprompted_leadership_mentions(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'do not introduce fatina maali or anas maali into a normal service answer',
            $prompt,
        );
    }

    public function test_system_prompt_requires_gender_neutral_arabic(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('gender-neutral arabic', $prompt);
        $this->assertStringContainsString('تودين', $prompt);
        $this->assertStringContainsString('تفضلين', $prompt);
        $this->assertStringContainsString('never default to masculine forms either', $prompt);
    }

    public function test_system_prompt_defines_service_catalog_rules(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('service catalog rules', $prompt);
        $this->assertStringContainsString('never move a service to a different category', $prompt);
        $this->assertStringContainsString('ai in strategic communication', $prompt);
    }

    public function test_system_prompt_distinguishes_facts_from_possible_outcomes(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('claim calibration', $prompt);
        $this->assertStringContainsString('known fact', $prompt);
        $this->assertStringContainsString('possible service outcome', $prompt);
        $this->assertStringContainsString('hypothetical example', $prompt);
    }

    public function test_system_prompt_forbids_filler_language_and_repeated_greetings(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('no filler', $prompt);
        $this->assertStringContainsString('أهلاً بك مجدداً', $prompt);
        $this->assertStringContainsString('يسعدني أن', $prompt);
    }

    public function test_system_prompt_defines_factual_and_recommendation_answer_structure(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('answer structure', $prompt);
        $this->assertStringContainsString('direct answer -> one useful supporting fact if needed -> stop', $prompt);
        $this->assertStringContainsString(
            'primary service -> why it fits -> optional one complementary service -> optional one useful next question',
            $prompt,
        );
    }

    public function test_system_prompt_requires_a_silent_single_call_quality_self_check(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('final quality self-check', $prompt);
        $this->assertStringContainsString('never make a second request to generate a reply', $prompt);
    }

    public function test_system_prompt_contains_anti_overclaim_rules(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString('anti-overclaim', $prompt);

        $this->assertStringContainsString(
            'never imply that pr per hour has already analyzed the visitor',
            $prompt,
        );

        $this->assertStringContainsString(
            'never guarantee outcomes',
            $prompt,
        );
    }

    public function test_system_prompt_forbids_unsubstantiated_real_time_claims(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'never claim real-time, live, instant synchronization, or automatic',
            $prompt,
        );
    }

    public function test_system_prompt_discourages_repeated_greetings(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'greet naturally only once',
            $prompt,
        );

        $this->assertStringContainsString(
            'on follow-up turns, do not greet again',
            $prompt,
        );
    }

    public function test_system_prompt_requires_concise_responses(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'answer first. explain only what is necessary. stop.',
            $prompt,
        );

        $this->assertStringContainsString(
            'roughly 60-150 words',
            $prompt,
        );

        $this->assertStringContainsString(
            'do not copy a service',
            $prompt,
        );

        $this->assertStringContainsString(
            'one primary service',
            $prompt,
        );
    }

    public function test_system_prompt_maintains_arabic_and_english_language_behavior(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'polished, professional english',
            $prompt,
        );

        $this->assertStringContainsString(
            'natural, modern arabic',
            $prompt,
        );

        $this->assertStringContainsString(
            'match the visitor\'s register',
            $prompt,
        );
    }

    public function test_system_prompt_restricts_markdown_to_chat_friendly_formatting(): void
    {
        $prompt = $this->normalizedPrompt();

        $this->assertStringContainsString(
            'do not use markdown headings',
            $prompt,
        );
    }

    /**
     * Lowercased, whitespace-collapsed prompt text so substring assertions
     * don't depend on exactly where the heredoc source wraps a line.
     */
    private function normalizedPrompt(): string
    {
        $prompt = app(AnasSystemPromptBuilder::class)->build();

        return preg_replace('/\s+/', ' ', strtolower($prompt));
    }
}
