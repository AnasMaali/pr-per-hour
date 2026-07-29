import { ApiClientError } from '@/shared/api/errors'
import type { AuthFieldErrors } from '@/features/auth/types/authForm.types'

const FIELD_KEYS = new Set([
  'name',
  'email',
  'phone',
  'password',
  'password_confirmation',
  'code',
])

export interface MappedAuthError {
  fieldErrors: AuthFieldErrors
  formMessageKey: string | null
  /** Prefer backend message when safe; otherwise use formMessageKey. */
  formMessage: string | null
  requestId: string | null
  errorCode: string | null
}

function firstMessage(messages: string[] | undefined): string | undefined {
  return messages?.find((item) => typeof item === 'string' && item.trim() !== '')
}

/**
 * Map normalized API errors into form field + form-level messages.
 * Never returns stack traces or Axios internals.
 */
export function mapAuthApiError(error: unknown): MappedAuthError {
  if (!(error instanceof ApiClientError)) {
    return {
      fieldErrors: {},
      formMessageKey: 'errorUnexpected',
      formMessage: null,
      requestId: null,
      errorCode: null,
    }
  }

  const { normalized } = error
  const fieldErrors: AuthFieldErrors = {}

  if (normalized.errors) {
    for (const [key, messages] of Object.entries(normalized.errors)) {
      if (!FIELD_KEYS.has(key)) continue
      const message = firstMessage(messages)
      if (message) {
        fieldErrors[key as keyof AuthFieldErrors] = message
      }
    }
  }

  const code = normalized.errorCode

  if (normalized.isInactiveAccount || code === 'INACTIVE_ACCOUNT') {
    return {
      fieldErrors,
      formMessageKey: 'inactiveAccount',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'EMAIL_VERIFICATION_REQUIRED') {
    return {
      fieldErrors,
      formMessageKey: 'emailVerificationRequired',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'HUMAN_VERIFICATION_FAILED') {
    return {
      fieldErrors,
      formMessageKey: 'humanVerificationFailed',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'MAIL_DELIVERY_FAILED') {
    return {
      fieldErrors,
      formMessageKey: 'mailDeliveryFailed',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'INVALID_OR_EXPIRED_CODE') {
    return {
      fieldErrors,
      formMessageKey: 'errorInvalidOrExpiredCode',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'RESET_CODE_INVALID') {
    return {
      fieldErrors,
      formMessageKey: 'errorResetCodeInvalid',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'CODE_ATTEMPTS_EXCEEDED') {
    return {
      fieldErrors,
      formMessageKey: 'errorCodeAttemptsExceeded',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (code === 'EMAIL_ALREADY_VERIFIED') {
    return {
      fieldErrors,
      formMessageKey: 'errorEmailAlreadyVerified',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.status === 429 || code === 'TOO_MANY_REQUESTS') {
    return {
      fieldErrors,
      formMessageKey: 'errorRateLimited',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.isNetworkError) {
    return {
      fieldErrors,
      formMessageKey: 'errorNetwork',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.isValidationError) {
    const hasFields = Object.keys(fieldErrors).length > 0
    return {
      fieldErrors,
      formMessageKey: hasFields ? null : 'errorValidation',
      formMessage: hasFields ? null : normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.status === 401) {
    return {
      fieldErrors,
      formMessageKey: 'errorInvalidCredentials',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.isForbidden || normalized.status === 403) {
    return {
      fieldErrors,
      formMessageKey: 'errorForbidden',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  if (normalized.status !== null && normalized.status >= 500) {
    return {
      fieldErrors,
      formMessageKey: 'errorServer',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: code,
    }
  }

  return {
    fieldErrors,
    formMessageKey: 'errorUnexpected',
    formMessage: normalized.message || null,
    requestId: normalized.requestId,
    errorCode: code,
  }
}
