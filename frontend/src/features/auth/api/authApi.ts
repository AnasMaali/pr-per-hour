import { apiGet, apiPatch, apiPost } from '@/shared/api/client'
import type { AuthTokenPayload, AuthUser } from '@/shared/types/user'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone?: string | null
  password: string
  password_confirmation: string
  turnstile_token?: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
}

/** Registration no longer returns a Sanctum token (Phase 7B). */
export interface RegistrationResult {
  email: string
  email_verification_required: true
  verification_sent: boolean
}

export interface EmailCodePayload {
  email: string
  turnstile_token?: string
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  password: string
  password_confirmation: string
}

export interface VerificationCodeSentResult {
  sent: boolean
}

export const authApi = {
  login(payload: LoginPayload, signal?: AbortSignal) {
    return apiPost<AuthTokenPayload>('/auth/login', payload, { signal })
  },

  register(payload: RegisterPayload, signal?: AbortSignal) {
    return apiPost<RegistrationResult>('/auth/register', payload, { signal })
  },

  requestEmailVerificationCode(payload: EmailCodePayload, signal?: AbortSignal) {
    return apiPost<VerificationCodeSentResult>(
      '/auth/email/verification-code',
      payload,
      { signal },
    )
  },

  verifyEmail(payload: VerifyEmailPayload, signal?: AbortSignal) {
    return apiPost<null>('/auth/email/verify', payload, { signal })
  },

  forgotPassword(payload: EmailCodePayload, signal?: AbortSignal) {
    return apiPost<null>('/auth/password/forgot', payload, { signal })
  },

  resetPassword(payload: ResetPasswordPayload, signal?: AbortSignal) {
    return apiPost<null>('/auth/password/reset', payload, { signal })
  },

  me(signal?: AbortSignal) {
    return apiGet<AuthUser>('/auth/me', { signal })
  },

  logout(signal?: AbortSignal) {
    return apiPost<null>('/auth/logout', undefined, { signal })
  },

  updateProfile(payload: UpdateProfilePayload, signal?: AbortSignal) {
    return apiPatch<AuthUser>('/auth/profile', payload, { signal })
  },
}
