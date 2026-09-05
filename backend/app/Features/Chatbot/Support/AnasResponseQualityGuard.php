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
 * Two concerns:
 *  1. Unsupported "real-time/live" claims: current PR Per Hour knowledge
 *     never guarantees a real-time dashboard or integration, so specific
 *     known phrasings are deterministically softened in place.
 *  2. Unexpected Unicode scripts (e.g. the Cyrillic/Greek homoglyph
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
     * Deliberately narrow: bare Arabic "مباشر" ("direct") is common and
     * often legitimate (e.g. "بشكل مباشر" meaning "directly", "تواصل
     * مباشر" meaning "direct contact"), so it is never matched on its own
     * — only the specific real-time/live/instant phrasings below are.
     *
     * @var list<array{pattern: string, replacement: string}>
     */
    private const REALTIME_CLAIM_RULES = [
        // Arabic
        ['pattern' => '/بشكل\s+لحظي/u', 'replacement' => 'بحسب آلية تحديث وربط البيانات المتاحة'],
        ['pattern' => '/لحظيًا|لحظيا|لحظياً/u', 'replacement' => 'حسب آلية التحديث المتاحة'],
        ['pattern' => '/في\s+الوقت\s+الحقيقي/u', 'replacement' => 'حسب آلية التحديث المتاحة'],
        ['pattern' => '/تحديث\s+لحظي/u', 'replacement' => 'تحديث دوري حسب آلية الربط المتاحة'],
        ['pattern' => '/متابعة\s+لحظية/u', 'replacement' => 'متابعة دورية من لوحة موحدة'],
        ['pattern' => '/مزامنة\s+فورية/u', 'replacement' => 'مزامنة حسب آلية الربط المتاحة'],
        ['pattern' => '/تحديث\s+فوري/u', 'replacement' => 'تحديث حسب آلية الربط المتاحة'],

        // English — compounds before the bare fallback phrase they contain.
        ['pattern' => '/\bin\s+real[\s-]?time\b/i', 'replacement' => 'from a unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\breal[\s-]?time\s+dashboard\b/i', 'replacement' => 'unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\blive\s+dashboard\b/i', 'replacement' => 'unified dashboard, based on the available data refresh and integration setup'],
        ['pattern' => '/\blive\s+tracking\b/i', 'replacement' => 'tracking based on the available data refresh and integration setup'],
        ['pattern' => '/\binstant\s+synchroni[sz]ation\b/i', 'replacement' => 'synchronization based on the available integration setup'],
        ['pattern' => '/\binstant\s+updates?\b/i', 'replacement' => 'updates based on the available refresh setup'],
        ['pattern' => '/\bautomatically\s+synchroni[sz]ed\b/i', 'replacement' => 'synchronized based on the available integration setup'],
        ['pattern' => '/\breal[\s-]?time\b/i', 'replacement' => 'based on the available data refresh and integration setup'],
    ];

    public function evaluate(string $text): AnasResponseQualityResult
    {
        $issues = [];

        $sanitized = $this->softenUnsupportedRealtimeClaims($text);

        if ($sanitized !== $text) {
            $issues[] = 'unsupported_realtime_claim';
        }

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
     */
    private function repairMixedScriptTokens(string $text): string
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

    private function looksArabic(string $text): bool
    {
        return (bool) preg_match('/\p{Arabic}/u', $text);
    }

    private function softenUnsupportedRealtimeClaims(string $text): string
    {
        foreach (self::REALTIME_CLAIM_RULES as $rule) {
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
     */
    private function containsUnexpectedScript(string $text): bool
    {
        return (bool) preg_match('/[^\p{Arabic}\p{Latin}\p{Common}\p{Inherited}]/u', $text);
    }
}
