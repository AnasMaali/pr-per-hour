import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { testI18n } from '@/test/testI18n'

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={testI18n}>
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  )
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AllProviders })
}
