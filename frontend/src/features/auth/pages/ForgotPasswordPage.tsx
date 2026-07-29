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
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/features/auth/components/TurnstileWidget'
import { authApi } from '@/features/auth/api/authApi'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import type { AuthFieldErrors, AuthFormErrorState } from '@/features/auth/types/authForm.types'
import { mapAuthApiError } from '@/features/auth/utils/mapAuthApiError'
import {
  hasFieldErrors,
  validateEmailOnly,
} from '@/features/auth/utils/authValidation'
import { pendingAuthStorage } from '@/features/auth/utils/pendingAuthStorage'

function emptyErrorState(): AuthFormErrorState {
  return {
    fieldErrors: {},
    formMessageKey: null,
    formMessage: null,
    requestId: null,
  }
}

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const formId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const stored = pendingAuthStorage.get('reset_password')
  const [email, setEmail] = useState(stored?.email ?? '')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [clientErrors, setClientErrors] = useState<AuthFieldErrors>({})
  const [errorState, setErrorState] = useState<AuthFormErrorState>(emptyErrorState)
  const { resolveFieldError, resolveFormMessage } = useAuthErrorMessage()
  const turnstileRequired = env.turnstile.enabled && Boolean(env.turnstile.siteKey)

  useDocumentMeta({
    title: t('forgotPasswordMetaTitle'),
    description: t('forgotPasswordMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (turnstileRequired && !turnstileToken) return

    setClientErrors({})
    setErrorState(emptyErrorState())

    const errors = validateEmailOnly(email)
    if (hasFieldErrors(errors)) {
      setClientErrors(errors)
      emailRef.current?.focus()
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    setPending(true)
    try {
      await authApi.forgotPassword({
        email: normalizedEmail,
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      })
      pendingAuthStorage.set(normalizedEmail, 'reset_password', true)
      navigate('/reset-password', {
        replace: true,
        state: { email: normalizedEmail, forgotSubmitted: true },
      })
    } catch (error) {
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      const mapped = mapAuthApiError(error)
      if (
        mapped.errorCode === 'HUMAN_VERIFICATION_FAILED' ||
        mapped.formMessageKey === 'errorNetwork' ||
        mapped.formMessageKey === 'errorServer' ||
        mapped.formMessageKey === 'errorRateLimited' ||
        mapped.formMessageKey === 'humanVerificationFailed'
      ) {
        setErrorState({
          fieldErrors: mapped.fieldErrors,
          formMessageKey: mapped.formMessageKey,
          formMessage: mapped.formMessage,
          requestId: mapped.requestId,
        })
        return
      }
      // Always advance with a generic success path for unknown-account style responses.
      pendingAuthStorage.set(normalizedEmail, 'reset_password', true)
      navigate('/reset-password', {
        replace: true,
        state: { email: normalizedEmail, forgotSubmitted: true },
      })
    } finally {
      setPending(false)
    }
  }

  const formMessage = resolveFormMessage(errorState)
  const emailError =
    resolveFieldError(clientErrors.email) ??
    resolveFieldError(errorState.fieldErrors.email)

  return (
    <AuthCard>
      <AuthHeader
        title={t('forgotPasswordTitle')}
        subtitle={t('forgotPasswordSubtitle')}
      />

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
          disabled={pending}
          required
        />

        <TurnstileWidget
          ref={turnstileRef}
          action="forgot_password"
          disabled={pending}
          onTokenChange={setTurnstileToken}
        />

        <Button
          type="submit"
          disabled={pending || (turnstileRequired && !turnstileToken)}
          className="auth-form__submit"
        >
          {pending ? t('sendingResetCode') : t('sendResetCode')}
        </Button>
      </form>

      <p className="auth-switch">
        <Link to="/login">{t('backToLogin')}</Link>
      </p>
      <p className="auth-switch">
        <Link to="/">{t('backHome')}</Link>
      </p>
    </AuthCard>
  )
}
