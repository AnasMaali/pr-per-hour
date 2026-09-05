import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import { env } from '@/shared/config/env'
import { useReducedMotion } from '@/shared/motion'
import { useChatSession } from '@/features/chatbot/hooks/useChatSession'
import { AnasLauncher } from '@/features/chatbot/components/AnasLauncher'
import '@/features/chatbot/styles/anas-widget.css'

const AnasPanel = lazy(() =>
  import('@/features/chatbot/components/AnasPanel').then((mod) => ({
    default: mod.AnasPanel,
  })),
)

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
      />

      {!isClosed ? (
        <Suspense fallback={null}>
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
