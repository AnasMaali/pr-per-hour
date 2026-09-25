import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { testI18n } from '@/test/testI18n'
import { AnasChatWidget } from '@/features/chatbot/components/AnasChatWidget'
import { chatbotApi } from '@/features/chatbot/api/chatbotApi'
import { streamChatMessage } from '@/features/chatbot/api/chatbotStream'
import type {
  ChatConversationDto,
  ChatMessageDto,
} from '@/features/chatbot/types/chatbot.types'

// Forces AnasPanel's dynamic import to resolve from Vitest's module cache
// instead of doing first-time transform work mid-test — see the identical
// comment in AnasChatWidget.test.tsx.
import '@/features/chatbot/components/AnasPanel'

vi.mock('@/shared/config/env', () => ({
  env: {
    apiBaseUrl: 'http://test.local/api/v1',
    isDev: false,
    isProd: false,
    turnstile: { enabled: false, siteKey: '' },
    features: { bookings: false, chatbot: true, payments: false, invoices: false },
  },
}))

vi.mock('gsap', () => {
  function timelineLike() {
    const tl: { fromTo: () => typeof tl; to: () => typeof tl } = {
      fromTo: () => tl,
      to: () => tl,
    }
    return tl
  }
  return {
    gsap: {
      context: (fn: () => void) => {
        fn()
        return { revert: () => {} }
      },
      timeline: (opts?: { onComplete?: () => void }) => {
        opts?.onComplete?.()
        return timelineLike()
      },
      to: (_target: unknown, opts?: { onComplete?: () => void }) => {
        opts?.onComplete?.()
        return {}
      },
    },
  }
})

vi.mock('@/features/services/queries/usePublicCategoriesQuery', () => ({
  usePublicCategoriesQuery: () => ({ data: [] }),
}))

vi.mock('@/features/chatbot/api/chatbotApi')
vi.mock('@/features/chatbot/api/chatbotStream')

const mockedChatbotApi = vi.mocked(chatbotApi)
const mockedStreamChatMessage = vi.mocked(streamChatMessage)

function conversation(overrides: Partial<ChatConversationDto> = {}): ChatConversationDto {
  return {
    conversation_token: 'token-abc',
    status: 'open',
    visitor_name: null,
    messages: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function botMessage(text: string): ChatMessageDto {
  return { sender: 'bot', message: text, created_at: '2026-01-01T00:00:02Z' }
}

async function openPanel(label = "Chat with PRIA, PR Per Hour's AI assistant") {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: label }))
  await screen.findByRole('dialog')
  return user
}

beforeEach(() => {
  window.sessionStorage.clear()
  mockedChatbotApi.startConversation.mockResolvedValue({ success: true, data: conversation() })
  mockedChatbotApi.getConversation.mockResolvedValue({ success: true, data: conversation() })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AnasChatWidget (streaming UX)', () => {
  it('keeps the thinking indicator until the first delta, then grows one bubble with a caret, then removes the caret on done', async () => {
    let handlers!: Parameters<typeof streamChatMessage>[2]
    mockedStreamChatMessage.mockImplementationOnce((_token, _message, h) => {
      handlers = h
      return new Promise<void>(() => {}) // never resolves within this test
    })

    renderWithProviders(<AnasChatWidget />)
    const user = await openPanel()

    const textarea = await screen.findByLabelText('Message PRIA')
    await user.type(textarea, 'What AI services do you offer?')
    await user.keyboard('{Enter}')

    // Still thinking — no assistant bubble yet.
    expect(screen.getByRole('status')).toHaveTextContent('PRIA is thinking')
    expect(screen.queryByText(/Data Analysis/)).not.toBeInTheDocument()

    function assistantBodyText(): string | null | undefined {
      return document.querySelector('.anas-message__assistant-body')?.textContent
    }

    handlers.onDelta('We offer **Data Analysis')
    await waitFor(() => {
      expect(assistantBodyText()).toContain('We offer')
    })
    // The thinking indicator is gone once real content is streaming.
    expect(screen.queryByRole('status', { name: /thinking/i })).not.toBeInTheDocument()
    expect(document.querySelector('.anas-message__caret')).not.toBeNull()

    handlers.onDelta(' & Business Intelligence** among others.')
    await waitFor(() => {
      expect(assistantBodyText()).toContain(
        'We offer Data Analysis & Business Intelligence among others.',
      )
    })

    // Still exactly one assistant bubble — never one bubble per chunk.
    expect(document.querySelectorAll('.anas-message--assistant')).toHaveLength(1)

    handlers.onDone(botMessage('We offer **Data Analysis & Business Intelligence** among others.'))

    await waitFor(() => {
      expect(document.querySelector('.anas-message__caret')).toBeNull()
    })
    expect(document.querySelectorAll('.anas-message--assistant')).toHaveLength(1)
    expect(assistantBodyText()).toContain(
      'We offer Data Analysis & Business Intelligence among others.',
    )
  })

  it('renders an Arabic streaming reply with rtl direction while it grows', async () => {
    await testI18n.changeLanguage('ar')
    document.documentElement.dir = 'rtl'

    let handlers!: Parameters<typeof streamChatMessage>[2]
    mockedStreamChatMessage.mockImplementationOnce((_token, _message, h) => {
      handlers = h
      return new Promise<void>(() => {})
    })

    renderWithProviders(<AnasChatWidget />)
    const user = await openPanel('تحدّث مع PRIA، المساعد الذكي لدى PR Per Hour')

    const textarea = await screen.findByLabelText('أرسل رسالة إلى PRIA')
    await user.type(textarea, 'مين المؤسس؟')
    await user.keyboard('{Enter}')

    handlers.onDelta('فاتنة معالي هي المؤسس.')
    await waitFor(() => {
      expect(screen.getByText('فاتنة معالي هي المؤسس.')).toBeInTheDocument()
    })

    const body = document.querySelector('.anas-message__assistant-body')
    expect(body).toHaveAttribute('dir', 'rtl')

    document.documentElement.dir = 'ltr'
    await testI18n.changeLanguage('en')
  })

  it('aborts the in-flight stream request when the widget unmounts', async () => {
    let capturedSignal: AbortSignal | undefined
    mockedStreamChatMessage.mockImplementationOnce((_token, _message, _handlers, signal) => {
      capturedSignal = signal
      return new Promise<void>(() => {})
    })

    const { unmount } = renderWithProviders(<AnasChatWidget />)
    const user = await openPanel()

    const textarea = await screen.findByLabelText('Message PRIA')
    await user.type(textarea, 'Hello')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(capturedSignal).toBeDefined())
    expect(capturedSignal?.aborted).toBe(false)

    unmount()

    expect(capturedSignal?.aborted).toBe(true)
  })
})
