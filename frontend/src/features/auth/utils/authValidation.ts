import type {
  AuthFieldErrors,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from '@/features/auth/types/authForm.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/
export const OTP_CODE_LENGTH = 6
const OTP_PATTERN = new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`)

export function validateLoginForm(values: LoginFormValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const email = values.email.trim()
  const password = values.password

  if (!email) {
    errors.email = 'validationRequired'
  } else if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'validationInvalidEmail'
  }

  if (!password) {
    errors.password = 'validationRequired'
  }

  return errors
}

export function validateRegisterForm(
  values: RegisterFormValues,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const password = values.password
  const confirmation = values.password_confirmation

  if (!name) {
    errors.name = 'validationRequired'
  } else if (name.length > 255) {
    errors.name = 'validationNameMax'
  }

  if (!email) {
    errors.email = 'validationRequired'
  } else if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'validationInvalidEmail'
  }

  if (phone && phone.length > 50) {
    errors.phone = 'validationPhoneMax'
  }

  if (!password) {
    errors.password = 'validationRequired'
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.password = 'validationPasswordMin'
  }

  if (!confirmation) {
    errors.password_confirmation = 'validationRequired'
  } else if (password !== confirmation) {
    errors.password_confirmation = 'validationPasswordMismatch'
  }

  return errors
}

export function validateEmailOnly(email: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = 'validationRequired'
  } else if (trimmed.length > 255 || !EMAIL_PATTERN.test(trimmed)) {
    errors.email = 'validationInvalidEmail'
  }
  return errors
}

export function validateOtpCode(code: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  if (!code) {
    errors.code = 'validationRequired'
  } else if (!OTP_PATTERN.test(code)) {
    errors.code = 'validationOtpCode'
  }
  return errors
}

export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {
    ...validateEmailOnly(values.email),
    ...validateOtpCode(values.code),
  }
  const password = values.password
  const confirmation = values.password_confirmation

  if (!password) {
    errors.password = 'validationRequired'
  } else if (!PASSWORD_PATTERN.test(password)) {
    errors.password = 'validationPasswordMin'
  }

  if (!confirmation) {
    errors.password_confirmation = 'validationRequired'
  } else if (password !== confirmation) {
    errors.password_confirmation = 'validationPasswordMismatch'
  }

  return errors
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
