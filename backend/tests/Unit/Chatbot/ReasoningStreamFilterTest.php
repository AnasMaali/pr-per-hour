<?php

declare(strict_types=1);

namespace Tests\Unit\Chatbot;

use App\Features\Chatbot\Support\ReasoningStreamFilter;
use PHPUnit\Framework\TestCase;

final class ReasoningStreamFilterTest extends TestCase
{
    private function collectSafeText(ReasoningStreamFilter $filter, array $fragments): string
    {
        $out = '';
        $collect = function (string $text) use (&$out): void {
            $out .= $text;
        };

        foreach ($fragments as $fragment) {
            $filter->feed($fragment, $collect);
        }

        $filter->finish($collect);

        return $out;
    }

    public function test_passes_through_plain_text_with_no_think_tags(): void
    {
        $filter = new ReasoningStreamFilter;

        $result = $this->collectSafeText($filter, ['Hello', ', ', 'world', '.']);

        $this->assertSame('Hello, world.', $result);
    }

    public function test_strips_a_complete_think_block_delivered_in_one_fragment(): void
    {
        $filter = new ReasoningStreamFilter;

        $result = $this->collectSafeText($filter, [
            'Before. <think>secret reasoning</think> After.',
        ]);

        $this->assertSame('Before.  After.', $result);
        $this->assertStringNotContainsString('secret reasoning', $result);
    }

    public function test_strips_a_think_block_split_across_many_small_fragments_including_across_the_tag_itself(): void
    {
        $filter = new ReasoningStreamFilter;

        $fragments = [
            'abc ', '<th', 'ink', '>', 'reason', 'ing text', '</th', 'ink', '>', ' after',
        ];

        $result = $this->collectSafeText($filter, $fragments);

        $this->assertSame('abc  after', $result);
        $this->assertStringNotContainsString('reasoning', $result);
        $this->assertStringNotContainsString('<think', $result);
        $this->assertStringNotContainsString('</think', $result);
    }

    public function test_discards_an_unterminated_think_block_entirely(): void
    {
        $filter = new ReasoningStreamFilter;

        // e.g. generation cut off by max_tokens before the closing tag.
        $result = $this->collectSafeText($filter, [
            'Answer starts. <think>reasoning that never closes',
        ]);

        $this->assertSame('Answer starts. ', $result);
    }

    public function test_text_that_looks_like_a_tag_prefix_but_is_not_a_tag_is_still_released(): void
    {
        $filter = new ReasoningStreamFilter;

        $result = $this->collectSafeText($filter, [
            'This uses ', '<thing-else> not a reasoning tag.',
        ]);

        $this->assertSame('This uses <thing-else> not a reasoning tag.', $result);
    }

    public function test_handles_multiple_think_blocks_in_sequence(): void
    {
        $filter = new ReasoningStreamFilter;

        $result = $this->collectSafeText($filter, [
            'One. <think>r1</think>Two. <think>r2</think>Three.',
        ]);

        $this->assertSame('One. Two. Three.', $result);
    }

    public function test_does_not_leak_a_partial_tag_prefix_when_stream_ends_mid_tag(): void
    {
        $filter = new ReasoningStreamFilter;

        // Stream ends while "<think>" itself is still incomplete — nothing
        // resembling a tag fragment should ever be released.
        $result = $this->collectSafeText($filter, ['Safe text <thi']);

        $this->assertSame('Safe text ', $result);
    }
}
