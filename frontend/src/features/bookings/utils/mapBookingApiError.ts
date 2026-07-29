import { ApiClientError } from '@/shared/api/errors'
import type { BookingFieldErrors } from '@/features/bookings/types/bookings.types'

const FIELD_KEYS = new Set([
  'service_id',
  'booking_date',
  'start_time',
  'end_time',
  'notes',
])

export interface MappedBookingError {
  fieldErrors: BookingFieldErrors
  formMessageKey: string | null
  formMessage: string | null
  requestId: string | null
  errorCode: string | null
}

function firstMessage(messages: string[] | undefined): string | undefined {
  return messages?.find((item) => typeof item === 'string' && item.trim() !== '')
}

export function mapBookingApiError(error: unknown): MappedBookingError {
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
  const fieldErrors: BookingFieldErrors = {}

  if (normalized.errors) {
    for (const [key, messages] of Object.entries(normalized.errors)) {
      if (!FIELD_KEYS.has(key)) continue
      const message = firstMessage(messages)
      if (message) {
        fieldErrors[key as keyof BookingFieldErrors] = message
      }
    }
  }

  if (normalized.errorCode === 'BOOKING_TIME_CONFLICT') {
    return {
      fieldErrors,
      formMessageKey: 'errorTimeConflict',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.errorCode === 'BOOKING_CANNOT_BE_CANCELLED') {
    return {
      fieldErrors,
      formMessageKey: 'errorCannotCancel',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
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

  if (normalized.isUnauthorized) {
    return {
      fieldErrors,
      formMessageKey: 'errorUnauthorized',
      formMessage: null,
      requestId: normalized.requestId,
      errorCode: normalized.errorCode,
    }
  }

  if (normalized.isForbidden) {
    return {
      fieldErrors,
      formMessageKey: 'errorForbidden',
      formMessage: null,
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
