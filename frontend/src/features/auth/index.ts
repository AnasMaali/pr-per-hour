/**
 * Auth feature public API.
 */
export { AuthProvider, useAuth } from '@/features/auth/AuthProvider'
export { authApi } from '@/features/auth/api/authApi'
export {
  isAdmin,
  isClient,
  isActiveUser,
  canAccessAdminArea,
  canAccessClientArea,
} from '@/features/auth/utils/roles'
export {
  resolvePostAuthRedirect,
  isSafeInternalPath,
  getDefaultRedirectForUser,
  isPublicDestinationPath,
  isAdminDestinationPath,
  isClientDashboardPath,
  readIntendedFromState,
} from '@/features/auth/utils/authRedirect'
export { LoginPage } from '@/features/auth/pages/LoginPage'
export { RegisterPage } from '@/features/auth/pages/RegisterPage'
export { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
export { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
export { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
export { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage'
