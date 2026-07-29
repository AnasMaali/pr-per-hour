import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { env } from '@/shared/config/env'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthFormError } from '@/features/auth/components/AuthFormError'
import { AuthHeader } from '@/features/auth/components/AuthHeader'
import { OtpCodeInput } from '@/features/auth/components/OtpCodeInput'
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/features/auth/components/TurnstileWidget'
import { authApi } from '@/features/auth/api/authApi'
import { useAuthErrorMessage } from '@/features/auth/hooks/useAuthErrorMessage'
import { useResendCountdown } from '@/features/auth/hooks/useResendCountdown'
import type { AuthFieldErrors, AuthFormErrorState } from '@/features/auth/types/authForm.types'
import { mapAuthApiError } from '@/features/auth/utils/mapAuthApiError'
import {
  hasFieldErrors,
  validateEmailOnly,
  validateOtpCode,
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

export function VerifyEmailPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const formId = useId()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const stored = pendingAuthStorage.get('verify_email')
  const locationState = location.state as {
    email?: unknown
    verificationSent?: unknown
    fromLogin?: unknown
  } | null
  const locationEmail =
    typeof locationState?.email === 'string'
      ? locationState.email.trim().toLowerCase()
      : ''
  const initialEmail = stored?.email || locationEmail
  const verificationSentHint =
    locationState?.fromLogin
      ? 'emailVerificationRequired'
      : locationState?.verificationSent === false
        ? 'verifyEmailSendFailedHint'
        : 'verifyEmailCodeSentHint'

  const [email, setEmail] = useState(initialEmail)
  const [emailLocked, setEmailLocked] = useState(Boolean(initialEmail))
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [resending, setResending] = useState(false)
  const [clientErrors, setClientErrors] = useState<AuthFieldErrors>({})
  const [errorState, setErrorState] = useState<AuthFormErrorState>(emptyErrorState)
  const [statusMessage, setStatusMessage] = useState<string | null>(
    initialEmail ? t(verificationSentHint) : null,
  )
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const countdown = useResendCountdown('verify_email')
  const { resolveFieldError, resolveFormMessage } = useAuthErrorMessage()
  const turnstileRequired = env.turnstile.enabled && Boolean(env.turnstile.siteKey)

  useDocumentMeta({
    title: t('verifyEmailMetaTitle'),
    description: t('verifyEmailMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  function clearErrors() {
    setClientErrors({})
    setErrorState(emptyErrorState())
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || resending) return

    clearErrors()
    setStatusMessage(null)

    const emailErrors = validateEmailOnly(email)
    const codeErrors = validateOtpCode(code)
    const errors = { ...emailErrors, ...codeErrors }
    if (hasFieldErrors(errors)) {
      setClientErrors(errors)
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    setPending(true)
    try {
      await authApi.verifyEmail({ email: normalizedEmail, code })
      pendingAuthStorage.clear('verify_email')
      navigate('/login', {
        replace: true,
        state: { emailVerified: true, email: normalizedEmail },
      })
    } catch (error) {
      const mapped = mapAuthApiError(error)
      setErrorState({
        fieldErrors: mapped.fieldErrors,
        formMessageKey: mapped.formMessageKey,
        formMessage: mapped.formMessage,
        requestId: mapped.requestId,
      })
      if (mapped.errorCode === 'EMAIL_ALREADY_VERIFIED') {
        pendingAuthStorage.clear('verify_email')
      }
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    if (pending || resending || countdown > 0) return
    if (turnstileRequired && !turnstileToken) return

    clearErrors()
    const emailErrors = validateEmailOnly(email)
    if (hasFieldErrors(emailErrors)) {
      setClientErrors(emailErrors)
      emailInputRef.current?.focus()
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    setResending(true)
    setStatusMessage(null)
    try {
      await authApi.requestEmailVerificationCode({
        email: normalizedEmail,
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      })
      pendingAuthStorage.set(normalizedEmail, 'verify_email', true)
      setEmailLocked(true)
      setStatusMessage(t('verifyEmailResent'))
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } catch (error) {
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      const mapped = mapAuthApiError(error)
      setErrorState({
        fieldErrors: mapped.fieldErrors,
        formMessageKey: mapped.formMessageKey,
        formMessage: mapped.formMessage,
        requestId: mapped.requestId,
      })
      if (mapped.errorCode === 'EMAIL_ALREADY_VERIFIED') {
        pendingAuthStorage.clear('verify_email')
      }
      if (mapped.errorCode === 'TOO_MANY_REQUESTS' || mapped.formMessageKey === 'errorRateLimited') {
        pendingAuthStorage.markResendSent('verify_email')
      }
    } finally {
      setResending(false)
    }
  }

  function handleChangeEmail() {
    pendingAuthStorage.clear('verify_email')
    setEmailLocked(false)
    setCode('')
    setStatusMessage(null)
    clearErrors()
  }

  const formMessage = resolveFormMessage(errorState)
  const codeError =
    resolveFieldError(clientErrors.code) ??
    resolveFieldError(errorState.fieldErrors.code)
  const emailError =
    resolveFieldError(clientErrors.email) ??
    resolveFieldError(errorState.fieldErrors.email)

  return (
    <AuthCard>
      <AuthHeader
        title={t('verifyEmailTitle')}
        subtitle={t('verifyEmailSubtitle')}
      />

      {emailLocked && email ? (
        <p className="auth-email-mask" aria-live="polite">
          {t('verifyEmailSentTo', { email: maskEmail(email) })}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="auth-status" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}

      <form
        className="auth-form"
        onSubmit={(event) => {
          void handleVerify(event)
        }}
        noValidate
        aria-busy={pending || resending || undefined}
      >
        {formMessage ? (
          <AuthFormError
            message={formMessage}
            requestId={errorState.requestId}
            requestIdLabel={t('requestId')}
          />
        ) : null}

        {!emailLocked ? (
          <Input
            ref={emailInputRef}
            id={`${formId}-email`}
            name="email"
            type="email"
            label={t('emailLabel')}
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
            disabled={pending || resending}
            required
          />
        ) : null}

        <OtpCodeInput
          label={t('otpLabel')}
          value={code}
          onChange={setCode}
          disabled={pending || resending}
          error={codeError}
          autoFocus={emailLocked}
        />

        <Button type="submit" disabled={pending || resending} className="auth-form__submit">
          {pending ? t('verifyingEmail') : t('verifyEmailSubmit')}
        </Button>
      </form>

      <div className="auth-actions-row">
        <TurnstileWidget
          ref={turnstileRef}
          action="resend_verification"
          disabled={pending || resending}
          onTokenChange={setTurnstileToken}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={
            pending ||
            resending ||
            countdown > 0 ||
            !email.trim() ||
            (turnstileRequired && !turnstileToken)
          }
          onClick={() => {
            void handleResend()
          }}
          className="auth-form__submit"
        >
          {resending
            ? t('resendingCode')
            : countdown > 0
              ? t('resendCodeIn', { seconds: countdown })
              : t('resendCode')}
        </Button>
      </div>

      <p className="auth-switch">
        <button
          type="button"
          className="auth-text-button"
          onClick={handleChangeEmail}
          disabled={pending || resending}
        >
          {t('changeEmail')}
        </button>
        {' · '}
        <Link to="/register">{t('returnToRegister')}</Link>
      </p>
      <p className="auth-switch">
        <Link to="/login">{t('signIn')}</Link>
        {' · '}
        <Link to="/">{t('backHome')}</Link>
      </p>
    </AuthCard>
  )
}
