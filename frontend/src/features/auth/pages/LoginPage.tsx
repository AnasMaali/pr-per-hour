import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthFormError } from '@/features/auth/components/AuthFormError'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation'
import type {
  AuthFieldErrors,
  LoginFormValues,
} from '@/features/auth/types/authForm.types'
import {
  readIntendedFromState,
  resolvePostAuthRedirect,
} from '@/features/auth/utils/authRedirect'
import {
  hasFieldErrors,
  validateLoginForm,
} from '@/features/auth/utils/authValidation'
import { pendingAuthStorage } from '@/features/auth/utils/pendingAuthStorage'

const INITIAL: LoginFormValues = { email: '', password: '' }

export function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const formId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const locationState = location.state as {
    email?: unknown
    emailVerified?: unknown
    passwordReset?: unknown
    from?: unknown
  } | null

  const prefillEmail =
    typeof locationState?.email === 'string'
      ? locationState.email.trim().toLowerCase()
      : ''

  const [values, setValues] = useState<LoginFormValues>({
    ...INITIAL,
    email: prefillEmail,
  })
  const [clientErrors, setClientErrors] = useState<AuthFieldErrors>({})
  const { submit, pending, errorState, clearErrors } = useLoginMutation()
  const { resolveFieldError, resolveFormMessage } = useAuthErrorMessage()

  const banner = useMemo(() => {
    if (locationState?.emailVerified) return t('emailVerifiedSuccess')
    if (locationState?.passwordReset) return t('passwordResetSuccess')
    return null
  }, [locationState?.emailVerified, locationState?.passwordReset, t])

  useDocumentMeta({
    title: t('loginMetaTitle'),
    description: t('loginMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  function update<K extends keyof LoginFormValues>(
    key: K,
    value: LoginFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function focusFromErrors(errors: AuthFieldErrors, hasFormError: boolean) {
    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }
    if (hasFormError) {
      document.getElementById('auth-form-error')?.focus()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    clearErrors()
    const errors = validateLoginForm(values)
    if (hasFieldErrors(errors)) {
      setClientErrors(errors)
      focusFromErrors(errors, false)
      return
    }

    setClientErrors({})
    const normalizedEmail = values.email.trim().toLowerCase()
    const result = await submit({
      email: normalizedEmail,
      password: values.password,
    })

    if (result.emailVerificationRequired) {
      pendingAuthStorage.set(normalizedEmail, 'verify_email', false)
      navigate('/verify-email', {
        replace: true,
        state: { email: normalizedEmail, fromLogin: true },
      })
      return
    }

    if (!result.user) {
      const apiErrors = result.error?.fieldErrors ?? {}
      const formMsg = Boolean(
        result.error?.formMessage || result.error?.formMessageKey,
      )
      focusFromErrors(apiErrors, formMsg)
      return
    }

    navigate(
      resolvePostAuthRedirect(readIntendedFromState(location.state), result.user),
      { replace: true },
    )
  }

  const emailError =
    resolveFieldError(clientErrors.email) ??
    resolveFieldError(errorState.fieldErrors.email)
  const passwordError =
    resolveFieldError(clientErrors.password) ??
    resolveFieldError(errorState.fieldErrors.password)
  const formMessage = resolveFormMessage(errorState)

  return (
    <AuthCard>
      <AuthHeader title={t('loginTitle')} subtitle={t('loginSubtitle')} />

      {banner ? (
        <p className="auth-status" role="status" aria-live="polite">
          {banner}
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
          error={emailError}
          disabled={pending}
          required
        />

        <PasswordField
          ref={passwordRef}
          id={`${formId}-password`}
          name="password"
          label={t('passwordLabel')}
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={passwordError}
          disabled={pending}
          required
        />

        <p className="auth-forgot">
          <Link to="/forgot-password">{t('forgotPasswordLink')}</Link>
        </p>

        <Button type="submit" disabled={pending} className="auth-form__submit">
          {pending ? t('signingIn') : t('signIn')}
        </Button>
      </form>

      <p className="auth-switch">
        {t('noAccount')}{' '}
        <Link to="/register">{t('createAccount')}</Link>
      </p>
      <p className="auth-switch">
        <Link to="/">{t('backHome')}</Link>
      </p>
    </AuthCard>
  )
}
