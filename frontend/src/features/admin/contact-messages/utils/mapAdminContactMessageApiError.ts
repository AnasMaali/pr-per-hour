import { ApiClientError } from '@/shared/api/errors'
import type { AdminContactMessageFieldErrors } from '@/features/admin/contact-messages/types/adminContactMessages.types'

const FIELD_KEYS = new Set(['status', 'email', 'created_from', 'created_to'])

export interface MappedAdminContactMessageError {
  fieldErrors: AdminContactMessageFieldErrors
  formMessageKey: string | null
  formMessage: string | null
  requestId: string | null
  errorCode: string | null
}

function firstMessage(messages: string[] | undefined): string | undefined {
  return messages?.find((item) => typeof item === 'string' && item.trim() !== '')
}

export function mapAdminContactMessageApiError(
  error: unknown,
): MappedAdminContactMessageError {
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
  const fieldErrors: AdminContactMessageFieldErrors = {}

  if (normalized.errors) {
    for (const [key, messages] of Object.entries(normalized.errors)) {
      if (!FIELD_KEYS.has(key)) continue
      const message = firstMessage(messages)
      if (message) {
        fieldErrors[key as keyof AdminContactMessageFieldErrors] = message
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
    }
  }

  if (normalized.isNetworkError) {
    return {
      fieldErrors,
      formMessageKey: 'errorNetwork',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.isUnauthorized || normalized.status === 401) {
    return {
      fieldErrors,
      formMessageKey: 'errorUnauthorized',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.isForbidden || normalized.status === 403) {
    return {
      fieldErrors,
      formMessageKey: 'errorForbidden',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.status === 404) {
    return {
      fieldErrors,
      formMessageKey: 'errorNotFound',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.isValidationError) {
    const hasFields = Object.keys(fieldErrors).length > 0
    return {
      fieldErrors,
      formMessageKey: hasFields ? null : 'errorValidation',
      formMessage: hasFields ? null : normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.status !== null && normalized.status >= 500) {
    return {
      fieldErrors,
      formMessageKey: 'errorServer',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  return {
    fieldErrors,
    formMessageKey: 'errorUnexpected',
    formMessage: normalized.message || null,
    requestId: normalized.requestId,
    errorCode: normalized.errorCode,
  }
}
