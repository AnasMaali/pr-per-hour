import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { env } from '@/shared/config/env'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthFormError } from '@/features/auth/components/AuthFormError'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { PasswordRules } from '@/features/auth/components/PasswordRules'
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/features/auth/components/TurnstileWidget'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation'
import type {
  AuthFieldErrors,
  RegisterFormValues,
} from '@/features/auth/types/authForm.types'
import {
  hasFieldErrors,
  validateRegisterForm,
} from '@/features/auth/utils/authValidation'
import { pendingAuthStorage } from '@/features/auth/utils/pendingAuthStorage'

const INITIAL: RegisterFormValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
}

export function RegisterPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const formId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const [values, setValues] = useState<RegisterFormValues>(INITIAL)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [clientErrors, setClientErrors] = useState<AuthFieldErrors>({})
  const { submit, pending, errorState, clearErrors } = useRegisterMutation()
  const { resolveFieldError, resolveFormMessage } = useAuthErrorMessage()
  const turnstileRequired = env.turnstile.enabled && Boolean(env.turnstile.siteKey)

  useDocumentMeta({
    title: t('registerMetaTitle'),
    description: t('registerMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  function update<K extends keyof RegisterFormValues>(
    key: K,
    value: RegisterFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function focusFromErrors(errors: AuthFieldErrors, hasFormError: boolean) {
    if (errors.name) {
      nameRef.current?.focus()
      return
    }
    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.phone) {
      phoneRef.current?.focus()
      return
    }
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }
    if (errors.password_confirmation) {
      confirmRef.current?.focus()
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
    const errors = validateRegisterForm(values)
    if (hasFieldErrors(errors)) {
      setClientErrors(errors)
      focusFromErrors(errors, false)
      return
    }

    if (turnstileRequired && !turnstileToken) {
      setClientErrors({})
      document.getElementById('auth-form-error')?.focus()
      return
    }

    setClientErrors({})

    const phone = values.phone.trim()
    const normalizedEmail = values.email.trim().toLowerCase()
    const result = await submit({
      name: values.name.trim(),
      email: normalizedEmail,
      phone: phone === '' ? null : phone,
      password: values.password,
      password_confirmation: values.password_confirmation,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
    })

    if (!result.data) {
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      const apiErrors = result.error?.fieldErrors ?? {}
      const formMsg = Boolean(
        result.error?.formMessage || result.error?.formMessageKey,
      )
      focusFromErrors(apiErrors, formMsg)
      return
    }

    pendingAuthStorage.set(
      result.data.email,
      'verify_email',
      result.data.verification_sent,
    )
    navigate('/verify-email', {
      replace: true,
      state: {
        email: result.data.email,
        verificationSent: result.data.verification_sent,
      },
    })
  }

  const formMessage = resolveFormMessage(errorState)

  return (
    <AuthCard>
      <AuthHeader title={t('registerTitle')} subtitle={t('registerSubtitle')} />

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
          ref={nameRef}
          id={`${formId}-name`}
          name="name"
          type="text"
          label={t('nameLabel')}
          autoComplete="name"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
          error={
            resolveFieldError(clientErrors.name) ??
            resolveFieldError(errorState.fieldErrors.name)
          }
          disabled={pending}
          required
        />

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

        <Input
          ref={phoneRef}
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          label={t('phoneLabel')}
          hint={t('phoneHint')}
          autoComplete="tel"
          inputMode="tel"
          value={values.phone}
          onChange={(event) => update('phone', event.target.value)}
          error={
            resolveFieldError(clientErrors.phone) ??
            resolveFieldError(errorState.fieldErrors.phone)
          }
          disabled={pending}
        />

        <PasswordField
          ref={passwordRef}
          id={`${formId}-password`}
          name="password"
          label={t('passwordLabel')}
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

        <TurnstileWidget
          ref={turnstileRef}
          action="register"
          disabled={pending}
          onTokenChange={setTurnstileToken}
        />

        <Button
          type="submit"
          disabled={pending || (turnstileRequired && !turnstileToken)}
          className="auth-form__submit"
        >
          {pending ? t('creatingAccount') : t('createAccount')}
        </Button>
      </form>

      <p className="auth-switch">
        {t('alreadyHaveAccount')}{' '}
        <Link to="/login">{t('signIn')}</Link>
      </p>
      <p className="auth-switch">
        <Link to="/">{t('backHome')}</Link>
      </p>
    </AuthCard>
  )
}
