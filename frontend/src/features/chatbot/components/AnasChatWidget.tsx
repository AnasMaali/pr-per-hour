import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { env } from '@/shared/config/env'
import { useReducedMotion } from '@/shared/motion'
import { useChatSession } from '@/features/chatbot/hooks/useChatSession'
import { AnasLauncher } from '@/features/chatbot/components/AnasLauncher'
import { AnasPanelShell } from '@/features/chatbot/components/AnasPanelShell'
import {
  loadAnasPanelModule,
  preloadAnasPanel,
} from '@/features/chatbot/utils/preloadAnasPanel'
import '@/features/chatbot/styles/anas-widget.css'

const AnasPanel = lazy(() =>
  loadAnasPanelModule().then((mod) => ({ default: mod.AnasPanel })),
)

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

/**
 * Global mount point for Anas. Renders nothing when the chatbot feature
 * flag is off. The launcher is always cheap (CSS-only motion); the panel
 * — conversation state, GSAP timeline, service-category query — is only
 * fetched once the visitor actually opens it.
 */
export function AnasChatWidget() {
  const reducedMotion = useReducedMotion()
  const chat = useChatSession()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)
  const panelId = useId()
  const titleId = useId()

  const { phase } = chat.state
  const isClosed = phase === 'closed'

  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )

  useEffect(() => {
    function handleVisibilityChange() {
      setTabHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (!isClosed) {
      wasOpenRef.current = true
      return
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      launcherRef.current?.focus()
    }
  }, [isClosed])

  // Idle-time preload: once the page has settled after becoming
  // interactive, start fetching the panel chunk in the background even if
  // the visitor never hovers or focuses the launcher first. Falls back to
  // a short timeout on browsers without requestIdleCallback (e.g. Safari).
  useEffect(() => {
    if (!env.features.chatbot) return

    const idleWindow = window as IdleWindow

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(preloadAnasPanel, {
        timeout: 2000,
      })
      return () => idleWindow.cancelIdleCallback?.(handle)
    }

    const timeout = window.setTimeout(preloadAnasPanel, 1500)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!env.features.chatbot) {
    return null
  }

  return (
    <div
      className="anas-widget-root"
      data-anas-widget=""
      data-tab-hidden={tabHidden || undefined}
    >
      <AnasLauncher
        ref={launcherRef}
        panelId={panelId}
        hidden={!isClosed}
        unreadCount={chat.state.unread}
        reducedMotion={reducedMotion}
        onOpen={chat.openPanel}
        onPreload={preloadAnasPanel}
      />

      {!isClosed ? (
        <Suspense
          fallback={
            <AnasPanelShell
              panelId={panelId}
              titleId={titleId}
              reducedMotion={reducedMotion}
            />
          }
        >
          <AnasPanel
            panelId={panelId}
            titleId={titleId}
            reducedMotion={reducedMotion}
            chat={chat}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
