import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { UseQueryResult } from '@tanstack/react-query'
import { ApiClientError } from '@/shared/api/errors'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import {
  excerptText,
  formatAdminDateTime,
} from '@/features/admin/dashboard/utils/adminFormatting'
import type { AdminContactMessagePreviewItem } from '@/features/admin/dashboard/types/adminOverview.types'

interface RecentMessagesPreviewProps {
  query: UseQueryResult<{
    messages: AdminContactMessagePreviewItem[]
    total: number
  }>
}

export function RecentMessagesPreview({ query }: RecentMessagesPreviewProps) {
  const { t, i18n } = useTranslation('admin')
  const requestId =
    query.error instanceof ApiClientError
      ? query.error.normalized.requestId
      : null

  return (
    <section
      className="admin-preview-section"
      aria-labelledby="admin-recent-messages-heading"
    >
      <div className="admin-preview-section__header">
        <h2 id="admin-recent-messages-heading">{t('recentMessages')}</h2>
        <Link to="/admin/contact-messages">{t('viewAll')}</Link>
      </div>
      <p className="admin-section-lead">{t('recentMessagesLead')}</p>

      {query.isPending ? (
        <div className="admin-preview-skeleton" aria-busy="true" aria-live="polite">
          <span className="visually-hidden">{t('loading')}</span>
          <div className="admin-preview-skeleton__row" />
          <div className="admin-preview-skeleton__row" />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title={t('sectionUnavailable')}
          description={t('sectionUnavailableDescription')}
          requestId={requestId}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {query.isSuccess && query.data.messages.length === 0 ? (
        <EmptyState
          title={t('noMessagesTitle')}
          description={t('noMessagesDescription')}
        />
      ) : null}

      {query.isSuccess && query.data.messages.length > 0 ? (
        <ul className="admin-preview-list">
          {query.data.messages.map((message) => (
            <li key={message.id} className="admin-preview-item">
              <div className="admin-preview-item__main">
                <p className="admin-preview-item__title">{message.full_name}</p>
                <p className="admin-preview-item__meta">{message.email}</p>
                <p className="admin-preview-item__excerpt">
                  {excerptText(message.message)}
                </p>
                <p className="admin-preview-item__meta">
                  {formatAdminDateTime(message.created_at, i18n.language)}
                </p>
              </div>
              <div className="admin-preview-item__aside">
                <span
                  className={`admin-status-badge admin-status-badge--message-${message.status}`}
                >
                  {t(`messageStatus.${message.status}`)}
                </span>
                <Link to="/admin/contact-messages">{t('viewMessages')}</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
