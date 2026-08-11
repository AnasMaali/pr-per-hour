import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link2, Mail, Phone } from 'lucide-react'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ContactForm } from '@/features/contact/components/ContactForm'
import { ContactFormSuccess } from '@/features/contact/components/ContactFormSuccess'
import type { ContactMessageReceipt } from '@/features/contact/types/contact.types'
import { Reveal } from '@/shared/motion'
import '@/features/contact/styles/contact.css'

export function ContactPage() {
  const { t } = useTranslation('contact')
  const [receipt, setReceipt] = useState<ContactMessageReceipt | null>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    canonicalPath: '/contact',
    robots: 'index, follow',
    syncThemeColor: true,
  })

  useEffect(() => {
    if (!receipt) return
    document.getElementById('contact-success')?.focus()
  }, [receipt])

  const email = t('channelEmail')
  const phone = t('channelPhone')
  const linkedIn = t('channelLinkedIn')

  const channels = [
    {
      key: 'email',
      href: `mailto:${email}`,
      label: t('channelEmailLabel'),
      value: email,
      Icon: Mail,
      external: false,
    },
    {
      key: 'phone',
      href: `tel:${phone.replace(/\s+/g, '')}`,
      label: t('channelPhoneLabel'),
      value: phone,
      Icon: Phone,
      external: false,
    },
    {
      key: 'linkedin',
      href: linkedIn,
      label: t('channelLinkedInLabel'),
      value: t('channelLinkedInText'),
      Icon: Link2,
      external: true,
    },
  ] as const

  return (
    <div className="contact-page">
      <div className="contact-page__inner">
        <Reveal>
          <aside className="contact-page__aside">
            <p className="contact-page__eyebrow">{t('eyebrow')}</p>
            <h1>{t('pageTitle')}</h1>
            <p className="contact-page__lead">{t('lead')}</p>

            <div className="contact-page__channels">
              <h2 className="contact-page__channels-heading">
                {t('channelsHeading')}
              </h2>
              <ul className="contact-page__channel-list">
                {channels.map(({ key, href, label, value, Icon, external }) => (
                  <li key={key}>
                    <a
                      className="contact-page__channel"
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      <span
                        className="contact-page__channel-icon"
                        aria-hidden="true"
                      >
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="contact-page__channel-copy">
                        <span className="contact-page__channel-label">
                          {label}
                        </span>
                        <span className="contact-page__channel-value">
                          {value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="contact-page__stage">
            {receipt ? (
              <div ref={successRef}>
                <ContactFormSuccess
                  receipt={receipt}
                  onSendAnother={() => setReceipt(null)}
                />
              </div>
            ) : (
              <ContactForm onSuccess={setReceipt} />
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
