import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminContactMessages } from '@/features/admin/dashboard/api/adminOverviewApi'

const PREVIEW_PARAMS = {
  page: 1,
  per_page: 5,
  sort: 'created_at',
  direction: 'desc' as const,
}

/** Recent contact messages + accurate total from pagination meta. */
export function useAdminMessagesPreviewQuery() {
  return useQuery({
    queryKey: queryKeys.admin.contactMessages({
      purpose: 'preview',
      ...PREVIEW_PARAMS,
    }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminContactMessages(PREVIEW_PARAMS, signal)
      return {
        messages: response.data,
        total: response.meta?.total ?? 0,
      }
    },
    staleTime: 60_000,
    retry: 1,
  })
}

/** Accurate new-message count via meta.total (per_page=1). */
export function useAdminNewMessagesCountQuery() {
  const params = {
    page: 1,
    per_page: 1,
    status: 'new',
  }
  return useQuery({
    queryKey: queryKeys.admin.contactMessages({
      purpose: 'count-new',
      ...params,
    }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminContactMessages(params, signal)
      return response.meta?.total ?? 0
    },
    staleTime: 60_000,
    retry: 1,
  })
}
