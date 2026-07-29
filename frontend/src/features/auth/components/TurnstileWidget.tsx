import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { env } from '@/shared/config/env'
import { loadTurnstileScript } from '@/shared/lib/loadTurnstileScript'

export type TurnstileAction =
  | 'register'
  | 'resend_verification'
  | 'forgot_password'

export interface TurnstileWidgetHandle {
  reset: () => void
  getToken: () => string | null
}

export interface TurnstileWidgetProps {
  action: TurnstileAction
  onTokenChange?: (token: string | null) => void
  disabled?: boolean
}

/**
 * Cloudflare Turnstile explicit widget.
 * Token lives only in component memory — never localStorage/sessionStorage.
 * Renders nothing when Turnstile is disabled for local development.
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ action, onTokenChange, disabled = false }, ref) {
  const { t, i18n } = useTranslation('auth')
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  )
  const statusId = useId()

  const emitToken = useCallback(
    (token: string | null) => {
      tokenRef.current = token
      onTokenChange?.(token)
    },
    [onTokenChange],
  )

  const resetWidget = useCallback(() => {
    emitToken(null)
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch {
        // Widget may already be removed.
      }
    }
  }, [emitToken])

  useImperativeHandle(
    ref,
    () => ({
      reset: resetWidget,
      getToken: () => tokenRef.current,
    }),
    [resetWidget],
  )

  useEffect(() => {
    if (!env.turnstile.enabled || !env.turnstile.siteKey) {
      emitToken(null)
      return
    }

    let cancelled = false
    const container = containerRef.current
    if (!container) return

    setStatus('loading')

    void loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return

        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current)
          } catch {
            // ignore
          }
          widgetIdRef.current = null
        }

        containerRef.current.innerHTML = ''

        const language = i18n.language?.startsWith('ar') ? 'ar' : 'en'

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: env.turnstile.siteKey,
          action,
          theme: 'auto',
          language,
          size: 'flexible',
          callback: (token) => {
            if (cancelled) return
            emitToken(token)
            setStatus('ready')
          },
          'expired-callback': () => {
            if (cancelled) return
            emitToken(null)
            setStatus('ready')
          },
          'timeout-callback': () => {
            if (cancelled) return
            emitToken(null)
            setStatus('ready')
          },
          'error-callback': () => {
            if (cancelled) return
            emitToken(null)
            setStatus('error')
          },
        })
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
        emitToken(null)
      })

    return () => {
      cancelled = true
      emitToken(null)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
        widgetIdRef.current = null
      }
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [action, emitToken, i18n.language])

  if (!env.turnstile.enabled || !env.turnstile.siteKey) {
    return null
  }

  return (
    <div className="turnstile-field" aria-busy={status === 'loading' || undefined}>
      <p className="field__label" id={`${statusId}-label`}>
        {t('turnstileLabel')}
      </p>
      <div
        ref={containerRef}
        className="turnstile-field__widget"
        aria-labelledby={`${statusId}-label`}
        aria-describedby={`${statusId}-status`}
      />
      <p
        id={`${statusId}-status`}
        className="turnstile-field__status"
        role="status"
        aria-live="polite"
      >
        {status === 'loading'
          ? t('turnstileLoading')
          : status === 'error'
            ? t('turnstileError')
            : disabled
              ? t('turnstileWaiting')
              : null}
      </p>
    </div>
  )
})
