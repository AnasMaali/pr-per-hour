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

    public function test_knowledge_contains_company_and_leadership_facts(): void
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
            'Founder & Principal Consultant',
            $context,
        );

        $this->assertStringContainsString(
            'Anas Maali',
            $context,
        );

        $this->assertStringContainsString(
            'Head of Technology',
            $context,
        );
    }

    public function test_system_prompt_defines_anas_safely(): void
    {
        $prompt = app(
            AnasSystemPromptBuilder::class,
        )->build();

        $this->assertStringContainsString(
            'official AI assistant for PR Per Hour',
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
            'default to concise',
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
