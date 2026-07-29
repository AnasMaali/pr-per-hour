import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

/**
 * Consultancy conversion CTA.
 * Scrub selector preserved: `.final-cta__panel` (start/end unchanged).
 */
export function FinalCtaSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.final-cta__panel',
    start: 'top 85%',
    end: 'top 45%',
  })

  return (
    <section
      ref={sectionRef}
      className="home-section final-cta"
      aria-labelledby="home-cta-title"
    >
      <div className="final-cta__glow" aria-hidden="true" />
      <div className="home-container">
        <div className="final-cta__panel">
          <div className="final-cta__light" aria-hidden="true" />
          <div className="final-cta__copy">
            <h2 id="home-cta-title" className="final-cta__title">
              {t('ctaTitle')}
            </h2>
            <p className="final-cta__lead">{t('ctaLead')}</p>
          </div>
          <div className="final-cta__actions">
            <Link className="btn btn--lift" to="/contact">
              {t('ctaPrimary')}
            </Link>
            <Link className="btn btn--secondary btn--lift" to="/services">
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
