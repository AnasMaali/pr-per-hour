import { useTranslation } from 'react-i18next'

export function ContactMessagesSkeleton() {
  const { t } = useTranslation('adminContactMessages')

  return (
    <div
      className="admin-contact-messages-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="visually-hidden">{t('loading')}</span>
      <div className="admin-contact-messages-skeleton__row" />
      <div className="admin-contact-messages-skeleton__row" />
      <div className="admin-contact-messages-skeleton__row" />
    </div>
  )
}
