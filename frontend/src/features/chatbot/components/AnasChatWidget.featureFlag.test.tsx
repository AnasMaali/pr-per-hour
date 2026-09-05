import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'

// Isolated in its own file: this is the one test that needs the chatbot
// feature flag OFF, which requires mocking `@/shared/config/env` before
// AnasChatWidget is imported. Keeping it separate avoids interfering with
// the shared module graph (and the shared `env: chatbot=true` mock) used
// by every other chatbot test.
vi.mock('@/shared/config/env', () => ({
  env: {
    apiBaseUrl: 'http://test.local/api/v1',
    isDev: false,
    isProd: false,
    turnstile: { enabled: false, siteKey: '' },
    features: {
      bookings: false,
      chatbot: false,
      payments: false,
      invoices: false,
    },
  },
}))

describe('AnasChatWidget (feature flag off)', () => {
  it('renders nothing when VITE_FEATURE_CHATBOT_ENABLED is off', async () => {
    const { AnasChatWidget } = await import(
      '@/features/chatbot/components/AnasChatWidget'
    )
    const { container } = renderWithProviders(<AnasChatWidget />)

    expect(container).toBeEmptyDOMElement()
  })
})
