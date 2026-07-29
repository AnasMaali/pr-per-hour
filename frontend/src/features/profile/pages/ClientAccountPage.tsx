import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import '@/features/profile/styles/client-profile.css'

/**
 * Simple client account home — no booking/payment/invoice/chatbot cards.
 */
export function ClientAccountPage() {
  const { t } = useTranslation('profile')
  const { user } = useAuth()

  useDocumentMeta({
    title: t('accountMetaTitle'),
    description: t('accountMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  return (
    <div className="client-profile-page client-account-page">
      <header className="client-profile-header">
        <div>
          <p className="client-profile-header__eyebrow">{t('accountEyebrow')}</p>
          <h1>{t('accountTitle', { name: user?.name ?? '' })}</h1>
          <p>{t('accountLead')}</p>
        </div>
      </header>

      <section
        className="client-account-summary"
        aria-labelledby="account-summary-heading"
      >
        <h2 id="account-summary-heading">{t('accountSummaryTitle')}</h2>
        <dl className="client-account-summary__list">
          <div>
            <dt>{t('name')}</dt>
            <dd>{user?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>{t('email')}</dt>
            <dd className="profile-summary__email">{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt>{t('phone')}</dt>
            <dd>
              {user?.phone?.trim() ? user.phone : t('phoneEmpty')}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="client-account-actions"
        aria-labelledby="account-next-heading"
      >
        <h2 id="account-next-heading">{t('accountNextTitle')}</h2>
        <p>{t('accountNextLead')}</p>
        <ul className="client-account-actions__list">
          <li>
            <Link className="btn btn--lift" to="/services">
              {t('accountExploreServices')}
            </Link>
          </li>
          <li>
            <Link className="btn btn--secondary btn--lift" to="/contact">
              {t('accountContactCompany')}
            </Link>
          </li>
          <li>
            <Link className="btn btn--ghost btn--lift" to="/dashboard/profile">
              {t('accountManageProfile')}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
