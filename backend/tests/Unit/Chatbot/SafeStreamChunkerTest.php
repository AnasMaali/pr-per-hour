<?php

declare(strict_types=1);

namespace Tests\Unit\Chatbot;

use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use App\Features\Chatbot\Support\SafeStreamChunker;
use PHPUnit\Framework\TestCase;

final class SafeStreamChunkerTest extends TestCase
{
    private SafeStreamChunker $chunker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->chunker = new SafeStreamChunker(new AnasResponseQualityGuard);
    }

    public function test_never_flushes_mid_word(): void
    {
        $this->assertNull($this->chunker->feed('Hel'));
        $this->assertNull($this->chunker->feed('lo'));

        // Still no sentence boundary and well under the safety-valve length.
        $this->assertNull($this->chunker->feed(' wor'));
    }

    public function test_flushes_at_a_completed_sentence_boundary(): void
    {
        $this->assertNull($this->chunker->feed('Hello world'));

        $chunk = $this->chunker->feed('. Next sentence starts here');

        $this->assertNotNull($chunk);
        $this->assertSame('Hello world. ', $chunk);
    }

    public function test_holds_back_an_unclosed_bold_span_until_it_closes(): void
    {
        // Ends with a sentence boundary, but "**" is still unbalanced —
        // must not flush an unclosed Markdown span.
        $this->assertNull($this->chunker->feed('This is **bold. '));

        $chunk = $this->chunker->feed('word** and more. ');

        $this->assertNotNull($chunk);
        $this->assertSame('This is **bold. word** and more. ', $chunk);
    }

    public function test_holds_back_an_unresolved_markdown_link_until_it_closes(): void
    {
        $this->assertNull($this->chunker->feed('See [our site'));

        // Once the closing "](url)" arrives alongside a sentence boundary,
        // the link is complete and the whole clause is safe to flush.
        $chunk = $this->chunker->feed('](https://prperhour.com) now. ');

        $this->assertSame('See [our site](https://prperhour.com) now. ', $chunk);
    }

    public function test_safety_valve_flushes_a_long_run_with_no_punctuation_at_a_word_boundary(): void
    {
        $words = array_fill(0, 40, 'word');
        $longRun = implode(' ', $words).' ';

        $chunk = $this->chunker->feed($longRun);

        $this->assertNotNull($chunk);
        // Never cuts mid-word: the flushed chunk must end exactly on a
        // word boundary (trailing whitespace), never mid-token.
        $this->assertMatchesRegularExpression('/\s$/', $chunk);
        $this->assertStringEndsNotWith('wor', $chunk);
    }

    public function test_safety_valve_never_flushes_an_unclosed_bold_span(): void
    {
        // Starts with the opening marker, so there is no earlier balanced
        // prefix the safety valve is allowed to reveal.
        $longUnclosedBold = '**'.str_repeat('word ', 60);

        $this->assertNull(
            $this->chunker->feed($longUnclosedBold),
            'The safety valve must not expose an unmatched Markdown marker.',
        );

        $chunk = $this->chunker->feed('closed** done. ')
            ?? $this->chunker->finish();

        $this->assertNotNull($chunk);
        $this->assertSame(0, substr_count($chunk, '**') % 2);
        $this->assertStringStartsWith('**', $chunk);
        $this->assertStringContainsString('closed**', $chunk);
    }

    public function test_softens_a_realtime_claim_within_a_single_chunk(): void
    {
        $chunk = $this->chunker->feed('اللوحة تعمل بشكل لحظي. ');

        $this->assertNotNull($chunk);
        $this->assertStringNotContainsString('بشكل لحظي', $chunk);
        $this->assertStringContainsString('آلية تحديث', $chunk);
    }

    public function test_normalizes_a_corrupted_canonical_name_within_a_single_chunk(): void
    {
        $chunk = $this->chunker->feed('مسؤول التكنولوجيا هو أناس مالي. ');

        $this->assertNotNull($chunk);
        $this->assertStringContainsString('أنس معالي', $chunk);
        $this->assertStringNotContainsString('أناس مالي', $chunk);
    }

    public function test_withholds_a_chunk_containing_unrepairable_script_corruption(): void
    {
        // A whole word in Greek script, no Latin mixed in — the guard
        // cannot safely repair this in place (see AnasResponseQualityGuard).
        $chunk = $this->chunker->feed('This includes a στρατηγική analysis. ');

        $this->assertNull($chunk);
    }

    public function test_repairs_a_mixed_script_homoglyph_token_within_a_chunk(): void
    {
        $chunk = $this->chunker->feed('This is a great cepвис for you. ');

        $this->assertNotNull($chunk);
        $this->assertStringNotContainsString('cepвис', $chunk);
        $this->assertStringContainsString('service', $chunk);
    }

    public function test_finish_flushes_remaining_pending_text_with_no_trailing_punctuation(): void
    {
        $this->assertNull($this->chunker->feed('No terminal punctuation here'));

        $tail = $this->chunker->finish();

        $this->assertSame('No terminal punctuation here', $tail);
    }

    public function test_finish_returns_null_when_nothing_is_pending(): void
    {
        // A complete, balanced sentence is flushed immediately by feed()
        // itself — nothing is left pending for finish() to return.
        $this->assertSame('Complete sentence. ', $this->chunker->feed('Complete sentence. '));

        $this->assertNull($this->chunker->finish());
    }

    public function test_handles_arabic_multibyte_text_without_corrupting_characters(): void
    {
        $chunk = $this->chunker->feed('مرحباً، كيف يمكنني مساعدتك اليوم؟ ');

        $this->assertNotNull($chunk);
        $this->assertSame('مرحباً، كيف يمكنني مساعدتك اليوم؟ ', $chunk);
    }

    // -----------------------------------------------------------------
    // Monotonic-safety lookbehind: boundary-split cases (Part "safe
    // stream lookbehind" of the streaming quality pass). Each of these
    // pads the buffer past the safety-valve length specifically to force
    // a cut decision *before* the risky word's completion arrives — the
    // exact scenario the lookbehind exists to protect against. Padding
    // uses ordinary, non-risky filler so only the targeted phrase is
    // under test.
    // -----------------------------------------------------------------

    private function padding(): string
    {
        return str_repeat('كلمة ', 60);
    }

    public function test_1_never_exposes_bshkl_lhzy_split_across_a_safety_valve_cut(): void
    {
        $chunk1 = $this->chunker->feed($this->padding().'بشكل ');
        $this->assertNotNull($chunk1);
        $this->assertStringNotContainsString('بشكل', $chunk1);

        $tail = $this->chunker->feed('لحظي.') ?? $this->chunker->finish();

        $this->assertNotNull($tail);
        $this->assertStringNotContainsString('بشكل لحظي', $tail);
        $this->assertStringContainsString('آلية تحديث', $tail);

        // Never visible anywhere, at any point, even concatenated.
        $this->assertStringNotContainsString('بشكل لحظي', $chunk1.$tail);
    }

    public function test_2_never_exposes_a_split_corrupted_canonical_name_across_a_safety_valve_cut(): void
    {
        $chunk1 = $this->chunker->feed($this->padding().'أناس ');
        $this->assertNotNull($chunk1);
        $this->assertStringNotContainsString('أناس', $chunk1);

        $tail = $this->chunker->feed('مالي هو مسؤول التكنولوجيا.') ?? $this->chunker->finish();

        $this->assertNotNull($tail);
        $this->assertStringNotContainsString('أناس مالي', $tail);
        $this->assertStringContainsString('أنس معالي', $tail);

        $this->assertStringNotContainsString('أناس مالي', $chunk1.$tail);
    }

    public function test_3_never_exposes_a_mixed_script_token_split_across_fragments(): void
    {
        // "cep" has no trailing whitespace yet — the word-boundary
        // invariant alone (not the risky-prefix lookbehind) protects it.
        $chunk1 = $this->chunker->feed('This is a great cep');
        $this->assertNull($chunk1);

        $chunk2 = $this->chunker->feed('вис for your business. ');
        $this->assertNotNull($chunk2);
        $this->assertStringNotContainsString('cep', $chunk2);
        $this->assertStringNotContainsString('вис', $chunk2);
        $this->assertStringContainsString('service', $chunk2);
    }

    public function test_4_never_exposes_broken_markdown_when_a_bold_word_is_split_across_fragments(): void
    {
        $chunk1 = $this->chunker->feed('The best fit is **Data Analysis');
        $this->assertNull($chunk1);

        $chunk2 = $this->chunker->feed(' & Business Intelligence** for you. ');
        $this->assertNotNull($chunk2);
        $this->assertSame(2, substr_count($chunk2, '**'));
        $this->assertStringContainsString('**Data Analysis & Business Intelligence**', $chunk2);
    }

    public function test_5_never_exposes_a_malformed_partial_url_split_across_fragments(): void
    {
        $chunk1 = $this->chunker->feed('Visit https://prperhour');
        $this->assertNull($chunk1);

        $chunk2 = $this->chunker->feed('.com/services today. ');
        $this->assertNotNull($chunk2);
        $this->assertStringContainsString('https://prperhour.com/services', $chunk2);
    }

    public function test_softens_an_english_realtime_phrase_in_an_isolated_latin_only_chunk_using_the_arabic_replacement(): void
    {
        // Force the Arabic lead-in to flush on its own first (via the
        // safety valve), so the *next* chunk — a lone English phrase —
        // contains no Arabic characters at all by itself. Only the
        // cumulative context (this class's languageContext passthrough)
        // tells sanitizeText() the reply is actually Arabic; without it,
        // this isolated Latin-only chunk would look English on its own
        // and get the English replacement mid-Arabic-reply.
        $chunk1 = $this->chunker->feed($this->padding().'اللوحة ');
        $this->assertNotNull($chunk1);
        $this->assertStringContainsString('اللوحة', $chunk1);

        $chunk2 = $this->chunker->feed('real-time. ');

        $this->assertNotNull($chunk2);
        $this->assertStringNotContainsString('real-time', strtolower($chunk2));
        $this->assertStringContainsString('آلية تحديث', $chunk2);
    }

    public function test_6_a_long_sentence_past_the_safety_valve_threshold_still_normalizes_a_buried_realtime_claim(): void
    {
        $longLeadIn = str_repeat('نص طويل جدا يشرح الخدمة بالتفصيل ', 10);

        $chunk1 = $this->chunker->feed($longLeadIn.'تحديث ');
        $this->assertNotNull($chunk1);
        $this->assertStringNotContainsString('تحديث', $chunk1);

        $tail = $this->chunker->feed('فوري لكل المؤشرات.') ?? $this->chunker->finish();

        $this->assertNotNull($tail);
        $this->assertStringNotContainsString('تحديث فوري', $chunk1.$tail);
        $this->assertStringContainsString('آلية الربط', $tail);
    }
}
