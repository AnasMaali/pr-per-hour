/**
 * Per-message bidi direction detection, independent of the UI locale.
 *
 * A visitor may type Arabic while the chatbot chrome is English (or the
 * reverse), and a single reply can mix Arabic prose with Latin brand
 * names, URLs, and email addresses. The chatbot chrome direction never
 * changes; only the affected message's own `dir`/`lang` are set, so a
 * mixed-script paragraph reads naturally in both directions.
 */

const ARABIC_SCRIPT_PATTERN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g
const LATIN_SCRIPT_PATTERN = /[A-Za-z]/g

// URLs and email addresses are opaque tokens, not natural-language prose:
// "https://prperhour.com" or "info@prperhour.com" embedded in an Arabic
// paragraph shouldn't tip the script count toward English just because
// they're spelled with Latin letters.
const URL_PATTERN = /(https?:\/\/\S+|www\.\S+)/gi
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g

export interface MessageDirection {
  dir: 'rtl' | 'ltr'
  lang: 'ar' | 'en'
}

/**
 * Counts Arabic-script vs. Latin-script letters in the message's prose
 * (URLs and email addresses excluded) and picks whichever script is
 * predominant. Non-letter characters carry no directionality and are
 * ignored, so a mostly-Arabic paragraph that happens to reference a
 * brand name, URL, or email still resolves to Arabic.
 */
export function detectMessageDirection(text: string): MessageDirection {
  const prose = text.replace(URL_PATTERN, ' ').replace(EMAIL_PATTERN, ' ')

  const arabicCount = prose.match(ARABIC_SCRIPT_PATTERN)?.length ?? 0
  const latinCount = prose.match(LATIN_SCRIPT_PATTERN)?.length ?? 0

  if (arabicCount > latinCount) {
    return { dir: 'rtl', lang: 'ar' }
  }

  return { dir: 'ltr', lang: 'en' }
}
