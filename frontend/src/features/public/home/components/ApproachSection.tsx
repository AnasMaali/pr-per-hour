import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

const STEPS = [
  { titleKey: 'approach1Title', descKey: 'approach1Desc' },
  { titleKey: 'approach2Title', descKey: 'approach2Desc' },
  { titleKey: 'approach3Title', descKey: 'approach3Desc' },
  { titleKey: 'approach4Title', descKey: 'approach4Desc' },
] as const

/**
 * Sequential process: Discover → Strategize → Deliver → Measure.
 * Scrub selectors preserved: `.home-section__header`, `.home-approach__step`
 * (start/end unchanged: top 78% → top 22%).
 */
export function ApproachSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-section__header',
    items: '.home-approach__step',
    start: 'top 78%',
    end: 'top 22%',
  })

  return (
    <section
      ref={sectionRef}
      id="approach"
      className="home-section home-approach"
      aria-labelledby="home-approach-title"
    >
      <div className="home-container">
        <header className="home-section__header">
          <div className="home-section__header-copy">
            <p className="home-eyebrow">{t('approachEyebrow')}</p>
            <h2 id="home-approach-title">{t('approachTitle')}</h2>
            <p>{t('approachLead')}</p>
          </div>
        </header>

        <ol className="home-approach__grid">
          {STEPS.map(({ titleKey, descKey }, index) => (
            <li key={titleKey} className="home-approach__step">
              <span className="home-approach__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
