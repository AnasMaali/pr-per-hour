<?php

declare(strict_types=1);

namespace Tests\Unit\Chatbot;

use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use PHPUnit\Framework\TestCase;

final class AnasResponseQualityGuardTest extends TestCase
{
    private AnasResponseQualityGuard $guard;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guard = new AnasResponseQualityGuard;
    }

    // -----------------------------------------------------------------
    // Real-time claim softening
    // -----------------------------------------------------------------

    public function test_softens_arabic_realtime_claim_bshkl_lhzy(): void
    {
        $result = $this->guard->evaluate('يمكن للإدارة متابعة المؤشرات بشكل لحظي.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('بشكل لحظي', $result->text);
        $this->assertStringContainsString('آلية تحديث', $result->text);
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_softens_arabic_realtime_data_update_claim(): void
    {
        $result = $this->guard->evaluate('توفر الخدمة تحديث لحظي للبيانات.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('تحديث لحظي', $result->text);
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_leaves_safe_ordinary_arabic_dashboard_language_unchanged(): void
    {
        $text = 'يمكن متابعة المؤشرات من لوحة موحدة.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
        $this->assertNotContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_never_touches_the_legitimate_word_mubasher_alone(): void
    {
        $text = 'طيب وإذا بدي أشوف النتائج بشكل مباشر للإدارة، شو بتنصحني كمان؟';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
        $this->assertStringContainsString('بشكل مباشر', $result->text);
    }

    public function test_softens_english_realtime_dashboard_claim(): void
    {
        $result = $this->guard->evaluate('Management can monitor KPIs on a real-time dashboard.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('real-time dashboard', strtolower($result->text));
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_softens_english_instant_synchronization_claim(): void
    {
        $result = $this->guard->evaluate('The tool provides instant synchronization with your CRM.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('instant synchronization', strtolower($result->text));
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_softens_bare_in_real_time_phrase(): void
    {
        $result = $this->guard->evaluate('Management can monitor KPIs in real time.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('real time', strtolower($result->text));
        $this->assertStringNotContainsString('real-time', strtolower($result->text));
    }

    public function test_leaves_safe_ordinary_english_dashboard_language_unchanged(): void
    {
        $text = 'You can monitor KPIs from one unified dashboard.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
    }

    // -----------------------------------------------------------------
    // Unexpected script (homoglyph) detection
    // -----------------------------------------------------------------

    public function test_repairs_arabic_reply_with_a_mixed_latin_cyrillic_token_locally(): void
    {
        $result = $this->guard->evaluate('هذا cepвис يتيح لنا التحويل من مجرد أرقام إلى رؤى واضحة.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('cepвис', $result->text);
        $this->assertStringContainsString('الخدمة', $result->text);
        $this->assertContains('unexpected_script_repaired', $result->issues);
    }

    public function test_repairs_english_reply_with_a_mixed_latin_cyrillic_token_locally(): void
    {
        $result = $this->guard->evaluate('This is a great cepвис for your business.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('cepвис', $result->text);
        $this->assertStringContainsString('service', $result->text);
        $this->assertContains('unexpected_script_repaired', $result->issues);
    }

    public function test_rejects_text_containing_a_whole_word_in_greek_no_latin_mixed_in(): void
    {
        $result = $this->guard->evaluate('This includes a στρατηγική analysis phase.');

        $this->assertFalse($result->accepted);
        $this->assertContains('unexpected_script', $result->issues);
    }

    public function test_rejects_text_containing_a_whole_word_in_cyrillic_no_latin_mixed_in(): void
    {
        $result = $this->guard->evaluate('مرحباً привет كيف حالك.');

        $this->assertFalse($result->accepted);
        $this->assertContains('unexpected_script', $result->issues);
    }

    public function test_accepts_arabic_reply_with_official_english_service_titles(): void
    {
        $text = 'أنسب نقطة بداية إلك هي **Data Analysis & Business Intelligence** من PR Per Hour.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
    }

    public function test_accepts_normal_english_reply(): void
    {
        $text = 'PR Per Hour offers strategic communication and public relations services.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
    }

    public function test_does_not_falsely_reject_numerals_punctuation_email_and_url(): void
    {
        $text = 'تواصل معنا عبر info@prperhour.com أو https://prperhour.com، أو اتصل على +970 593486465. لدينا 24 خدمة.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
    }

    public function test_does_not_reject_arabic_reply_purely_for_containing_english_service_titles(): void
    {
        $text = 'نوصي بخدمة Dashboards & Decision Support كخدمة مكملة لتحليل البيانات.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
    }

    public function test_blank_response_is_rejected(): void
    {
        $result = $this->guard->evaluate('   ');

        $this->assertFalse($result->accepted);
        $this->assertContains('blank_response', $result->issues);
    }
}
