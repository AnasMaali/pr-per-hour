import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import type { LoginPayload } from '@/features/auth/api/authApi'
import type { AuthUser } from '@/shared/types/user'
import { mapAuthApiError } from '@/features/auth/utils/mapAuthApiError'
import type { AuthFormErrorState } from '@/features/auth/types/authForm.types'

function emptyErrorState(): AuthFormErrorState {
  return {
    fieldErrors: {},
    formMessageKey: null,
    formMessage: null,
    requestId: null,
  }
}

export interface AuthSubmitResult {
  user: AuthUser | null
  error: AuthFormErrorState | null
  emailVerificationRequired?: boolean
  email?: string
}

/** Wraps AuthProvider.login — token/cache stay in the provider. */
export function useLoginMutation() {
  const { login } = useAuth()
  const [pending, setPending] = useState(false)
  const [errorState, setErrorState] = useState<AuthFormErrorState>(emptyErrorState)

  async function submit(payload: LoginPayload): Promise<AuthSubmitResult> {
    setPending(true)
    setErrorState(emptyErrorState())
    try {
      const user = await login(payload)
      return { user, error: null }
    } catch (error) {
      const mapped = mapAuthApiError(error)
      const next: AuthFormErrorState = {
        fieldErrors: mapped.fieldErrors,
        formMessageKey: mapped.formMessageKey,
        formMessage: mapped.formMessage,
        requestId: mapped.requestId,
      }
      setErrorState(next)
      return {
        user: null,
        error: next,
        emailVerificationRequired: mapped.errorCode === 'EMAIL_VERIFICATION_REQUIRED',
        email: payload.email.trim().toLowerCase(),
      }
    } finally {
      setPending(false)
    }
  }

  function clearErrors() {
    setErrorState(emptyErrorState())
  }

  return { submit, pending, errorState, clearErrors }
}
