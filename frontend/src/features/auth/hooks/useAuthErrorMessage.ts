import { useTranslation } from 'react-i18next'
import type { AuthFormErrorState } from '@/features/auth/types/authForm.types'

const CLIENT_ERROR_KEYS = new Set([
  'validationRequired',
  'validationInvalidEmail',
  'validationNameMax',
  'validationPhoneMax',
  'validationPasswordMin',
  'validationPasswordMismatch',
  'validationOtpCode',
])

/** Resolve a field error that may be an i18n key or a backend message. */
export function useAuthErrorMessage() {
  const { t } = useTranslation('auth')

  function resolveFieldError(value: string | undefined): string | undefined {
    if (!value) return undefined
    if (CLIENT_ERROR_KEYS.has(value)) {
      return t(value)
    }
    return value
  }

  function resolveFormMessage(state: AuthFormErrorState): string | null {
    if (state.formMessage && state.formMessage.trim() !== '') {
      return state.formMessage
    }
    if (state.formMessageKey) {
      return t(state.formMessageKey)
    }
    return null
  }

  return { resolveFieldError, resolveFormMessage }
}
