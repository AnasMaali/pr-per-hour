import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'
import client1 from '@/assets/clients/client-1.png'
import client2 from '@/assets/clients/client-2.jpg'
import client3 from '@/assets/clients/client-3.png'
import client4 from '@/assets/clients/client-4.jpg'
import client5 from '@/assets/clients/client-5.png'

const LOGOS = [
  { src: client1, darkPlate: true },
  { src: client2, darkPlate: false },
  { src: client3, darkPlate: false },
  { src: client4, darkPlate: false },
  { src: client5, darkPlate: true },
] as const

/**
 * Premium logo wall.
 * Scrub selectors preserved: `.home-section__header`, `.home-trusted__cell`.
 */
export function TrustedOrganizationsSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-section__header',
    items: '.home-trusted__cell',
  })

  return (
    <section
      ref={sectionRef}
      id="trusted"
      className="home-section home-trusted"
      aria-labelledby="home-trusted-title"
    >
      <div className="home-container">
        <header className="home-section__header home-section__header--center">
          <div className="home-section__header-copy">
            <p className="home-eyebrow">{t('trustedEyebrow')}</p>
            <h2 id="home-trusted-title">{t('trustedTitle')}</h2>
            <p>{t('trustedLead')}</p>
          </div>
        </header>

        <ul className="home-trusted__grid">
          {LOGOS.map((logo, index) => (
            <li
              key={logo.src}
              className={
                logo.darkPlate
                  ? 'home-trusted__cell home-trusted__cell--dark'
                  : 'home-trusted__cell'
              }
            >
              <img
                src={logo.src}
                alt={t('trustedLogoLabel', { index: index + 1 })}
                loading="lazy"
                decoding="async"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
