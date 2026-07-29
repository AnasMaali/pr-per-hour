import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { env } from '@/shared/config/env'

const ACTIONS = [
  { to: '/admin/users', key: 'actionUsers' as const },
  { to: '/admin/categories', key: 'actionCategories' as const },
  { to: '/admin/services', key: 'actionServices' as const },
  ...(env.features.bookings
    ? [{ to: '/admin/bookings', key: 'actionBookings' as const }]
    : []),
  { to: '/admin/contact-messages', key: 'actionMessages' as const },
  { to: '/', key: 'actionPublicSite' as const, externalFeel: true },
]

export function AdminQuickActions() {
  const { t } = useTranslation('admin')

  return (
    <section
      className="admin-quick-actions"
      aria-labelledby="admin-quick-actions-heading"
    >
      <h2 id="admin-quick-actions-heading">{t('quickActions')}</h2>
      <p className="admin-section-lead">{t('quickActionsLead')}</p>
      <ul className="admin-quick-actions__list">
        {ACTIONS.map((action) => (
          <li key={action.to}>
            <Link
              className={action.externalFeel ? 'btn btn--secondary' : 'btn'}
              to={action.to}
            >
              {t(action.key)}
            </Link>
          </li>
        ))}
      </ul>
      <p className="admin-section-note">{t('managementSectionsNote')}</p>
    </section>
  )
}
