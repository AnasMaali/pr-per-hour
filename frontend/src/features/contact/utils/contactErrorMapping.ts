import { ApiClientError } from '@/shared/api/errors'
import type { ContactFieldErrors } from '@/features/contact/types/contact.types'

const FIELD_KEYS = new Set([
  'full_name',
  'email',
  'phone',
  'organization',
  'message',
])

export interface MappedContactError {
  fieldErrors: ContactFieldErrors
  formMessageKey: string | null
  formMessage: string | null
  requestId: string | null
  errorCode: string | null
  status: number | null
}

function firstMessage(messages: string[] | undefined): string | undefined {
  return messages?.find((item) => typeof item === 'string' && item.trim() !== '')
}

export function mapContactApiError(error: unknown): MappedContactError {
  if (!(error instanceof ApiClientError)) {
    return {
      fieldErrors: {},
      formMessageKey: 'errorUnexpected',
      formMessage: null,
      requestId: null,
      errorCode: null,
      status: null,
    }
  }

  const { normalized } = error
  const fieldErrors: ContactFieldErrors = {}

  if (normalized.errors) {
    for (const [key, messages] of Object.entries(normalized.errors)) {
      if (!FIELD_KEYS.has(key)) continue
      const message = firstMessage(messages)
      if (message) {
        fieldErrors[key as keyof ContactFieldErrors] = message
      }
    }
  }

  if (normalized.status === 429) {
    return {
      fieldErrors,
      formMessageKey: 'errorRateLimited',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
      status: 429,
    }
  }

  if (normalized.isNetworkError) {
    return {
      fieldErrors,
      formMessageKey: 'errorNetwork',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
      status: normalized.status,
    }
  }

  if (normalized.isForbidden || normalized.status === 403) {
    return {
      fieldErrors,
      formMessageKey: 'errorForbidden',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
      status: 403,
    }
  }

  if (normalized.isValidationError || normalized.status === 422) {
    const hasFields = Object.keys(fieldErrors).length > 0
    return {
      fieldErrors,
      formMessageKey: hasFields ? null : 'errorValidation',
      formMessage: hasFields ? null : normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
      status: 422,
    }
  }

  if (normalized.status !== null && normalized.status >= 500) {
    return {
      fieldErrors,
      formMessageKey: 'errorServer',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
      status: normalized.status,
    }
  }

  return {
    fieldErrors,
    formMessageKey: 'errorUnexpected',
    formMessage: normalized.message || null,
    requestId: normalized.requestId,
    errorCode: normalized.errorCode,
    status: normalized.status,
  }
}
