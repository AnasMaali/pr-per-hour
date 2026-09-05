import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'

const PHRASE_KEYS = [
  'thinkingDefault',
  'thinkingReviewing',
  'thinkingPreparing',
] as const

const ROTATE_INTERVAL_MS = 2600

export interface AnasTypingIndicatorProps {
  reducedMotion: boolean
}

/**
 * Replaces the generic three-dot bouncer with a miniature hourglass that
 * gently flips, paired with rotating (never fabricated) microcopy — Anas
 * never claims to be researching or browsing live, only "thinking".
 */
export function AnasTypingIndicator({
  reducedMotion,
}: AnasTypingIndicatorProps) {
  const { t } = useTranslation('chatbot')
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % PHRASE_KEYS.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  const phraseKey = PHRASE_KEYS[phraseIndex] ?? PHRASE_KEYS[0]

  return (
    <div
      className="anas-typing"
      role="status"
      aria-label={t('thinkingDefault')}
    >
      <AnasHourglass
        size={22}
        state="thinking"
        reducedMotion={reducedMotion}
        className="anas-typing__glass"
      />
      <span className="anas-typing__text" aria-hidden="true">
        {t(phraseKey)}
      </span>
    </div>
  )
}
