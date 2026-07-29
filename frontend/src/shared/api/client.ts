import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/shared/config/env'
import { tokenStorage } from '@/shared/lib/tokenStorage'
import { ApiClientError, normalizeApiError } from '@/shared/api/errors'
import type { ApiSuccessResponse } from '@/shared/api/types'

type LocaleReader = () => string
type UnauthorizedHandler = () => void

let readLocale: LocaleReader = () => 'en'
let onUnauthorized: UnauthorizedHandler | null = null
let handlingUnauthorized = false

/** Wire current UI locale into the Axios client (called from i18n bootstrap). */
export function setApiLocaleReader(reader: LocaleReader): void {
  readLocale = reader
}

/**
 * Register a single 401 handler (auth layer). Prevents redirect loops by
 * ignoring repeated unauthorized events while one is already being handled.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      Accept: 'application/json',
    },
    timeout: 30_000,
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const locale = readLocale()
    config.headers.set('X-Locale', locale)

    const token = tokenStorage.get()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.delete('Authorization')
    }

    // Only set Content-Type when a body is present (avoids unnecessary CORS preflights on GET).
    if (config.data !== undefined && config.data !== null && !config.headers.has('Content-Type')) {
      config.headers.set('Content-Type', 'application/json')
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const normalized = normalizeApiError(error)

      if (normalized.isUnauthorized && onUnauthorized && !handlingUnauthorized) {
        handlingUnauthorized = true
        try {
          onUnauthorized()
        } finally {
          // Allow a later 401 after the next successful auth cycle.
          queueMicrotask(() => {
            handlingUnauthorized = false
          })
        }
      }

      return Promise.reject(new ApiClientError(normalized))
    },
  )

  return client
}

/** Single shared Axios instance for the entire frontend. */
export const apiClient = createApiClient()

export async function apiGet<TData>(
  url: string,
  config?: Parameters<AxiosInstance['get']>[1],
): Promise<ApiSuccessResponse<TData>> {
  const response = await apiClient.get<ApiSuccessResponse<TData>>(url, config)
  return response.data
}

export async function apiPost<TData, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: Parameters<AxiosInstance['post']>[2],
): Promise<ApiSuccessResponse<TData>> {
  const response = await apiClient.post<ApiSuccessResponse<TData>>(url, body, config)
  return response.data
}

export async function apiPatch<TData, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: Parameters<AxiosInstance['patch']>[2],
): Promise<ApiSuccessResponse<TData>> {
  const response = await apiClient.patch<ApiSuccessResponse<TData>>(url, body, config)
  return response.data
}

export async function apiDelete<TData = null>(
  url: string,
  config?: Parameters<AxiosInstance['delete']>[1],
): Promise<ApiSuccessResponse<TData> | void> {
  const response = await apiClient.delete<ApiSuccessResponse<TData>>(url, config)
  if (response.status === 204) {
    return
  }
  return response.data
}
