import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { testI18n } from '@/test/testI18n'
import { AnasChatWidget } from '@/features/chatbot/components/AnasChatWidget'
import { chatbotApi } from '@/features/chatbot/api/chatbotApi'
import { ApiClientError } from '@/shared/api/errors'
import type {
  ChatConversationDto,
  ChatTurnDto,
} from '@/features/chatbot/types/chatbot.types'

// AnasChatWidget code-splits the panel via `lazy(() => import('./AnasPanel'))`
// so the conversation UI is only fetched once a visitor opens it. In
// production that's a real network fetch; here it's an in-memory module
// transform whose duration isn't fixed — under load it has taken long
// enough to occasionally miss `findByRole('dialog')`'s default timeout.
// A static import at module scope forces Vitest's module graph to resolve
// and cache AnasPanel before any test runs, so `lazy()`'s dynamic import
// always resolves from that cache instead of doing first-time transform
// work mid-test. This removes the timing variance rather than papering
// over it with a longer wait.
import '@/features/chatbot/components/AnasPanel'

vi.mock('@/shared/config/env', () => ({
  env: {
    apiBaseUrl: 'http://test.local/api/v1',
    isDev: false,
    isProd: false,
    turnstile: { enabled: false, siteKey: '' },
    features: {
      bookings: false,
      chatbot: true,
      payments: false,
      invoices: false,
    },
  },
}))

// GSAP relies on rAF-driven timing; the widget's own animation state
// (open/close phase) is production logic worth keeping, but real tween
// duration would only slow tests down. Resolve immediately instead.
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
      to: (
        _target: unknown,
        opts?: { onComplete?: () => void },
      ) => {
        opts?.onComplete?.()
        return {}
      },
    },
  }
})

vi.mock('@/features/services/queries/usePublicCategoriesQuery', () => ({
  usePublicCategoriesQuery: () => ({
    data: [
      { id: 1, name: 'Strategic Communication', slug: 'strategic-communication' },
      { id: 2, name: 'Data, AI & Technology', slug: 'data-ai-technology' },
    ],
  }),
}))

vi.mock('@/features/chatbot/api/chatbotApi')

const mockedChatbotApi = vi.mocked(chatbotApi)

function conversation(
  overrides: Partial<ChatConversationDto> = {},
): ChatConversationDto {
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

function turn(userText: string, replyText: string): ChatTurnDto {
  return {
    message: { sender: 'visitor', message: userText, created_at: '2026-01-01T00:00:01Z' },
    reply: { sender: 'bot', message: replyText, created_at: '2026-01-01T00:00:02Z' },
  }
}

async function openPanel() {
  const user = userEvent.setup()
  await user.click(
    screen.getByRole('button', {
      name: "Chat with Anas, PR Per Hour's AI assistant",
    }),
  )
  await screen.findByRole('dialog')
  return user
}

beforeEach(() => {
  window.sessionStorage.clear()
  mockedChatbotApi.startConversation.mockResolvedValue({
    success: true,
    data: conversation(),
  })
  mockedChatbotApi.getConversation.mockResolvedValue({
    success: true,
    data: conversation(),
  })
  mockedChatbotApi.sendMessage.mockResolvedValue({
    success: true,
    data: turn('hi', 'hello'),
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AnasChatWidget', () => {
  it('opens the panel from the launcher and renders the welcome state', async () => {
    renderWithProviders(<AnasChatWidget />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await openPanel()

    expect(screen.getByText("Hi, I'm Anas.")).toBeInTheDocument()
    expect(mockedChatbotApi.startConversation).toHaveBeenCalledTimes(1)
  })

  it('stores the opaque conversation token after starting a conversation', async () => {
    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    await waitFor(() => {
      const raw = window.sessionStorage.getItem('prph.chatbot.session')
      expect(raw).not.toBeNull()
      expect(JSON.parse(raw ?? '{}')).toMatchObject({
        token: 'token-abc',
        identity: 'guest',
      })
    })

    // No database identifiers are ever persisted client-side.
    const raw = window.sessionStorage.getItem('prph.chatbot.session')
    expect(raw).not.toMatch(/"id":/)
  })

  it('restores an existing conversation from a stored token instead of starting a new one', async () => {
    window.sessionStorage.setItem(
      'prph.chatbot.session',
      JSON.stringify({ token: 'existing-token', identity: 'guest' }),
    )
    mockedChatbotApi.getConversation.mockResolvedValue({
      success: true,
      data: conversation({
        conversation_token: 'existing-token',
        messages: [
          { sender: 'visitor', message: 'Earlier question', created_at: '2026-01-01T00:00:00Z' },
          { sender: 'bot', message: 'Earlier answer', created_at: '2026-01-01T00:00:01Z' },
        ],
      }),
    })

    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    expect(await screen.findByText('Earlier question')).toBeInTheDocument()
    expect(screen.getByText('Earlier answer')).toBeInTheDocument()
    expect(mockedChatbotApi.getConversation).toHaveBeenCalledWith(
      'existing-token',
    )
    expect(mockedChatbotApi.startConversation).not.toHaveBeenCalled()
  })

  it('discards an invalid stored token and starts a fresh conversation', async () => {
    window.sessionStorage.setItem(
      'prph.chatbot.session',
      JSON.stringify({ token: 'stale-token', identity: 'guest' }),
    )
    mockedChatbotApi.getConversation.mockRejectedValue(
      new ApiClientError({
        message: 'Conversation not found.',
        status: 404,
        errorCode: 'CHAT_CONVERSATION_NOT_FOUND',
        requestId: null,
        errors: null,
        isNetworkError: false,
        isUnauthorized: false,
        isForbidden: false,
        isValidationError: false,
        isInactiveAccount: false,
      }),
    )

    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    await waitFor(() => {
      expect(mockedChatbotApi.startConversation).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText("Hi, I'm Anas.")).toBeInTheDocument()
  })

  it('sends a quick action prompt through the real API and renders both sides of the turn', async () => {
    mockedChatbotApi.sendMessage.mockResolvedValue({
      success: true,
      data: turn(
        "I'm not sure which service fits my needs — can you help me find the right one?",
        'Based on your goals, Strategic Communication may be the right fit.',
      ),
    })

    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', { name: 'Find the right service' }),
    )

    expect(mockedChatbotApi.sendMessage).toHaveBeenCalledWith(
      'token-abc',
      "I'm not sure which service fits my needs — can you help me find the right one?",
    )

    expect(
      await screen.findByText(
        'Based on your goals, Strategic Communication may be the right fit.',
      ),
    ).toBeInTheDocument()
  })

  it('sends a typed message and disables the composer while the turn is in flight', async () => {
    let resolveSend!: (value: { success: true; data: ChatTurnDto }) => void
    mockedChatbotApi.sendMessage.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve
      }),
    )

    renderWithProviders(<AnasChatWidget />)
    const user = await openPanel()

    const textarea = await screen.findByLabelText('Message Anas')
    await user.type(textarea, 'What services do you offer?')
    await user.keyboard('{Enter}')

    expect(screen.getByText('What services do you offer?')).toBeInTheDocument()
    expect(textarea).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Anas is thinking')

    resolveSend({
      success: true,
      data: turn('What services do you offer?', 'Here is how we can help.'),
    })

    expect(await screen.findByText('Here is how we can help.')).toBeInTheDocument()
    await waitFor(() => expect(textarea).not.toBeDisabled())
  })

  it('shows a non-technical error state when the backend cannot be reached, and allows retry', async () => {
    mockedChatbotApi.startConversation.mockRejectedValueOnce(
      new ApiClientError({
        message: 'Network Error',
        status: null,
        errorCode: null,
        requestId: null,
        errors: null,
        isNetworkError: true,
        isUnauthorized: false,
        isForbidden: false,
        isValidationError: false,
        isInactiveAccount: false,
      }),
    )

    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    expect(
      await screen.findByText("I'm having trouble connecting right now."),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Network Error/)).not.toBeInTheDocument()
    expect(screen.queryByText(/"success":false/)).not.toBeInTheDocument()

    mockedChatbotApi.startConversation.mockResolvedValueOnce({
      success: true,
      data: conversation(),
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText("Hi, I'm Anas.")).toBeInTheDocument()
  })

  it('keeps a failed send visible with a working retry action', async () => {
    mockedChatbotApi.sendMessage.mockRejectedValueOnce(
      new ApiClientError({
        message: 'Network Error',
        status: null,
        errorCode: null,
        requestId: null,
        errors: null,
        isNetworkError: true,
        isUnauthorized: false,
        isForbidden: false,
        isValidationError: false,
        isInactiveAccount: false,
      }),
    )

    renderWithProviders(<AnasChatWidget />)
    const user = await openPanel()

    const textarea = await screen.findByLabelText('Message Anas')
    await user.type(textarea, 'Hello?')
    await user.keyboard('{Enter}')

    expect(await screen.findByText("This message wasn't sent.")).toBeInTheDocument()
    expect(screen.getByText('Hello?')).toBeInTheDocument()

    mockedChatbotApi.sendMessage.mockResolvedValueOnce({
      success: true,
      data: turn('Hello?', 'Hi! How can I help?'),
    })

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Hi! How can I help?')).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the launcher', async () => {
    renderWithProviders(<AnasChatWidget />)
    const user = await openPanel()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: "Chat with Anas, PR Per Hour's AI assistant",
        }),
      ).toHaveFocus()
    })
  })

  it('closes via the header close button', async () => {
    renderWithProviders(<AnasChatWidget />)
    await openPanel()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Close Anas' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('never renders a database identifier anywhere in the panel', async () => {
    mockedChatbotApi.getConversation.mockResolvedValue({
      success: true,
      data: conversation({
        messages: [
          { sender: 'visitor', message: 'Hello', created_at: '2026-01-01T00:00:00Z' },
          { sender: 'bot', message: 'Hi there', created_at: '2026-01-01T00:00:01Z' },
        ],
      }),
    })
    window.sessionStorage.setItem(
      'prph.chatbot.session',
      JSON.stringify({ token: 'token-abc', identity: 'guest' }),
    )

    renderWithProviders(<AnasChatWidget />)
    const dialog = within(await (await openPanel(), screen.findByRole('dialog')))

    expect(dialog.queryByText(/conversation_id/)).not.toBeInTheDocument()
    expect(dialog.queryByText(/user_id/)).not.toBeInTheDocument()
  })

  it('renders Arabic welcome copy correctly under an RTL document direction', async () => {
    document.documentElement.dir = 'rtl'
    await testI18n.changeLanguage('ar')

    renderWithProviders(<AnasChatWidget />)
    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', {
        name: 'تحدّث مع Anas، المساعد الذكي لدى PR Per Hour',
      }),
    )
    await screen.findByRole('dialog')

    expect(await screen.findByText('مرحباً، أنا Anas.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ساعدني في اختيار الخدمة المناسبة' }),
    ).toBeInTheDocument()

    document.documentElement.dir = 'ltr'
    await testI18n.changeLanguage('en')
  })
})
