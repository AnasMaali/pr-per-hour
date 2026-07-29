import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthFormError } from '@/features/auth/components/AuthFormError'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { OtpCodeInput } from '@/features/auth/components/OtpCodeInput'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { PasswordRules } from '@/features/auth/components/PasswordRules'
import { authApi } from '@/features/auth/api/authApi'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import type {
  AuthFieldErrors,
  AuthFormErrorState,
  ResetPasswordFormValues,
} from '@/features/auth/types/authForm.types'
import { mapAuthApiError } from '@/features/auth/utils/mapAuthApiError'
import {
  hasFieldErrors,
  validateResetPasswordForm,
} from '@/features/auth/utils/authValidation'
import {
  maskEmail,
  pendingAuthStorage,
} from '@/features/auth/utils/pendingAuthStorage'

function emptyErrorState(): AuthFormErrorState {
  return {
    fieldErrors: {},
    formMessageKey: null,
    formMessage: null,
    requestId: null,
  }
}

export function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const { clearSession } = useAuth()
  const formId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const stored = pendingAuthStorage.get('reset_password')
  const locationEmail =
    typeof (location.state as { email?: unknown } | null)?.email === 'string'
      ? String((location.state as { email: string }).email).trim().toLowerCase()
      : ''
  const forgotSubmitted = Boolean(
    (location.state as { forgotSubmitted?: unknown } | null)?.forgotSubmitted,
  )

  const [values, setValues] = useState<ResetPasswordFormValues>({
    email: stored?.email || locationEmail,
    code: '',
    password: '',
    password_confirmation: '',
  })
  const [pending, setPending] = useState(false)
  const [clientErrors, setClientErrors] = useState<AuthFieldErrors>({})
  const [errorState, setErrorState] = useState<AuthFormErrorState>(emptyErrorState)
  const { resolveFieldError, resolveFormMessage } = useAuthErrorMessage()

  useDocumentMeta({
    title: t('resetPasswordMetaTitle'),
    description: t('resetPasswordMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  function update<K extends keyof ResetPasswordFormValues>(
    key: K,
    value: ResetPasswordFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setClientErrors({})
    setErrorState(emptyErrorState())

    const errors = validateResetPasswordForm(values)
    if (hasFieldErrors(errors)) {
      setClientErrors(errors)
      if (errors.email) emailRef.current?.focus()
      else if (errors.password) passwordRef.current?.focus()
      else if (errors.password_confirmation) confirmRef.current?.focus()
      else document.getElementById('auth-form-error')?.focus()
      return
    }

    const normalizedEmail = values.email.trim().toLowerCase()
    setPending(true)
    try {
      await authApi.resetPassword({
        email: normalizedEmail,
        code: values.code,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      pendingAuthStorage.clear('reset_password')
      clearSession()
      navigate('/login', {
        replace: true,
        state: { passwordReset: true, email: normalizedEmail },
      })
    } catch (error) {
      const mapped = mapAuthApiError(error)
      setErrorState({
        fieldErrors: mapped.fieldErrors,
        formMessageKey: mapped.formMessageKey,
        formMessage: mapped.formMessage,
        requestId: mapped.requestId,
      })
    } finally {
      setPending(false)
    }
  }

  const formMessage = resolveFormMessage(errorState)

  return (
    <AuthCard>
      <AuthHeader
        title={t('resetPasswordTitle')}
        subtitle={t('resetPasswordSubtitle')}
      />

      {values.email ? (
        <p className="auth-email-mask" aria-live="polite">
          {t('resetPasswordFor', { email: maskEmail(values.email) })}
        </p>
      ) : null}

      {forgotSubmitted ? (
        <p className="auth-status" role="status" aria-live="polite">
          {t('forgotPasswordGenericSuccess')}
        </p>
      ) : null}

      <form
        className="auth-form"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        noValidate
        aria-busy={pending || undefined}
      >
        {formMessage ? (
          <AuthFormError
            message={formMessage}
            requestId={errorState.requestId}
            requestIdLabel={t('requestId')}
          />
        ) : null}

        <Input
          ref={emailRef}
          id={`${formId}-email`}
          name="email"
          type="email"
          label={t('emailLabel')}
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={
            resolveFieldError(clientErrors.email) ??
            resolveFieldError(errorState.fieldErrors.email)
          }
          disabled={pending}
          required
        />

        <OtpCodeInput
          label={t('otpLabel')}
          value={values.code}
          onChange={(code) => update('code', code)}
          disabled={pending}
          error={
            resolveFieldError(clientErrors.code) ??
            resolveFieldError(errorState.fieldErrors.code)
          }
          autoFocus={Boolean(values.email)}
        />

        <PasswordField
          ref={passwordRef}
          id={`${formId}-password`}
          name="password"
          label={t('newPasswordLabel')}
          hint={t('passwordHint')}
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={
            resolveFieldError(clientErrors.password) ??
            resolveFieldError(errorState.fieldErrors.password)
          }
          disabled={pending}
          required
        />

        <PasswordRules password={values.password} />

        <PasswordField
          ref={confirmRef}
          id={`${formId}-password-confirmation`}
          name="password_confirmation"
          label={t('confirmPasswordLabel')}
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={(event) =>
            update('password_confirmation', event.target.value)
          }
          error={
            resolveFieldError(clientErrors.password_confirmation) ??
            resolveFieldError(errorState.fieldErrors.password_confirmation)
          }
          disabled={pending}
          required
        />

        <Button type="submit" disabled={pending} className="auth-form__submit">
          {pending ? t('resettingPassword') : t('resetPasswordSubmit')}
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/forgot-password">{t('requestNewResetCode')}</Link>
      </p>
      <p className="auth-switch">
        <Link to="/login">{t('backToLogin')}</Link>
        {' · '}
        <Link to="/">{t('backHome')}</Link>
      </p>
    </AuthCard>
  )
}
