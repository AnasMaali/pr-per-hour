export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

export type AuthFieldErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'phone'
    | 'password'
    | 'password_confirmation'
    | 'code'
    | 'form',
    string
  >
>

export interface ResetPasswordFormValues {
  email: string
  code: string
  password: string
  password_confirmation: string
}

export interface AuthFormErrorState {
  /** Client i18n keys or backend field messages */
  fieldErrors: AuthFieldErrors
  /** i18n key for form-level fallback when backend message is absent */
  formMessageKey: string | null
  /** Safe backend message when present */
  formMessage: string | null
  requestId: string | null
}
