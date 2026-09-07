import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { testI18n } from '@/test/testI18n'
import { AnasConversation } from '@/features/chatbot/components/AnasConversation'
import type { ChatMessageViewModel } from '@/features/chatbot/types/chatbot.types'

function renderConversation(
  messages: ChatMessageViewModel[],
  sendStatus: 'idle' | 'pending' | 'error' = 'idle',
) {
  return render(
    <I18nextProvider i18n={testI18n}>
      <AnasConversation
        messages={messages}
        sendStatus={sendStatus}
        reducedMotion
        onRetry={() => {}}
      />
    </I18nextProvider>,
  )
}

function message(overrides: Partial<ChatMessageViewModel> = {}): ChatMessageViewModel {
  return {
    localId: 'm-1',
    sender: 'visitor',
    message: 'Hello',
    createdAt: null,
    status: 'sent',
    ...overrides,
  }
}

/**
 * jsdom reports 0 for all scroll geometry by default — stub real values,
 * then dispatch a real "scroll" event so useSmartScroll's listener (the
 * only thing that updates its "am I near the bottom" ref) actually
 * recomputes from the stubbed numbers instead of keeping its initial
 * default.
 */
function stubScrollGeometry(
  container: HTMLElement,
  { scrollHeight, clientHeight, scrollTop }: { scrollHeight: number; clientHeight: number; scrollTop: number },
) {
  const el = container.querySelector('.anas-conversation__scroll') as HTMLElement
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true })
  Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true, writable: true })
  el.dispatchEvent(new Event('scroll'))
  return el
}

describe('AnasConversation (scroll behavior)', () => {
  let scrollToMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollToMock = vi.fn()
    // src/test/setup.ts already defines HTMLElement.prototype.scrollTo as a
    // no-op (jsdom itself has none) — that's *closer* in the prototype
    // chain than Element.prototype for any actual element, so overriding
    // Element.prototype here would be silently shadowed and never called.
    window.HTMLElement.prototype.scrollTo =
      scrollToMock as unknown as typeof window.HTMLElement.prototype.scrollTo
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('auto-scrolls to bottom when a new message arrives while near the bottom', async () => {
    const { container, rerender } = renderConversation([message({ localId: 'm-1' })])
    stubScrollGeometry(container, { scrollHeight: 400, clientHeight: 400, scrollTop: 380 })

    rerender(
      <I18nextProvider i18n={testI18n}>
        <AnasConversation
          messages={[
            message({ localId: 'm-1' }),
            message({ localId: 'm-2', sender: 'bot', message: 'Hi there' }),
          ]}
          sendStatus="idle"
          reducedMotion
          onRetry={() => {}}
        />
      </I18nextProvider>,
    )

    await vi.waitFor(() => {
      expect(scrollToMock).toHaveBeenCalled()
    })
  })

  it('does not force-scroll when the visitor has scrolled up, and offers a jump-to-latest affordance', async () => {
    const { container, rerender } = renderConversation([message({ localId: 'm-1' })])
    // Far from the bottom (well beyond the 96px threshold).
    stubScrollGeometry(container, { scrollHeight: 1000, clientHeight: 400, scrollTop: 0 })

    scrollToMock.mockClear()

    rerender(
      <I18nextProvider i18n={testI18n}>
        <AnasConversation
          messages={[
            message({ localId: 'm-1' }),
            message({ localId: 'm-2', sender: 'bot', message: 'Hi there' }),
          ]}
          sendStatus="idle"
          reducedMotion
          onRetry={() => {}}
        />
      </I18nextProvider>,
    )

    expect(scrollToMock).not.toHaveBeenCalled()
    expect(await screen.findByText('New message')).toBeInTheDocument()
  })

  it('keeps following as a streaming message grows in place while near the bottom', async () => {
    const growing = message({
      localId: 'assistant-1',
      sender: 'bot',
      message: 'Hel',
      status: 'streaming',
    })
    const { container, rerender } = renderConversation([growing], 'pending')
    stubScrollGeometry(container, { scrollHeight: 400, clientHeight: 400, scrollTop: 380 })
    scrollToMock.mockClear()

    rerender(
      <I18nextProvider i18n={testI18n}>
        <AnasConversation
          messages={[{ ...growing, message: 'Hello, how can I help you today?' }]}
          sendStatus="pending"
          reducedMotion
          onRetry={() => {}}
        />
      </I18nextProvider>,
    )

    await vi.waitFor(() => {
      expect(scrollToMock).toHaveBeenCalled()
    })
  })

  it('hides the thinking indicator once a streaming assistant message exists', () => {
    renderConversation(
      [message({ localId: 'assistant-1', sender: 'bot', message: 'Partial', status: 'streaming' })],
      'pending',
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the thinking indicator while pending with no streaming message yet', () => {
    renderConversation([], 'pending')

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
