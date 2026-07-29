import { browserStorage } from '@/shared/lib/browserStorage'

export type AppLocale = 'en' | 'ar'

export const LOCALE_STORAGE_KEY = 'prph.locale'
export const DEFAULT_LOCALE: AppLocale = 'en'

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'en' || value === 'ar'
}

export function getDirection(locale: AppLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LOCALE
  }

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = candidate.toLowerCase().split('-')[0]
    if (normalized === 'ar') return 'ar'
    if (normalized === 'en') return 'en'
  }

  return DEFAULT_LOCALE
}

export function readStoredLocale(): AppLocale | null {
  const stored = browserStorage.get(LOCALE_STORAGE_KEY)
  return isAppLocale(stored) ? stored : null
}

export function persistLocale(locale: AppLocale): void {
  browserStorage.set(LOCALE_STORAGE_KEY, locale)
}

export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.lang = locale
  document.documentElement.dir = getDirection(locale)
}

export function resolveInitialLocale(): AppLocale {
  return readStoredLocale() ?? detectBrowserLocale()
}
