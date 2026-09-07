<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

/**
 * Strips a Qwen-style inline <think>...</think> reasoning block from a
 * token stream, incrementally, without ever exposing partial reasoning
 * text or a fragment of the tag itself to the visitor.
 *
 * Every chatbot request already sets reasoning_effort to "none", so in
 * practice this should rarely (if ever) trigger — this is the same
 * defensive backstop the non-streaming path already has via
 * GroqChatProvider::stripReasoning(), adapted to work a few characters at
 * a time instead of on one complete string.
 */
final class ReasoningStreamFilter
{
    private const OPEN_TAG = '<think>';

    private const CLOSE_TAG = '</think>';

    private string $buffer = '';

    private bool $insideThink = false;

    /**
     * @param  callable(string $safeText): void  $onSafeText
     */
    public function feed(string $fragment, callable $onSafeText): void
    {
        $this->buffer .= $fragment;

        while (true) {
            if ($this->insideThink) {
                $closePos = strpos($this->buffer, self::CLOSE_TAG);

                if ($closePos === false) {
                    // Still inside reasoning; nothing safe to release yet.
                    return;
                }

                $this->buffer = substr($this->buffer, $closePos + strlen(self::CLOSE_TAG));
                $this->insideThink = false;

                continue;
            }

            $openPos = strpos($this->buffer, self::OPEN_TAG);

            if ($openPos !== false) {
                $safe = substr($this->buffer, 0, $openPos);

                if ($safe !== '') {
                    $onSafeText($safe);
                }

                $this->buffer = substr($this->buffer, $openPos + strlen(self::OPEN_TAG));
                $this->insideThink = true;

                continue;
            }

            // No full opening tag yet. Withhold only a trailing fragment
            // that could still turn into "<think>" as more text arrives;
            // release everything before it.
            $withheld = $this->longestPrefixOfOpenTagAtEnd($this->buffer);
            $safe = $withheld > 0 ? substr($this->buffer, 0, -$withheld) : $this->buffer;

            if ($safe !== '') {
                $onSafeText($safe);
            }

            $this->buffer = $withheld > 0 ? substr($this->buffer, -$withheld) : '';

            return;
        }
    }

    /**
     * Call once, when the underlying token stream has ended, to flush
     * anything still safely held (or discard it, if it turned out to be an
     * unterminated reasoning block — matching stripReasoning()'s handling
     * of the same case for the non-streaming path).
     *
     * @param  callable(string $safeText): void  $onSafeText
     */
    public function finish(callable $onSafeText): void
    {
        // By construction, whatever is left in $this->buffer when this is
        // called is either empty, a genuine unterminated reasoning blob
        // (insideThink), or — since feed() only ever withholds an
        // as-yet-ambiguous suffix — purely a fragment that could still
        // have become "<think>" had the stream continued (e.g. "<thi").
        // The stream has now ended, so that fragment will never resolve
        // into real tag; releasing it as-is would leak a stray, broken-
        // looking tag fragment, so it is discarded rather than shown.
        if (! $this->insideThink && $this->buffer !== '' && ! $this->isAmbiguousOpenTagPrefix($this->buffer)) {
            $onSafeText($this->buffer);
        }

        $this->buffer = '';
    }

    private function isAmbiguousOpenTagPrefix(string $text): bool
    {
        $length = strlen($text);

        return $length > 0
            && $length < strlen(self::OPEN_TAG)
            && $text === substr(self::OPEN_TAG, 0, $length);
    }

    /**
     * Length of the longest suffix of $text that is a proper prefix of
     * "<think>" (e.g. "<", "<t", "<thi" — never the full tag, which is
     * handled by the caller before this is reached). 0 if $text doesn't
     * end with any such fragment.
     */
    private function longestPrefixOfOpenTagAtEnd(string $text): int
    {
        $max = min(strlen(self::OPEN_TAG) - 1, strlen($text));

        for ($length = $max; $length > 0; $length--) {
            if (substr($text, -$length) === substr(self::OPEN_TAG, 0, $length)) {
                return $length;
            }
        }

        return 0;
    }
}
