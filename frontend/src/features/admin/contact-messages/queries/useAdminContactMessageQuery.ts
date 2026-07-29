import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminContactMessage } from '@/features/admin/contact-messages/api/adminContactMessagesApi'

export function useAdminContactMessageQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.admin.contactMessages({ purpose: 'detail', id }),
    queryFn: async ({ signal }) => {
      if (id === null) throw new Error('Missing contact message id')
      const response = await fetchAdminContactMessage(id, signal)
      return response.data
    },
    enabled: id !== null && Number.isFinite(id) && id > 0,
    staleTime: 30_000,
    retry: 1,
  })
}
