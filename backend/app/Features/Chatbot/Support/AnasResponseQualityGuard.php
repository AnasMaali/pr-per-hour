<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\Chatbot\DTOs\AnasResponseQualityResult;

/**
 * Deterministic, provider-agnostic quality gate applied to Anas's
 * generated text after the AI provider responds and before anything is
 * persisted or shown to a visitor. Prompt instructions alone can't
 * guarantee this — this is the enforced backstop.
 *
 * Everything here is local and synchronous: there is exactly one external
 * AI generation call per user turn (the caller's own provider call before
 * this runs), and this guard never triggers another one. It either
 * repairs the text itself or marks it unusable, in which case the caller
 * is expected to fall back to a safe local response.
 *
 * Three concerns:
 *  1. Unsupported "real-time/live" claims: current PR Per Hour knowledge
 *     never guarantees a real-time dashboard or integration, so specific
 *     known phrasings are deterministically softened in place.
 *  2. Known-incorrect spellings of the two PR Per Hour leadership names
 *     (e.g. the model has previously corrupted "أنس معالي" into "أناس
 *     مالي"). A narrow, explicit map of observed bad variants is
 *     normalized back to the canonical spelling — this is deliberately
 *     not a general Arabic spell-checker, only a backstop for these two
 *     specific, business-critical proper names.
 *  3. Unexpected Unicode scripts (e.g. the Cyrillic/Greek homoglyph
 *     corruption observed from the model). A single word that mixes Latin
 *     with a disallowed script (the "cepвис" pattern) is conservatively
 *     replaced with a generic placeholder word — not a per-character
 *     homoglyph map, which risks turning one broken word into a
 *     different, confidently wrong one. Anything else — a whole word in
 *     an unrelated script, or corruption a single-word swap can't
 *     contain — marks the response unusable.
 */
final class AnasResponseQualityGuard
{
    /**
     * Ordered regex => replacement rules for unsupported real-time/live
     * claims. Order matters: a specific compound phrase is listed before
     * the generic phrase it contains, so it's softened as one coherent
     * unit instead of leaving an awkward remainder (e.g. "real-time
     * dashboard" is replaced whole, rather than leaving a stray
     * "... dashboard dashboard").
     *
     * Each rule carries both an Arabic and an English replacement. This
     * matters because the *pattern* being matched isn't always in the same
     * language as the *reply*: a manual benchmark against real Groq output
     * showed the model code-switching an English phrase like "real-time"
     * into an otherwise-Arabic sentence. Substituting the English
     * replacement there would "fix" the overclaim but leave the exact kind
     * of broken code-switching this whole guard exists to prevent — so the
     * replacement language always follows the overall reply's language
     * (detected once via looksArabic()), never the matched pattern's own
     * language.
     *
     * Deliberately narrow: bare Arabic "مباشر" ("direct") is common and
     * often legitimate (e.g. "بشكل مباشر" meaning "directly", "تواصل
     * مباشر" meaning "direct contact"), so it is never matched on its own
     * — only the specific real-time/live/instant phrasings below are.
     *
     * @var list<array{pattern: string, ar: string, en: string}>
     */
    private const REALTIME_CLAIM_RULES = [
        // Arabic-pattern rules
        ['pattern' => '/بشكل\s+لحظي/u', 'ar' => 'بحسب آلية تحديث وربط البيانات المتاحة', 'en' => 'based on the available data refresh and integration setup'],
        ['pattern' => '/لحظيًا|لحظيا|لحظياً/u', 'ar' => 'حسب آلية التحديث المتاحة', 'en' => 'based on the available refresh setup'],
        ['pattern' => '/في\s+الوقت\s+الحقيقي/u', 'ar' => 'حسب آلية التحديث المتاحة', 'en' => 'based on the available refresh setup'],
        ['pattern' => '/تحديث\s+لحظي/u', 'ar' => 'تحديث دوري حسب آلية الربط المتاحة', 'en' => 'periodic updates based on the available integration setup'],
        ['pattern' => '/متابعة\s+لحظية/u', 'ar' => 'متابعة دورية من لوحة موحدة', 'en' => 'periodic tracking from a unified dashboard'],
        ['pattern' => '/مزامنة\s+فورية/u', 'ar' => 'مزامنة حسب آلية الربط المتاحة', 'en' => 'synchronization based on the available integration setup'],
        ['pattern' => '/تحديث\s+فوري/u', 'ar' => 'تحديث حسب آلية الربط المتاحة', 'en' => 'updates based on the available integration setup'],
        ['pattern' => '/بيانات\s+حية/u', 'ar' => 'بيانات يتم تحديثها بحسب آلية الربط والتحديث المتاحة', 'en' => 'data updated based on the available integration and refresh setup'],

        // English-pattern rules — compounds before the bare fallback phrase
        // they contain.
        ['pattern' => '/\bin\s+real[\s-]?time\b/i', 'ar' => 'بحسب آلية تحديث وربط البيانات المتاحة', 'en' => 'from a unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\breal[\s-]?time\s+dashboard\b/i', 'ar' => 'لوحة موحدة، بحسب آلية تحديث وربط البيانات المتاحة', 'en' => 'unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\blive\s+dashboard\b/i', 'ar' => 'لوحة موحدة، بحسب آلية تحديث وربط البيانات المتاحة', 'en' => 'unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\blive\s+data\b/i', 'ar' => 'بيانات يتم تحديثها بحسب آلية الربط والتحديث المتاحة', 'en' => 'data updated based on the available integration and refresh setup'],
        ['pattern' => '/\blive\s+tracking\b/i', 'ar' => 'متابعة حسب آلية تحديث وربط البيانات المتاحة', 'en' => 'tracking based on the available data refresh and integration setup'],
        ['pattern' => '/\binstant\s+synchroni[sz]ation\b/i', 'ar' => 'مزامنة حسب آلية الربط المتاحة', 'en' => 'synchronization based on the available integration setup'],
        ['pattern' => '/\binstant\s+updates?\b/i', 'ar' => 'تحديثات حسب آلية الربط المتاحة', 'en' => 'updates based on the available refresh setup'],
        ['pattern' => '/\bautomatically\s+synchroni[sz]ed\b/i', 'ar' => 'مزامنة حسب آلية الربط المتاحة', 'en' => 'synchronized based on the available integration setup'],
        ['pattern' => '/\breal[\s-]?time\b/i', 'ar' => 'بحسب آلية تحديث وربط البيانات المتاحة', 'en' => 'based on the available data refresh and integration setup'],
    ];

    /**
     * Narrow, explicit map of observed-bad Arabic spellings of the two PR
     * Per Hour leadership names to their canonical form. Deliberately not
     * a generic Arabic autocorrect engine — only these two business-
     * critical proper names, and only the specific corrupted variants that
     * have actually been produced by the model. English names are never
     * transliterated by the model in the same way, so no English map is
     * needed here — the system prompt's CANONICAL NAMES rule covers that.
     *
     * @var list<array{pattern: string, replacement: string}>
     */
    private const CANONICAL_NAME_RULES = [
        // Anas Maali (Arabic canonical: أنس معالي).
        ['pattern' => '/أناس\s+معالي/u', 'replacement' => 'أنس معالي'],
        ['pattern' => '/أناس\s+مالي/u', 'replacement' => 'أنس معالي'],
        ['pattern' => '/أنس\s+مالي/u', 'replacement' => 'أنس معالي'],

        // Fatina Maali (Arabic canonical: فاتنة معالي).
        ['pattern' => '/فاتنا\s+مالي/u', 'replacement' => 'فاتنة معالي'],
        ['pattern' => '/فاتينا\s+مالي/u', 'replacement' => 'فاتنة معالي'],
    ];

    /**
     * First word of every MULTI-word entry in REALTIME_CLAIM_RULES and
     * CANONICAL_NAME_RULES above — i.e. every pattern where streaming
     * could plausibly split the pattern's first word from its completing
     * word(s) across two already-visible chunks. Single-word patterns
     * (e.g. "لحظيًا") are deliberately excluded: a lone word is always
     * flushed whole — SafeStreamChunker never cuts mid-word — so it can
     * never be split in the first place and needs no lookbehind.
     *
     * SafeStreamChunker uses this as a small, explicit, deterministic
     * lookbehind: it never flushes a chunk ending on one of these words,
     * holding it back so it is always normalized together with whatever
     * completes it in the next fragment — never shown split into two
     * already-visible pieces. This is not a general phrase engine, just
     * the first words of the rules already declared above; keep it in
     * sync with them.
     *
     * @var list<string>
     */
    private const MULTI_WORD_RISKY_PREFIXES = [
        // Arabic real-time claims: بشكل لحظي / تحديث لحظي / تحديث فوري /
        // متابعة لحظية / مزامنة فورية / في الوقت الحقيقي / بيانات حية.
        'بشكل', 'تحديث', 'متابعة', 'مزامنة', 'في', 'بيانات',
        // English real-time claims: in real time / real-time dashboard /
        // live dashboard / live data / live tracking / instant
        // synchronization / instant update(s) / automatically synchronized.
        'in', 'real', 'live', 'instant', 'automatically',
        // Arabic canonical-name corrupted-variant prefixes: أناس معالي /
        // أناس مالي / أنس مالي / فاتنا مالي / فاتينا مالي.
        'أنس', 'أناس', 'فاتنا', 'فاتينا',
    ];

    /**
     * Whether $word (a single, already-whitespace-trimmed word) is the
     * first word of one of the multi-word rules above, and therefore
     * unsafe to flush on its own — see MULTI_WORD_RISKY_PREFIXES and
     * SafeStreamChunker.
     */
    public function isRiskyMultiWordPrefix(string $word): bool
    {
        return in_array($word, self::MULTI_WORD_RISKY_PREFIXES, true);
    }

    /**
     * The text-transform half of evaluate() (real-time-claim softening +
     * canonical-name normalization) without the accept/reject decision or
     * issue tracking. Exposed for SafeStreamChunker, which applies the
     * same deterministic transforms to each streamed chunk as it's
     * flushed — see that class for why per-chunk safety still relies on
     * evaluate() being re-run once, authoritatively, over the complete
     * assembled answer at the end of a turn.
     *
     * $languageContext, when given, is used to decide the reply's
     * language instead of re-detecting it from $text alone — SafeStreamChunker
     * passes the *cumulative* text received so far (not just the one
     * chunk being sanitized), so an isolated chunk that happens to be
     * pure Latin script (e.g. a lone URL) inside an otherwise-Arabic
     * reply is still correctly treated as Arabic. Without this, a
     * realtime-claim phrase landing entirely inside such a chunk could
     * be softened with the English replacement text mid-Arabic-sentence
     * — the same code-switch bug this guard exists to prevent — and the
     * chunk's visible text could then differ from what the same phrase
     * would become when the authoritative evaluate() runs over the full,
     * unambiguously-Arabic final text. Matching the language decision
     * keeps per-chunk output identical to the final pass's output.
     */
    public function sanitizeText(string $text, ?string $languageContext = null): string
    {
        return $this->normalizeCanonicalNames(
            $this->softenUnsupportedRealtimeClaims($text, $languageContext),
        );
    }

    public function evaluate(string $text): AnasResponseQualityResult
    {
        $issues = [];

        $sanitized = $this->softenUnsupportedRealtimeClaims($text);

        if ($sanitized !== $text) {
            $issues[] = 'unsupported_realtime_claim';
        }

        $withCanonicalNames = $this->normalizeCanonicalNames($sanitized);

        if ($withCanonicalNames !== $sanitized) {
            $issues[] = 'canonical_name_normalized';
        }

        $sanitized = $withCanonicalNames;

        if (trim($sanitized) === '') {
            return new AnasResponseQualityResult(
                accepted: false,
                text: $sanitized,
                issues: [...$issues, 'blank_response'],
            );
        }

        if ($this->containsUnexpectedScript($sanitized)) {
            $repaired = $this->repairMixedScriptTokens($sanitized);

            if ($repaired !== $sanitized) {
                $issues[] = 'unexpected_script_repaired';
            }

            if ($this->containsUnexpectedScript($repaired)) {
                return new AnasResponseQualityResult(
                    accepted: false,
                    text: $repaired,
                    issues: [...$issues, 'unexpected_script'],
                );
            }

            return new AnasResponseQualityResult(
                accepted: true,
                text: $repaired,
                issues: $issues,
            );
        }

        return new AnasResponseQualityResult(
            accepted: true,
            text: $sanitized,
            issues: $issues,
        );
    }

    /**
     * Conservative, single-word repair for the observed homoglyph pattern:
     * a word that mixes Latin letters with a disallowed script (e.g.
     * Latin "c/e/p" fused with Cyrillic "в/и/с" into "cepвис"). Any letter
     * run containing both is replaced whole with a safe placeholder word
     * — "الخدمة" for an Arabic reply, "service" for an English one —
     * rather than guessing at the intended word character by character.
     *
     * A run that is entirely one disallowed script (no Latin mixed in) is
     * left untouched: there's no safe way to guess what a whole foreign
     * word was meant to say, so that case is left for the caller to
     * detect (via the unchanged unexpected-script check) and replace the
     * whole response with a local fallback instead.
     *
     * Public so SafeStreamChunker can apply the same repair to each
     * streamed chunk (see containsUnexpectedScript() below).
     */
    public function repairMixedScriptTokens(string $text): string
    {
        $placeholder = $this->looksArabic($text) ? 'الخدمة' : 'service';

        $repaired = preg_replace_callback(
            '/[\p{L}\p{M}]+/u',
            static function (array $match) use ($placeholder): string {
                $token = $match[0];
                $hasLatin = (bool) preg_match('/\p{Latin}/u', $token);
                $hasDisallowedScript = (bool) preg_match(
                    '/[^\p{Arabic}\p{Latin}\p{Common}\p{Inherited}]/u',
                    $token,
                );

                return ($hasLatin && $hasDisallowedScript) ? $placeholder : $token;
            },
            $text,
        );

        return $repaired ?? $text;
    }

    /**
     * Public so SafeStreamChunker can determine the reply's language once
     * from the cumulative text received so far, and pass that consistent
     * decision into sanitizeText() for every chunk — see that method's
     * $languageContext parameter.
     */
    public function looksArabic(string $text): bool
    {
        return (bool) preg_match('/\p{Arabic}/u', $text);
    }

    private function softenUnsupportedRealtimeClaims(string $text, ?string $languageContext = null): string
    {
        // The replacement always matches the *reply's* language, not the
        // matched pattern's language — see the REALTIME_CLAIM_RULES doc
        // comment for why (a stray English phrase mid-Arabic-sentence must
        // be replaced with an Arabic phrase, not another English one).
        // $languageContext (when given) overrides detection from $text
        // alone — see sanitizeText()'s doc comment for why.
        $language = $this->looksArabic($languageContext ?? $text) ? 'ar' : 'en';

        foreach (self::REALTIME_CLAIM_RULES as $rule) {
            $text = preg_replace($rule['pattern'], $rule[$language], $text) ?? $text;
        }

        return $this->collapseDuplicateReplacements($text, $language);
    }

    /**
     * A model that states the same overclaim twice right next to each
     * other — e.g. "بشكل لحظي (real-time)", the Arabic phrase followed by
     * its own English gloss in parentheses — has both phrases matched and
     * replaced independently above, leaving an awkward "<phrase> (<phrase>)"
     * or repeated "<phrase> <phrase>" artifact. This collapses that back
     * down to a single occurrence, for every replacement phrase actually
     * used by REALTIME_CLAIM_RULES in the reply's language.
     */
    private function collapseDuplicateReplacements(string $text, string $language): string
    {
        $replacements = array_unique(array_column(self::REALTIME_CLAIM_RULES, $language));

        foreach ($replacements as $replacement) {
            $quoted = preg_quote($replacement, '/');

            $text = preg_replace(
                '/'.$quoted.'\s*[\(（]\s*'.$quoted.'\s*[\)）]/u',
                $replacement,
                $text,
            ) ?? $text;

            $text = preg_replace(
                '/(?:'.$quoted.')(?:\s+'.$quoted.')+/u',
                $replacement,
                $text,
            ) ?? $text;
        }

        return $text;
    }

    private function normalizeCanonicalNames(string $text): string
    {
        foreach (self::CANONICAL_NAME_RULES as $rule) {
            $text = preg_replace($rule['pattern'], $rule['replacement'], $text) ?? $text;
        }

        return $text;
    }

    /**
     * Anas only ever replies in Arabic or English. Arabic script, Latin
     * script (official service titles, brand names), and "Common"
     * characters (digits, punctuation, symbols, whitespace, emoji) are
     * allowed. Anything else — Cyrillic, Greek, Armenian, or any other
     * unrelated script a model might hallucinate — is suspicious
     * generation corruption.
     *
     * Public so SafeStreamChunker can apply the same check to each
     * streamed chunk before it is ever shown to the visitor.
     */
    public function containsUnexpectedScript(string $text): bool
    {
        return (bool) preg_match('/[^\p{Arabic}\p{Latin}\p{Common}\p{Inherited}]/u', $text);
    }
}
