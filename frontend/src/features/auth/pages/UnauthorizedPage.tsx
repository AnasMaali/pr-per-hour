import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { Button } from '@/shared/components/Button'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { getDefaultRedirectForUser } from '@/features/auth/utils/authRedirect'
import '@/features/auth/styles/auth-pages.css'

export function UnauthorizedPage() {
  const { t } = useTranslation('auth')
  const { isAuthenticated, user, logout, isBootstrapping } = useAuth()

  useDocumentMeta({
    title: t('unauthorizedMetaTitle'),
    description: t('unauthorizedMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const dashboardPath = getDefaultRedirectForUser(user)

  return (
    <section className="auth-unauthorized">
      <AuthCard>
        <AuthHeader
          title={t('unauthorizedTitle')}
          subtitle={t('unauthorizedDescription')}
        />
        <div className="auth-unauthorized__actions">
          <Link className="btn" to="/">
            {t('backHome')}
          </Link>
          {isAuthenticated ? (
            <Link className="btn btn--secondary" to={dashboardPath}>
              {t('returnDashboard')}
            </Link>
          ) : (
            <Link className="btn btn--secondary" to="/login">
              {t('signIn')}
            </Link>
          )}
          {isAuthenticated ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isBootstrapping}
              onClick={() => {
                void logout()
              }}
            >
              {t('signOut')}
            </Button>
          ) : null}
        </div>
      </AuthCard>
    </section>
  )
}
