import { useTranslation } from 'react-i18next'
import type { AdminContactMessageStatus } from '@/features/admin/contact-messages/types/adminContactMessages.types'

interface ContactMessageStatusBadgeProps {
  status: AdminContactMessageStatus
}

export function ContactMessageStatusBadge({
  status,
}: ContactMessageStatusBadgeProps) {
  const { t } = useTranslation('adminContactMessages')

  return (
    <span className={`contact-message-status contact-message-status--${status}`}>
      <span className="visually-hidden">{t('statusLabel')}: </span>
      {t(`status.${status}`)}
    </span>
  )
}
