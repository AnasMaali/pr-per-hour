import { QueryClient } from '@tanstack/react-query'

/**
 * Shared QueryClient defaults.
 *
 * - Safe GET queries retry a limited number of times.
 * - Mutations do not retry by default (avoid duplicate writes).
 * - staleTime reduces refetch churn for foundation shells.
 * - refetchOnWindowFocus is disabled to avoid surprising auth/me flashes
 *   during early UI work; revisit when dashboards need fresher data.
 * - Global error toasts are intentionally omitted so features own messaging
 *   and avoid duplicate notifications.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const status =
            error &&
            typeof error === 'object' &&
            'normalized' in error &&
            error.normalized &&
            typeof error.normalized === 'object' &&
            'status' in error.normalized
              ? (error.normalized as { status: number | null }).status
              : null

          if (status === 401 || status === 403 || status === 404 || status === 422) {
            return false
          }

          return failureCount < 2
        },
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
