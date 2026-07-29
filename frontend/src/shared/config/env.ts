const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL

  if (typeof raw !== 'string' || raw.trim() === '') {
    if (import.meta.env.DEV) {
      console.warn(
        `[config] VITE_API_BASE_URL missing; falling back to ${DEFAULT_API_BASE_URL}`,
      )
    }
    return DEFAULT_API_BASE_URL
  }

  return normalizeBaseUrl(raw)
}

/**
 * Build-time feature flag. Vite replaces `import.meta.env.VITE_*` with a
 * string literal so `=== 'true'` folds for dead-code elimination in routes.
 * Only the exact string "true" enables a feature.
 */
function isViteFeatureEnabled(name: string, value: unknown): boolean {
  if (value === 'true') {
    return true
  }

  if (
    import.meta.env.DEV &&
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.trim() !== 'false'
  ) {
    console.warn(
      `[config] Invalid boolean for ${name} (only "true" enables); using false`,
    )
  }

  return false
}

/**
 * Centralized frontend environment configuration.
 * Do not read `import.meta.env.VITE_*` outside this module (except build-time
 * folds that must use `import.meta.env.VITE_FEATURE_* === 'true'` directly
 * for route-level dead-code elimination).
 *
 * Future modules default to disabled. Keep VITE_FEATURE_* aligned with
 * backend FEATURE_* flags for each release build.
 */
export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  turnstile: {
    enabled: isViteFeatureEnabled(
      'VITE_TURNSTILE_ENABLED',
      import.meta.env.VITE_TURNSTILE_ENABLED,
    ),
    /** Public site key only — never a secret. */
    siteKey:
      typeof import.meta.env.VITE_TURNSTILE_SITE_KEY === 'string'
        ? import.meta.env.VITE_TURNSTILE_SITE_KEY.trim()
        : '',
  },
  features: {
    bookings: isViteFeatureEnabled(
      'VITE_FEATURE_BOOKINGS_ENABLED',
      import.meta.env.VITE_FEATURE_BOOKINGS_ENABLED,
    ),
    chatbot: isViteFeatureEnabled(
      'VITE_FEATURE_CHATBOT_ENABLED',
      import.meta.env.VITE_FEATURE_CHATBOT_ENABLED,
    ),
    payments: isViteFeatureEnabled(
      'VITE_FEATURE_PAYMENTS_ENABLED',
      import.meta.env.VITE_FEATURE_PAYMENTS_ENABLED,
    ),
    invoices: isViteFeatureEnabled(
      'VITE_FEATURE_INVOICES_ENABLED',
      import.meta.env.VITE_FEATURE_INVOICES_ENABLED,
    ),
  },
} as const
