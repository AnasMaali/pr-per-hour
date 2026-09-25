<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

/**
 * Decides when a growing stream of already reasoning-stripped raw text is
 * safe to reveal to the visitor as one SSE "delta" chunk.
 *
 * MONOTONIC OUTPUT INVARIANT: once a chunk has been returned by feed() or
 * finish(), it is never retroactively wrong. The visitor must never see a
 * phrase or token that later needs semantic correction — the caller's
 * end-of-stream authoritative guard pass exists to catch genuinely rare,
 * unanticipated cases, not to "clean up after" this class in the normal
 * case. Concretely: for a normal successful stream, concatenating every
 * emitted delta reproduces the final persisted text exactly (see
 * HandleStreamingChatTurnTest / ChatbotStreamingTest for the equality
 * assertion this class is built to satisfy).
 *
 * Four invariants, in order of importance:
 *  1. Never cut mid-word. A whitespace-terminated cut boundary is the
 *     only kind this class ever produces, so an in-progress word/token —
 *     a canonical name, a URL, a mixed-script homoglyph token — is never
 *     flushed until it is complete, regardless of which fragment(s) it
 *     arrived in.
 *  2. Never flush a chunk that ends on the first word of a known
 *     multi-word risky/name pattern (AnasResponseQualityGuard::
 *     isRiskyMultiWordPrefix() — e.g. "بشكل" from "بشكل لحظي", "أنس" from
 *     "أنس مالي"). That word is retreated out of the candidate and held
 *     back instead, so it is always normalized together with whatever
 *     completes it in the *next* fragment — never shown split across two
 *     already-visible chunks. This is the deterministic lookbehind: a
 *     short, explicit list of first-words (see AnasResponseQualityGuard),
 *     not a general phrase-prediction engine.
 *  3. Never flush while a Markdown span ("**bold**" or "[text](url)")
 *     opened earlier in the buffer is still unclosed.
 *  4. Prefer flushing at a completed sentence/clause boundary, so chunks
 *     read as sentence fragments or completed short clauses — with a
 *     safety-valve length so an unbroken run of text (no punctuation at
 *     all) still streams instead of stalling until the whole answer is
 *     done. The safety valve is subject to invariants 1-3 exactly like
 *     every other cut: it may make the chunker wait longer for a safe
 *     word boundary, but it never bypasses them to force an emission.
 *
 * Every flushed slice is run through AnasResponseQualityGuard's text
 * transforms (real-time-claim softening, canonical-name normalization,
 * script-corruption repair) before being handed back to the caller. With
 * invariant 2 in place, a multi-word risky phrase is *always* fully
 * contained within the slice it first becomes eligible to appear in —
 * never partially shown in an earlier chunk and corrected in a later one.
 */
final class SafeStreamChunker
{
    private const MAX_BUFFER_LENGTH = 200;

    private const CLAUSE_BOUNDARY_PATTERN = '/[.!?؟\n]+\s+/u';

    private string $pending = '';

    private string $emittedRaw = '';

    public function __construct(
        private readonly AnasResponseQualityGuard $guard,
    ) {}

    /**
     * Feed a new raw text fragment. Returns the next safe chunk to reveal,
     * or null if there isn't enough safely-flushable content yet.
     */
    public function feed(string $rawFragment): ?string
    {
        $this->pending .= $rawFragment;

        return $this->tryFlush(force: false);
    }

    /** Call once, when the underlying stream has ended, to flush the tail. */
    public function finish(): ?string
    {
        return $this->tryFlush(force: true);
    }

    private function tryFlush(bool $force): ?string
    {
        if ($this->pending === '') {
            return null;
        }

        // At end of stream there is no "next fragment" left to complete a
        // held-back word, so the lookbehind retreat no longer applies —
        // whatever remains is flushed as-is (still through the same
        // normalization/script-repair pass below).
        $cut = $force ? strlen($this->pending) : $this->findSafeCut();

        if ($cut === null || $cut <= 0) {
            return null;
        }

        $slice = substr($this->pending, 0, $cut);
        $this->pending = substr($this->pending, $cut);
        $this->emittedRaw .= $slice;

        if (trim($slice) === '') {
            return null;
        }

        return $this->makeSafe($slice, $this->emittedRaw);
    }

    /**
     * Finds a cut point that is safe to reveal right now: a completed
     * clause boundary if one exists and Markdown is balanced up to it,
     * else — once the buffer has grown long with no clause boundary yet
     * — the last whitespace within it. Either way, the candidate is then
     * retreated past any trailing word that is the first word of a known
     * multi-word risky/name pattern, per the class-level doc comment.
     */
    private function findSafeCut(): ?int
    {
        $cut = $this->findClauseBoundaryCut() ?? $this->findSafetyValveCut();

        if ($cut === null) {
            return null;
        }

        return $this->retreatPastRiskyTrailingWord($cut);
    }

    /**
     * Tries successive clause boundaries in order — not just the first
     * one — because an early boundary can fall inside a still-open
     * "**"/"[...]" span while a later one (further along in the same
     * buffer) does not; giving up after only the first candidate would
     * wrongly stall the whole buffer until finish().
     */
    private function findClauseBoundaryCut(): ?int
    {
        if (! preg_match_all(self::CLAUSE_BOUNDARY_PATTERN, $this->pending, $matches, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        foreach ($matches[0] as $match) {
            $cut = $match[1] + strlen($match[0]);

            if ($this->isMarkdownBalanced($this->emittedRaw.substr($this->pending, 0, $cut))) {
                return $cut;
            }
        }

        return null;
    }

    /**
     * No balanced clause boundary yet, but the buffer has grown long.
     * Search backward through whitespace boundaries for the latest cut
     * whose cumulative output is still Markdown-balanced. This preserves
     * the safety-valve benefit without ever exposing an unfinished bold
     * span or Markdown link.
     */
    private function findSafetyValveCut(): ?int
    {
        if (strlen($this->pending) < self::MAX_BUFFER_LENGTH) {
            return null;
        }

        if (
            preg_match_all(
                '/\s+/u',
                $this->pending,
                $matches,
                PREG_OFFSET_CAPTURE,
            )
            && $matches[0] !== []
        ) {
            foreach (array_reverse($matches[0]) as $match) {
                $cut = $match[1] + strlen($match[0]);

                $candidate = $this->emittedRaw.substr(
                    $this->pending,
                    0,
                    $cut,
                );

                if ($this->isMarkdownBalanced($candidate)) {
                    return $cut;
                }
            }
        }

        // Either one giant unbroken token exceeded the safety valve, or
        // every available whitespace boundary still lies inside an open
        // Markdown span. Keep buffering rather than expose malformed text.
        return null;
    }

    /**
     * If the word immediately before $cut is the first word of a known
     * multi-word risky/name pattern, retreat $cut to just before that
     * word instead, so it is held back together with whatever follows in
     * the next fragment. Loops in case retreating reveals another risky
     * word immediately before it (rare, but cheap to handle correctly).
     * Returns 0 if nothing before the risky word is safe to flush yet.
     */
    private function retreatPastRiskyTrailingWord(int $cut): int
    {
        while ($cut > 0) {
            // $cut always lands right after a trailing whitespace run (see
            // findClauseBoundaryCut()/findSafetyValveCut()) — strip that
            // first, or lastWhitespaceEnd() below would just find that same
            // trailing run and report the word as empty.
            $withoutTrailingWhitespace = rtrim(substr($this->pending, 0, $cut));
            $wordStart = $this->lastWhitespaceEnd($withoutTrailingWhitespace);
            $trailingWord = substr($withoutTrailingWhitespace, $wordStart);

            if (! $this->guard->isRiskyMultiWordPrefix($trailingWord)) {
                return $cut;
            }

            if ($wordStart <= 0) {
                // The entire candidate is just this one risky-prefix word
                // with nothing safe before it — nothing to flush yet.
                return 0;
            }

            $cut = $wordStart;
        }

        return 0;
    }

    /** Byte offset just after the last whitespace run in $text, or 0. */
    private function lastWhitespaceEnd(string $text): int
    {
        if (preg_match_all('/\s+/u', $text, $matches, PREG_OFFSET_CAPTURE) && $matches[0] !== []) {
            $last = end($matches[0]);

            return $last[1] + strlen($last[0]);
        }

        return 0;
    }

    /**
     * $languageContext is the cumulative raw text received so far
     * (including $slice) — used only to decide the reply's language, not
     * re-derived from $slice alone, so an isolated chunk that happens to
     * be pure Latin script (e.g. a lone URL) inside an otherwise-Arabic
     * reply is still normalized as Arabic. See
     * AnasResponseQualityGuard::sanitizeText() for why this matters for
     * the monotonic-output invariant (visible deltas must match what the
     * final authoritative pass would produce).
     */
    private function makeSafe(string $slice, string $languageContext): ?string
    {
        $safe = $this->guard->sanitizeText($slice, $languageContext);

        if ($this->guard->containsUnexpectedScript($safe)) {
            $repaired = $this->guard->repairMixedScriptTokens($safe);

            // A whole word in a disallowed script can't be safely repaired
            // in place (see AnasResponseQualityGuard) — withhold it rather
            // than show corrupted text. The final full-text guard pass
            // still catches this in the persisted/authoritative answer.
            $safe = $this->guard->containsUnexpectedScript($repaired) ? '' : $repaired;
        }

        return $safe === '' ? null : $safe;
    }

    private function isMarkdownBalanced(string $text): bool
    {
        if ((substr_count($text, '**') % 2) !== 0) {
            return false;
        }

        $lastOpenBracket = strrpos($text, '[');

        if ($lastOpenBracket === false) {
            return true;
        }

        $tail = substr($text, $lastOpenBracket);

        return (bool) preg_match('/^\[[^\[\]]*\]\([^()\s]+\)/u', $tail);
    }
}
