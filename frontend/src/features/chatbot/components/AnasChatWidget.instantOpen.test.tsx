import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { chatbotApi } from '@/features/chatbot/api/chatbotApi'

// This file deliberately does NOT statically import AnasPanel (unlike
// AnasChatWidget.test.tsx), and instead leaves the dynamic import behind
// lazy() permanently unresolved. That lets it assert on the one-or-two-frame
// window Part B of the production quality pass is about: what the visitor
// sees between clicking the launcher and the code-split panel chunk
// resolving. Before that fix, Suspense's fallback was `null` — nothing
// appeared, and the launcher looked unresponsive.
vi.mock('@/features/chatbot/components/AnasPanel', () => new Promise(() => {}))

vi.mock('@/shared/config/env', () => ({
  env: {
    apiBaseUrl: 'http://test.local/api/v1',
    isDev: false,
    isProd: false,
    turnstile: { enabled: false, siteKey: '' },
    features: { bookings: false, chatbot: true, payments: false, invoices: false },
  },
}))

vi.mock('@/features/chatbot/api/chatbotApi')

afterEach(() => {
  vi.clearAllMocks()
})

describe('AnasChatWidget (instant-open shell)', () => {
  it('shows a branded, accessible placeholder immediately on click, before the panel chunk resolves', async () => {
    const mockedChatbotApi = vi.mocked(chatbotApi)
    mockedChatbotApi.startConversation.mockResolvedValue({
      success: true,
      data: {
        conversation_token: 'token-abc',
        status: 'open',
        visitor_name: null,
        messages: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    })

    const { AnasChatWidget } = await import(
      '@/features/chatbot/components/AnasChatWidget'
    )

    renderWithProviders(<AnasChatWidget />)

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', {
        name: "Chat with PRIA, PR Per Hour's AI assistant",
      }),
    )

    // The module import is still unresolved at this point — the shell must
    // already be visible, synchronously, not `null`.
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-busy', 'true')
    expect(dialog).toHaveTextContent('PRIA')
  })
})
