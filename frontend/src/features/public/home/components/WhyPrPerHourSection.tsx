import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

const ITEMS = [
  { n: '01', titleKey: 'whyItem1Title', descKey: 'whyItem1Desc' },
  { n: '02', titleKey: 'whyItem2Title', descKey: 'whyItem2Desc' },
  { n: '03', titleKey: 'whyItem3Title', descKey: 'whyItem3Desc' },
  { n: '04', titleKey: 'whyItem4Title', descKey: 'whyItem4Desc' },
] as const

/**
 * Why PR Per Hour — editorial value pillars.
 * Scrub selectors preserved: `.home-section__header`, `.home-why__card`.
 */
export function WhyPrPerHourSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-section__header',
    items: '.home-why__card',
  })

  return (
    <section
      ref={sectionRef}
      id="why"
      className="home-section home-why"
      aria-labelledby="home-why-title"
    >
      <div className="home-container">
        <header className="home-section__header">
          <div className="home-section__header-copy">
            <p className="home-eyebrow">{t('whyEyebrow')}</p>
            <h2 id="home-why-title">{t('whyTitle')}</h2>
            <p>{t('whyLead')}</p>
          </div>
        </header>

        <ul className="home-why__grid">
          {ITEMS.map(({ n, titleKey, descKey }) => (
            <li key={titleKey} className="home-why__card">
              <span className="home-why__index" aria-hidden="true">
                {n}
              </span>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
