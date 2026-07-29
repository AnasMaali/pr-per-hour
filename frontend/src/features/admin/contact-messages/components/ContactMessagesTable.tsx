import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ContactMessageStatusBadge } from '@/features/admin/contact-messages/components/ContactMessageStatusBadge'
import type { AdminContactMessage } from '@/features/admin/contact-messages/types/adminContactMessages.types'
import {
  excerptContactMessage,
  formatContactMessageTimestamp,
} from '@/features/admin/contact-messages/utils/contactMessageFilters'

interface ContactMessagesTableProps {
  messages: AdminContactMessage[]
  locale: string
}

export function ContactMessagesTable({
  messages,
  locale,
}: ContactMessagesTableProps) {
  const { t } = useTranslation('adminContactMessages')

  return (
    <>
      <div className="admin-contact-messages-table-wrap">
        <table className="admin-contact-messages-table">
          <caption className="visually-hidden">{t('tableCaption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('sender')}</th>
              <th scope="col">{t('organization')}</th>
              <th scope="col">{t('excerpt')}</th>
              <th scope="col">{t('statusField')}</th>
              <th scope="col">{t('received')}</th>
              <th scope="col">
                <span className="visually-hidden">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr
                key={message.id}
                className={
                  message.status === 'new'
                    ? 'admin-contact-messages-table__row--new'
                    : undefined
                }
              >
                <td>
                  <div className="admin-contact-messages-table__sender">
                    <strong>{message.full_name}</strong>
                    <span>{message.email}</span>
                  </div>
                </td>
                <td>{message.organization ?? t('notProvided')}</td>
                <td>
                  <span className="admin-contact-messages-table__excerpt">
                    {excerptContactMessage(message.message)}
                  </span>
                </td>
                <td>
                  <ContactMessageStatusBadge status={message.status} />
                </td>
                <td>
                  {formatContactMessageTimestamp(message.created_at, locale)}
                </td>
                <td>
                  <Link
                    className="btn btn--secondary"
                    to={`/admin/contact-messages/${message.id}`}
                  >
                    {t('viewDetails')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="admin-contact-message-card-list">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.status === 'new'
                ? 'admin-contact-message-card admin-contact-message-card--new'
                : 'admin-contact-message-card'
            }
          >
            <div className="admin-contact-message-card__header">
              <p className="admin-contact-message-card__title">
                {message.full_name}
              </p>
              <ContactMessageStatusBadge status={message.status} />
            </div>
            <p className="admin-contact-message-card__meta">{message.email}</p>
            {message.organization ? (
              <p className="admin-contact-message-card__meta">
                {t('organization')}: {message.organization}
              </p>
            ) : null}
            <p className="admin-contact-message-card__meta">
              {t('received')}:{' '}
              {formatContactMessageTimestamp(message.created_at, locale)}
            </p>
            <p className="admin-contact-message-card__excerpt">
              {excerptContactMessage(message.message)}
            </p>
            <div className="admin-contact-message-card__actions">
              <Link
                className="btn btn--secondary"
                to={`/admin/contact-messages/${message.id}`}
              >
                {t('viewDetails')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
