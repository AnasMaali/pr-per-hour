import { browserStorage } from '@/shared/lib/browserStorage'

/**
 * Explicit theme modes exposed in the UI (Light / Dark only).
 *
 * Legacy note: storage may still contain `"system"` from older builds.
 * `normalizeThemeMode` maps that (and missing values) to the current OS
 * preference and callers persist the explicit result so System never remains
 * selectable or sticky in UI state.
 */
export type ThemeMode = 'light' | 'dark'
export type ResolvedTheme = ThemeMode

/** @deprecated Alias for ThemeMode — System is no longer a selectable preference. */
export type ThemePreference = ThemeMode

export const THEME_STORAGE_KEY = 'prph.theme'

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Normalize any stored / inbound value to an explicit Light or Dark mode.
 * Legacy `"system"` resolves to the current OS preference once.
 */
export function normalizeThemeMode(value: unknown): ThemeMode {
  if (isThemeMode(value)) {
    return value
  }
  return getSystemTheme()
}

export function resolveTheme(preference: ThemeMode): ResolvedTheme {
  return preference
}

export function readStoredTheme(): ThemeMode | null {
  const stored = browserStorage.get(THEME_STORAGE_KEY)
  if (stored === null || stored === undefined || stored === '') {
    return null
  }
  if (isThemeMode(stored)) {
    return stored
  }
  // Legacy "system" or garbage → treat as unset so we normalize + persist.
  if (stored === 'system') {
    return null
  }
  return null
}

export function persistTheme(preference: ThemeMode): void {
  browserStorage.set(THEME_STORAGE_KEY, preference)
}

export function applyDocumentTheme(
  preference: ThemeMode,
  resolved: ResolvedTheme = resolveTheme(preference),
): void {
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-theme-preference', preference)
}

/**
 * Initial preference for React + persistence.
 * First visit / legacy system → resolve OS theme and persist explicitly.
 */
export function resolveInitialThemePreference(): ThemeMode {
  const stored = readStoredTheme()
  if (stored) {
    return stored
  }

  const normalized = normalizeThemeMode(
    browserStorage.get(THEME_STORAGE_KEY),
  )
  persistTheme(normalized)
  return normalized
}
