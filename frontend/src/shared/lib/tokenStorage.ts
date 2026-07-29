const AUTH_TOKEN_KEY = 'prph.auth.token'

/**
 * Bearer tokens are limited to the current browser tab via sessionStorage.
 * This avoids persistent tokens surviving a browser restart and also removes
 * any legacy localStorage token left by older builds.
 *
 * HttpOnly cookie auth remains the preferred long-term option if the frontend
 * and API are deployed under a controlled same-site domain.
 */
export const tokenStorage = {
  get(): string | null {
    try {
      const value = window.sessionStorage.getItem(AUTH_TOKEN_KEY)
      return value && value.trim() !== '' ? value : null
    } catch {
      return null
    }
  },

  set(token: string): void {
    tokenStorage.removeLegacyToken()

    if (!token || token.trim() === '') {
      tokenStorage.remove()
      return
    }

    try {
      window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    } catch {
      // Private mode / storage denial: the API call succeeded, but the session
      // cannot persist. The next protected request will safely fail with 401.
    }
  },

  remove(): void {
    try {
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    } catch {
      // ignore
    }
    tokenStorage.removeLegacyToken()
  },

  hasToken(): boolean {
    return tokenStorage.get() !== null
  },

  removeLegacyToken(): void {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
    } catch {
      // ignore
    }
  },
}
