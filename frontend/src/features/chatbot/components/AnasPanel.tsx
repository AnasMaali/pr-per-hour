import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { AnasHeader } from '@/features/chatbot/components/AnasHeader'
import { AnasWelcome } from '@/features/chatbot/components/AnasWelcome'
import { AnasConversation } from '@/features/chatbot/components/AnasConversation'
import { AnasComposer } from '@/features/chatbot/components/AnasComposer'
import { AnasErrorState } from '@/features/chatbot/components/AnasErrorState'
import { InlineLoader } from '@/shared/components/InlineLoader'
import type { UseChatSessionResult } from '@/features/chatbot/hooks/useChatSession'
import '@/features/chatbot/styles/anas-panel.css'

export interface AnasPanelProps {
  panelId: string
  titleId: string
  reducedMotion: boolean
  chat: UseChatSessionResult
}

const MOBILE_QUERY = '(max-width: 640px)'
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AnasPanel({ panelId, titleId, reducedMotion, chat }: AnasPanelProps) {
  const { t } = useTranslation('chatbot')
  const panelRef = useRef<HTMLDivElement>(null)
  const { state } = chat

  // Effects below intentionally run once on mount (entrance) or only react
  // to `state.phase` (exit) — never to `chat`/`reducedMotion` themselves,
  // since `chat` is a fresh object every parent render. A ref keeps them
  // reading the *latest* callbacks without re-running on every render.
  const latestRef = useRef({ chat, reducedMotion })
  latestRef.current = { chat, reducedMotion }

  // Entrance: fires once, when the panel first mounts (phase === 'opening').
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const { chat: latestChat, reducedMotion: latestReducedMotion } = latestRef.current

    if (latestReducedMotion) {
      latestChat.onOpenAnimationDone()
      return
    }

    const isMobile = window.matchMedia(MOBILE_QUERY).matches
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: latestChat.onOpenAnimationDone })

      tl.fromTo(
        panel,
        isMobile
          ? { y: 28, opacity: 0 }
          : { y: 18, scale: 0.94, opacity: 0, transformOrigin: '100% 100%' },
        { y: 0, scale: 1, opacity: 1, duration: 0.46, ease: 'back.out(1.5)' },
      ).fromTo(
        panel.querySelectorAll('[data-anas-reveal]'),
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: 'power2.out' },
        '-=0.22',
      )
    }, panel)

    return () => ctx.revert()
    // Runs once for this mount only — the panel unmounts and remounts per open cycle.
  }, [])

  // Exit: fires when the parent asks the panel to close.
  useEffect(() => {
    if (state.phase !== 'closing') return
    const panel = panelRef.current
    const { chat: latestChat, reducedMotion: latestReducedMotion } = latestRef.current

    if (!panel || latestReducedMotion) {
      latestChat.onCloseAnimationDone()
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(panel, {
        y: 16,
        scale: 0.96,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: latestChat.onCloseAnimationDone,
      })
    }, panel)

    return () => ctx.revert()
  }, [state.phase])

  // Focus trap + Escape + return focus + scroll lock (mobile only).
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    )
    focusables[0]?.focus()

    const isMobile = window.matchMedia(MOBILE_QUERY).matches
    const previousOverflow = document.body.style.overflow
    if (isMobile) {
      document.body.style.overflow = 'hidden'
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        latestRef.current.chat.closePanel()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (nodes.length === 0) return

      const first = nodes[0]!
      const last = nodes[nodes.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const hasMessages = state.messages.length > 0
  const conversationClosed = state.conversationStatus === 'closed'

  function renderBody() {
    if (state.session === 'loading' || state.session === 'idle') {
      return (
        <div className="anas-panel__loading">
          <InlineLoader />
        </div>
      )
    }

    if (state.session === 'error') {
      return (
        <AnasErrorState
          reducedMotion={reducedMotion}
          onRetry={chat.restartSession}
        />
      )
    }

    if (!hasMessages) {
      return (
        <AnasWelcome
          disabled={state.send === 'pending'}
          reducedMotion={reducedMotion}
          onQuickAction={chat.sendMessage}
        />
      )
    }

    return (
      <AnasConversation
        messages={state.messages}
        sendStatus={state.send}
        reducedMotion={reducedMotion}
        onRetry={chat.retryMessage}
      />
    )
  }

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="anas-panel"
    >
      <div data-anas-reveal="">
        <AnasHeader
          titleId={titleId}
          reducedMotion={reducedMotion}
          onClose={chat.closePanel}
        />
      </div>

      <div className="anas-panel__body" data-anas-reveal="">
        {renderBody()}
      </div>

      {state.session === 'ready' ? (
        <div className="anas-panel__footer" data-anas-reveal="">
          {conversationClosed ? (
            <div className="anas-panel__closed-notice">
              <p>{t('conversationClosedTitle')}</p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={chat.restartSession}
              >
                {t('startNewConversation')}
              </button>
            </div>
          ) : (
            <>
              <AnasComposer
                disabled={state.send === 'pending'}
                onSend={chat.sendMessage}
              />
              <p className="anas-panel__ai-notice">{t('aiNotice')}</p>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
