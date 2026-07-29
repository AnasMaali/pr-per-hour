/**
 * Typed localStorage helpers. Prefer domain-specific wrappers
 * (tokenStorage, localeStorage, themeStorage) over calling this directly.
 */
export const browserStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Quota / private mode — fail silently; app remains usable without persistence.
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
