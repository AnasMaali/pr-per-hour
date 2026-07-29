const PENDING_AUTH_KEY = 'prph.pending.auth'
export const RESEND_COOLDOWN_MS = 60_000

export type PendingAuthPurpose = 'verify_email' | 'reset_password'

export interface PendingAuthState {
  email: string
  purpose: PendingAuthPurpose
  /** Epoch ms when resend becomes available. Null means ready now. */
  resendAvailableAt: number | null
}

function isPurpose(value: unknown): value is PendingAuthPurpose {
  return value === 'verify_email' || value === 'reset_password'
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readRaw(): PendingAuthState | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_AUTH_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const record = parsed as Record<string, unknown>
    if (typeof record.email !== 'string' || !isPurpose(record.purpose)) {
      return null
    }
    const email = normalizeEmail(record.email)
    if (!email) return null
    const resendAvailableAt =
      typeof record.resendAvailableAt === 'number' &&
      Number.isFinite(record.resendAvailableAt)
        ? record.resendAvailableAt
        : null
    return { email, purpose: record.purpose, resendAvailableAt }
  } catch {
    return null
  }
}

function write(state: PendingAuthState): void {
  try {
    window.sessionStorage.setItem(
      PENDING_AUTH_KEY,
      JSON.stringify({
        email: normalizeEmail(state.email),
        purpose: state.purpose,
        resendAvailableAt: state.resendAvailableAt,
      }),
    )
  } catch {
    // Private mode / quota — page can still accept email manually.
  }
}

/**
 * Temporary auth email state for verify / reset flows.
 * Stores only normalized email, purpose, and resend timestamp — never OTP or passwords.
 */
export const pendingAuthStorage = {
  get(purpose?: PendingAuthPurpose): PendingAuthState | null {
    const state = readRaw()
    if (!state) return null
    if (purpose && state.purpose !== purpose) return null
    return state
  },

  set(email: string, purpose: PendingAuthPurpose, startCooldown = false): void {
    write({
      email: normalizeEmail(email),
      purpose,
      resendAvailableAt: startCooldown ? Date.now() + RESEND_COOLDOWN_MS : null,
    })
  },

  markResendSent(purpose: PendingAuthPurpose): void {
    const current = pendingAuthStorage.get(purpose)
    if (!current) return
    write({
      ...current,
      resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS,
    })
  },

  clear(purpose?: PendingAuthPurpose): void {
    if (!purpose) {
      try {
        window.sessionStorage.removeItem(PENDING_AUTH_KEY)
      } catch {
        // ignore
      }
      return
    }
    const current = readRaw()
    if (current?.purpose === purpose) {
      try {
        window.sessionStorage.removeItem(PENDING_AUTH_KEY)
      } catch {
        // ignore
      }
    }
  },

  secondsUntilResend(purpose: PendingAuthPurpose): number {
    const state = pendingAuthStorage.get(purpose)
    if (!state?.resendAvailableAt) return 0
    return Math.max(0, Math.ceil((state.resendAvailableAt - Date.now()) / 1000))
  },
}

/** Mask email for display: a***@domain.com */
export function maskEmail(email: string): string {
  const normalized = normalizeEmail(email)
  const at = normalized.indexOf('@')
  if (at <= 0) return normalized
  const local = normalized.slice(0, at)
  const domain = normalized.slice(at + 1)
  if (local.length <= 1) {
    return `${local}***@${domain}`
  }
  return `${local[0]}***@${domain}`
}
