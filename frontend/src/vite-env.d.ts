/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_TURNSTILE_ENABLED?: string
  readonly VITE_TURNSTILE_SITE_KEY?: string
  readonly VITE_FEATURE_BOOKINGS_ENABLED?: string
  readonly VITE_FEATURE_CHATBOT_ENABLED?: string
  readonly VITE_FEATURE_PAYMENTS_ENABLED?: string
  readonly VITE_FEATURE_INVOICES_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
