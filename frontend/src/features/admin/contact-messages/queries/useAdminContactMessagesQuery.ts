import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminContactMessagesList } from '@/features/admin/contact-messages/api/adminContactMessagesApi'
import type { AdminContactMessageFiltersState } from '@/features/admin/contact-messages/types/adminContactMessages.types'
import { contactMessageFiltersToApiParams } from '@/features/admin/contact-messages/utils/contactMessageFilters'

export function useAdminContactMessagesQuery(
  filters: AdminContactMessageFiltersState,
) {
  const params = contactMessageFiltersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.admin.contactMessages({ ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminContactMessagesList(params, signal)
      return {
        messages: response.data,
        meta: response.meta ?? {
          current_page: 1,
          per_page: params.per_page,
          total: response.data.length,
          last_page: 1,
        },
      }
    },
    staleTime: 30_000,
    retry: 1,
  })
}
