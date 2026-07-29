import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { PageLoader } from '@/shared/components/PageLoader'
import {
  readIntendedFromState,
  resolvePostAuthRedirect,
} from '@/features/auth/utils/authRedirect'

export function GuestOnlyRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <GuestLoading />
  }

  if (isAuthenticated) {
    const redirectTo = resolvePostAuthRedirect(
      readIntendedFromState(location.state),
      user,
    )
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

function GuestLoading() {
  const { t } = useTranslation('auth')
  return <PageLoader label={t('sessionLoading')} />
}
