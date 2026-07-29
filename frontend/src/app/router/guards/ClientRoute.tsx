import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageLoader } from '@/shared/components/PageLoader'

/**
 * Client-only area. Admins are redirected to /admin (not client dashboard)
 * unless a future product decision explicitly allows dual access.
 */
export function ClientRoute() {
  const { isAuthenticated, isBootstrapping, isClient, isAdmin } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <ClientLoading />
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}` || '/dashboard'
    return <Navigate to="/login" replace state={{ from }} />
  }

  if (isAdmin && !isClient) {
    return <Navigate to="/admin" replace />
  }

  if (!isClient) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

function ClientLoading() {
  const { t } = useTranslation('auth')
  return <PageLoader label={t('sessionLoading')} />
}
