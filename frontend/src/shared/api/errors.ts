import type { AxiosError } from 'axios'
import type { ApiErrorBody, NormalizedApiError, ValidationErrors } from '@/shared/api/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readValidationErrors(value: unknown): ValidationErrors | null {
  if (!isRecord(value)) {
    return null
  }

  const result: ValidationErrors = {}
  for (const [key, messages] of Object.entries(value)) {
    if (Array.isArray(messages) && messages.every((item) => typeof item === 'string')) {
      result[key] = messages
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

function readHeaderRequestId(headers: unknown): string | null {
  if (!isRecord(headers)) {
    return null
  }

  const raw =
    headers['x-request-id'] ??
    headers['X-Request-ID'] ??
    headers['X-Request-Id']

  return typeof raw === 'string' && raw.trim() !== '' ? raw : null
}

/**
 * Normalize Axios / network failures into a stable shape for UI and logging.
 * Never includes tokens or stack traces.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!isAxiosLike(error)) {
    return {
      message: 'An unexpected error occurred.',
      status: null,
      errorCode: null,
      requestId: null,
      errors: null,
      isNetworkError: false,
      isUnauthorized: false,
      isForbidden: false,
      isValidationError: false,
      isInactiveAccount: false,
    }
  }

  const status = error.response?.status ?? null
  const data = error.response?.data
  const body = isRecord(data) ? (data as Partial<ApiErrorBody>) : null
  const message =
    (typeof body?.message === 'string' && body.message.trim() !== ''
      ? body.message
      : null) ??
    (error.message && error.message.trim() !== '' ? error.message : null) ??
    'An unexpected error occurred.'

  const errorCode = typeof body?.error_code === 'string' ? body.error_code : null
  const requestId =
    (typeof body?.request_id === 'string' ? body.request_id : null) ??
    readHeaderRequestId(error.response?.headers)

  const errors = readValidationErrors(body?.errors)
  const isNetworkError = !error.response && Boolean(error.request)

  return {
    message,
    status,
    errorCode,
    requestId,
    errors,
    isNetworkError,
    isUnauthorized: status === 401,
    isForbidden: status === 403,
    isValidationError: status === 422 || errorCode === 'VALIDATION_FAILED',
    isInactiveAccount: errorCode === 'INACTIVE_ACCOUNT',
  }
}

function isAxiosLike(error: unknown): error is AxiosError<ApiErrorBody> {
  return isRecord(error) && error.isAxiosError === true
}

export class ApiClientError extends Error {
  readonly normalized: NormalizedApiError

  constructor(normalized: NormalizedApiError) {
    super(normalized.message)
    this.name = 'ApiClientError'
    this.normalized = normalized
  }
}
