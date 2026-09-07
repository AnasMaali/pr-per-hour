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

    /**
     * Found via a real manual benchmark run against production Groq output:
     * the model code-switched the English word "real-time" into an
     * otherwise-Arabic sentence. The fix must replace it with the Arabic
     * phrasing, not the English one — substituting English into Arabic text
     * would "fix" the overclaim while leaving the exact kind of broken
     * code-switching this guard exists to prevent.
     */
    public function test_softens_an_english_realtime_phrase_embedded_in_an_arabic_sentence_with_arabic_text(): void
    {
        $result = $this->guard->evaluate('هل يمكن أن تكون اللوحة real-time؟ لا يمكن ضمان ذلك.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('real-time', strtolower($result->text));
        $this->assertStringContainsString('بحسب آلية تحديث وربط البيانات المتاحة', $result->text);
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    public function test_softens_bare_arabic_live_data_claim(): void
    {
        $result = $this->guard->evaluate('يعتمد النظام على بيانات حية لضمان الدقة.');

        $this->assertTrue($result->accepted);
        $this->assertStringNotContainsString('بيانات حية', $result->text);
        $this->assertContains('unsupported_realtime_claim', $result->issues);
    }

    /**
     * Also found via the manual benchmark: a model stating the same
     * overclaim twice right next to each other (an Arabic phrase followed
     * by its own English gloss in parentheses) had both phrases matched
     * and replaced independently, leaving an awkward "<phrase> (<phrase>)"
     * duplicate. The guard must collapse that back to one occurrence.
     */
    public function test_collapses_a_duplicated_replacement_left_by_a_bilingual_restatement(): void
    {
        $result = $this->guard->evaluate('لا يمكن ضمان تحديث البيانات بشكل لحظي (real-time) تلقائيًا.');

        $this->assertTrue($result->accepted);
        $this->assertSame(
            1,
            substr_count($result->text, 'بحسب آلية تحديث وربط البيانات المتاحة'),
        );
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

    // -----------------------------------------------------------------
    // Canonical leadership name normalization
    // -----------------------------------------------------------------

    public function test_correct_arabic_anas_maali_spelling_is_left_unchanged(): void
    {
        $text = 'مسؤول التكنولوجيا في PR Per Hour هو أنس معالي.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
        $this->assertNotContains('canonical_name_normalized', $result->issues);
    }

    public function test_correct_arabic_fatina_maali_spelling_is_left_unchanged(): void
    {
        $text = 'المؤسسة والمستشارة الرئيسية هي فاتنة معالي.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
        $this->assertNotContains('canonical_name_normalized', $result->issues);
    }

    public function test_normalizes_anas_maali_corrupted_as_anas_mali(): void
    {
        $result = $this->guard->evaluate('مسؤول التكنولوجيا هو أناس مالي.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('أنس معالي', $result->text);
        $this->assertStringNotContainsString('أناس مالي', $result->text);
        $this->assertContains('canonical_name_normalized', $result->issues);
    }

    public function test_normalizes_anas_maali_corrupted_as_ans_mali(): void
    {
        $result = $this->guard->evaluate('مسؤول التكنولوجيا هو أنس مالي.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('أنس معالي', $result->text);
        $this->assertStringNotContainsString('أنس مالي', $result->text);
        $this->assertContains('canonical_name_normalized', $result->issues);
    }

    public function test_normalizes_anas_maali_corrupted_as_anas_maali_extra_alif(): void
    {
        $result = $this->guard->evaluate('مسؤول التكنولوجيا هو أناس معالي.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('أنس معالي', $result->text);
        $this->assertStringNotContainsString('أناس معالي', $result->text);
        $this->assertContains('canonical_name_normalized', $result->issues);
    }

    public function test_normalizes_fatina_maali_corrupted_as_fatina_mali(): void
    {
        $result = $this->guard->evaluate('المؤسسة هي فاتنا مالي.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('فاتنة معالي', $result->text);
        $this->assertStringNotContainsString('فاتنا مالي', $result->text);
        $this->assertContains('canonical_name_normalized', $result->issues);
    }

    public function test_normalizes_fatina_maali_corrupted_as_fatina_mali_alt_transliteration(): void
    {
        $result = $this->guard->evaluate('المؤسسة هي فاتينا مالي.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('فاتنة معالي', $result->text);
        $this->assertStringNotContainsString('فاتينا مالي', $result->text);
        $this->assertContains('canonical_name_normalized', $result->issues);
    }

    public function test_english_canonical_names_are_never_altered(): void
    {
        $text = 'Anas Maali is the Head of Technology, and Fatina Maali is the Founder & Principal Consultant.';

        $result = $this->guard->evaluate($text);

        $this->assertTrue($result->accepted);
        $this->assertSame($text, $result->text);
        $this->assertNotContains('canonical_name_normalized', $result->issues);
    }

    public function test_canonical_name_normalization_preserves_surrounding_markdown(): void
    {
        $result = $this->guard->evaluate('مسؤول التكنولوجيا هو **أناس مالي**، وهو يقود فريق البيانات.');

        $this->assertTrue($result->accepted);
        $this->assertStringContainsString('**أنس معالي**', $result->text);
    }
}
