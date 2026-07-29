/**
 * Load Cloudflare Turnstile explicit-render script once.
 * https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit
 */

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_ATTR = 'data-prph-turnstile'

export interface TurnstileApi {
  render: (
    container: HTMLElement | string,
    params: TurnstileRenderParams,
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
  ready: (callback: () => void) => void
}

export interface TurnstileRenderParams {
  sitekey: string
  action?: string
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  size?: 'normal' | 'flexible' | 'compact'
  callback?: (token: string) => void
  'error-callback'?: (errorCode?: string) => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loadPromise: Promise<TurnstileApi> | null = null

export function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser environment.'))
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[${SCRIPT_ATTR}]`,
    )

    const settle = () => {
      if (window.turnstile) {
        resolve(window.turnstile)
        return
      }
      reject(new Error('Turnstile script loaded without API.'))
    }

    if (existing) {
      if (window.turnstile) {
        resolve(window.turnstile)
        return
      }
      existing.addEventListener('load', settle)
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Turnstile script.')),
      )
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.setAttribute(SCRIPT_ATTR, 'true')
    script.addEventListener('load', settle)
    script.addEventListener('error', () => {
      loadPromise = null
      reject(new Error('Failed to load Turnstile script.'))
    })
    document.head.appendChild(script)
  })

  return loadPromise
}
