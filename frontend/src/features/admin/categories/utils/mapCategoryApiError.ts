import { ApiClientError } from '@/shared/api/errors'
import type { CategoryFieldErrors } from '@/features/admin/categories/types/adminCategories.types'

const FIELD_KEYS = new Set(['name', 'slug', 'description', 'is_active'])

export interface MappedCategoryError {
  fieldErrors: CategoryFieldErrors
  formMessageKey: string | null
  formMessage: string | null
  requestId: string | null
}

function firstMessage(messages: string[] | undefined): string | undefined {
  return messages?.find((item) => typeof item === 'string' && item.trim() !== '')
}

export function mapCategoryApiError(error: unknown): MappedCategoryError {
  if (!(error instanceof ApiClientError)) {
    return {
      fieldErrors: {},
      formMessageKey: 'errorUnexpected',
      formMessage: null,
      requestId: null,
    }
  }

  const { normalized } = error
  const fieldErrors: CategoryFieldErrors = {}

  if (normalized.errors) {
    for (const [key, messages] of Object.entries(normalized.errors)) {
      if (!FIELD_KEYS.has(key)) continue
      const message = firstMessage(messages)
      if (message) {
        fieldErrors[key as keyof CategoryFieldErrors] = message
      }
    }
  }

  if (normalized.status === 429) {
    return {
      fieldErrors,
      formMessageKey: 'errorRateLimited',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.isNetworkError) {
    return {
      fieldErrors,
      formMessageKey: 'errorNetwork',
      formMessage: null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.isUnauthorized || normalized.status === 401) {
    return {
      fieldErrors,
      formMessageKey: 'errorUnauthorized',
      formMessage: null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.isForbidden || normalized.status === 403) {
    return {
      fieldErrors,
      formMessageKey: 'errorForbidden',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.status === 404) {
    return {
      fieldErrors,
      formMessageKey: 'errorNotFound',
      formMessage: null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.status === 409) {
    return {
      fieldErrors,
      formMessageKey: 'errorConflict',
      formMessage: normalized.message || null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.isValidationError) {
    const hasFields = Object.keys(fieldErrors).length > 0
    return {
      fieldErrors,
      formMessageKey: hasFields ? null : 'errorValidation',
      formMessage: hasFields ? null : normalized.message || null,
      requestId: normalized.requestId,
    }
  }

  if (normalized.status !== null && normalized.status >= 500) {
    return {
      fieldErrors,
      formMessageKey: 'errorServer',
      formMessage: null,
      requestId: normalized.requestId,
    }
  }

  return {
    fieldErrors,
    formMessageKey: 'errorUnexpected',
    formMessage: normalized.message || null,
    requestId: normalized.requestId,
  }
}
