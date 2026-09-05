const SESSION_KEY = 'prph.chatbot.session'

/**
 * `'guest'` or `user:<id>` — identifies who a stored conversation token
 * belongs to. A stored token is only reused when the current visitor's
 * identity still matches; otherwise it is discarded so a guest's
 * conversation can never be read as (or overwritten by) a signed-in
 * user's, and vice versa.
 */
export type ChatIdentity = 'guest' | `user:${number}`

interface StoredChatSession {
  token: string
  identity: ChatIdentity
}

function isStoredChatSession(value: unknown): value is StoredChatSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).token === 'string' &&
    typeof (value as Record<string, unknown>).identity === 'string'
  )
}

/**
 * Conversation tokens are opaque but still grant read/write access to a
 * conversation, so — like the auth bearer token — they live in
 * sessionStorage only (tab-scoped, cleared on browser close).
 */
export const chatSessionStorage = {
  read(identity: ChatIdentity): string | null {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null

      const parsed: unknown = JSON.parse(raw)
      if (!isStoredChatSession(parsed)) return null
      if (parsed.identity !== identity) return null
      if (parsed.token.trim() === '') return null

      return parsed.token
    } catch {
      return null
    }
  },

  write(identity: ChatIdentity, token: string): void {
    try {
      const payload: StoredChatSession = { token, identity }
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    } catch {
      // Private mode / storage denial: the conversation still works for
      // this render, it just will not survive a reload.
    }
  },

  clear(): void {
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
  },
}
