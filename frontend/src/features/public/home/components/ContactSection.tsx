import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, Link2 } from 'lucide-react'
import { useHomeSectionScrub } from '@/features/public/home/hooks/useHomeSectionScrub'

/**
 * Homepage contact preview — introduction, channels, and CTA to /contact.
 * Full form lives on the Contact page (Phase 4C+).
 * Scrub selectors preserved: `.home-contact__intro`, `.home-contact__channel`,
 * `.home-contact__stage` (start/end unchanged).
 */
export function ContactSection() {
  const { t } = useTranslation('home')
  const sectionRef = useRef<HTMLElement>(null)

  useHomeSectionScrub(sectionRef, {
    header: '.home-contact__intro',
    items: '.home-contact__channel',
    visual: '.home-contact__stage',
    start: 'top 78%',
    end: 'top 28%',
  })

  const email = t('contactEmail')
  const phone = t('contactPhone')
  const linkedIn = t('contactLinkedIn')

  const channels = [
    {
      key: 'email',
      href: `mailto:${email}`,
      label: t('contactEmailLabel'),
      value: email,
      Icon: Mail,
      external: false,
    },
    {
      key: 'phone',
      href: `tel:${phone.replace(/\s+/g, '')}`,
      label: t('contactPhoneLabel'),
      value: phone,
      Icon: Phone,
      external: false,
    },
    {
      key: 'linkedin',
      href: linkedIn,
      label: t('contactLinkedInLabel'),
      value: t('contactLinkedInText'),
      Icon: Link2,
      external: true,
    },
  ] as const

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="home-section home-contact"
      aria-labelledby="home-contact-title"
    >
      <div className="home-contact__atmosphere" aria-hidden="true" />

      <div className="home-container home-contact__layout">
        <header className="home-contact__intro">
          <p className="home-eyebrow">{t('contactEyebrow')}</p>
          <h2 id="home-contact-title">{t('contactTitle')}</h2>
          <p className="home-contact__lead">{t('contactLead')}</p>

          <div className="home-contact__channels">
            <h3 className="home-contact__channels-heading">
              {t('contactChannelsHeading')}
            </h3>
            <ul className="home-contact__channel-list">
              {channels.map(({ key, href, label, value, Icon, external }) => (
                <li key={key}>
                  <a
                    className="home-contact__channel"
                    href={href}
                    {...(external
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                  >
                    <span className="home-contact__channel-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className="home-contact__channel-copy">
                      <span className="home-contact__channel-label">{label}</span>
                      <span className="home-contact__channel-value">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="home-contact__stage">
          <div className="home-contact__stage-glow" aria-hidden="true" />
          <div className="home-contact__invite">
            <p className="home-contact__invite-eyebrow">{t('contactInviteEyebrow')}</p>
            <p className="home-contact__invite-title">{t('contactInviteTitle')}</p>
            <p className="home-contact__invite-lead">{t('contactInviteLead')}</p>
            <Link className="btn btn--lift" to="/contact">
              {t('contactPageCta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
