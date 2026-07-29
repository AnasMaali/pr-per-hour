import { useTranslation } from 'react-i18next'
import { ContactMessageStatusBadge } from '@/features/admin/contact-messages/components/ContactMessageStatusBadge'
import type { AdminContactMessage } from '@/features/admin/contact-messages/types/adminContactMessages.types'
import { formatContactMessageTimestamp } from '@/features/admin/contact-messages/utils/contactMessageFilters'

interface ContactMessageDetailsSummaryProps {
  message: AdminContactMessage
  locale: string
}

export function ContactMessageDetailsSummary({
  message,
  locale,
}: ContactMessageDetailsSummaryProps) {
  const { t } = useTranslation('adminContactMessages')

  return (
    <section
      className="admin-contact-message-details-summary"
      aria-labelledby="contact-message-summary-heading"
    >
      <h2 id="contact-message-summary-heading">{t('summaryHeading')}</h2>

      <dl className="admin-contact-message-details-grid">
        <div>
          <dt>{t('statusField')}</dt>
          <dd>
            <ContactMessageStatusBadge status={message.status} />
          </dd>
        </div>
        <div>
          <dt>{t('name')}</dt>
          <dd>{message.full_name}</dd>
        </div>
        <div>
          <dt>{t('email')}</dt>
          <dd>
            <a href={`mailto:${message.email}`}>{message.email}</a>
          </dd>
        </div>
        <div>
          <dt>{t('phone')}</dt>
          <dd>{message.phone ?? t('notProvided')}</dd>
        </div>
        <div>
          <dt>{t('organization')}</dt>
          <dd>{message.organization ?? t('notProvided')}</dd>
        </div>
        <div>
          <dt>{t('received')}</dt>
          <dd>{formatContactMessageTimestamp(message.created_at, locale)}</dd>
        </div>
        <div>
          <dt>{t('updated')}</dt>
          <dd>{formatContactMessageTimestamp(message.updated_at, locale)}</dd>
        </div>
        <div className="admin-contact-message-details-grid__full">
          <dt>{t('message')}</dt>
          <dd>
            <p className="admin-contact-message-body">{message.message}</p>
          </dd>
        </div>
      </dl>
    </section>
  )
}
