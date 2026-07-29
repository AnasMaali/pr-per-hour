import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

const ITEMS = [
  {
    n: '01',
    titleKey: 'expertise1Title',
    descKey: 'expertise1Desc',
    to: '/services',
  },
  {
    n: '02',
    titleKey: 'expertise2Title',
    descKey: 'expertise2Desc',
    to: '/services',
  },
  {
    n: '03',
    titleKey: 'expertise3Title',
    descKey: 'expertise3Desc',
    to: '/services',
  },
] as const

/**
 * Editorial expertise index.
 * Scrub selectors preserved: `.home-section__header`, `.home-expertise__card`.
 */
export function ExpertiseSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-section__header',
    items: '.home-expertise__card',
  })

  return (
    <section
      ref={sectionRef}
      id="expertise"
      className="home-section home-expertise"
      aria-labelledby="home-expertise-title"
    >
      <div className="home-container">
        <header className="home-section__header">
          <div className="home-section__header-copy">
            <p className="home-eyebrow">{t('expertiseEyebrow')}</p>
            <h2 id="home-expertise-title">{t('expertiseTitle')}</h2>
            <p>{t('expertiseLead')}</p>
          </div>
        </header>

        <ul className="home-expertise__grid">
          {ITEMS.map((item) => (
            <li key={item.titleKey} className="home-expertise__card">
              <span className="home-expertise__number" aria-hidden="true">
                {item.n}
              </span>
              <div className="home-expertise__body">
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.descKey)}</p>
                <Link className="home-expertise__link" to={item.to}>
                  {t('expertiseExplore')}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
