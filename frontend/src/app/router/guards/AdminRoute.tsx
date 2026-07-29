import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageLoader } from '@/shared/components/PageLoader'

export function AdminRoute() {
  const { isAuthenticated, isBootstrapping, isAdmin } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <AdminLoading />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

function AdminLoading() {
  const { t } = useTranslation('auth')
  return <PageLoader label={t('sessionLoading')} />
}
