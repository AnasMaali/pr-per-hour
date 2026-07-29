import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import bannerUrl from '@/assets/brand/logo-banner.jpeg'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

/**
 * Editorial About section.
 * Scrub selectors preserved: `.home-about__copy`, `.home-about__visual`.
 */
export function AboutUsSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-about__copy',
    visual: '.home-about__visual',
  })

  return (
    <section
      ref={sectionRef}
      id="about"
      className="home-section home-about"
      aria-labelledby="home-about-title"
    >
      <div className="home-container home-about__grid">
        <div className="home-about__copy">
          <p className="home-eyebrow">{t('aboutEyebrow')}</p>
          <h2 id="home-about-title">{t('aboutTitle')}</h2>
          <p className="home-about__positioning">{t('aboutP1')}</p>
          <p className="home-about__proof">{t('aboutProof')}</p>
          <Link className="btn btn--lift" to="/#founder">
            {t('aboutCta')}
          </Link>
        </div>

        <figure className="home-about__visual">
          <img
            src={bannerUrl}
            alt=""
            width={800}
            height={312}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="visually-hidden">{t('aboutVisualCaption')}</figcaption>
        </figure>
      </div>
    </section>
  )
}
