import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import type {
  RegisterPayload,
  RegistrationResult,
} from '@/features/auth/api/authApi'
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

export interface RegisterSubmitResult {
  data: RegistrationResult | null
  error: AuthFormErrorState | null
}

/** Wraps AuthProvider.register — no token is stored until email verification + login. */
export function useRegisterMutation() {
  const { register } = useAuth()
  const [pending, setPending] = useState(false)
  const [errorState, setErrorState] = useState<AuthFormErrorState>(emptyErrorState)

  async function submit(payload: RegisterPayload): Promise<RegisterSubmitResult> {
    setPending(true)
    setErrorState(emptyErrorState())
    try {
      const data = await register(payload)
      return { data, error: null }
    } catch (error) {
      const mapped = mapAuthApiError(error)
      const next: AuthFormErrorState = {
        fieldErrors: mapped.fieldErrors,
        formMessageKey: mapped.formMessageKey,
        formMessage: mapped.formMessage,
        requestId: mapped.requestId,
      }
      setErrorState(next)
      return { data: null, error: next }
    } finally {
      setPending(false)
    }
  }

  function clearErrors() {
    setErrorState(emptyErrorState())
  }

  return { submit, pending, errorState, clearErrors }
}
