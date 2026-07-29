/**
 * Standardized Laravel API envelopes used by PR Per Hour.
 * See docs/API_STANDARDS.md and docs/FRONTEND_API_CLIENT.md.
 */

export interface ApiPaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface ApiSuccessResponse<TData = unknown, TMeta = unknown> {
  success: true
  message?: string
  data: TData
  meta?: TMeta
}

export interface ApiErrorBody {
  success: false
  message: string
  errors?: Record<string, string[]>
  error_code?: string
  request_id?: string
}

export type ApiResponse<TData = unknown, TMeta = unknown> =
  | ApiSuccessResponse<TData, TMeta>
  | ApiErrorBody

export type ValidationErrors = Record<string, string[]>

export interface NormalizedApiError {
  message: string
  status: number | null
  errorCode: string | null
  requestId: string | null
  errors: ValidationErrors | null
  isNetworkError: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  isValidationError: boolean
  isInactiveAccount: boolean
}
