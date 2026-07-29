import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminUsers } from '@/features/admin/users/api/adminUsersApi'

export function useAdminUsersCountQuery() {
  const params = {
    sort: 'created_at' as const,
    direction: 'desc' as const,
    per_page: 1,
    page: 1,
  }

  return useQuery({
    queryKey: queryKeys.admin.users({ purpose: 'count', ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminUsers(params, signal)
      return response.meta?.total ?? 0
    },
    staleTime: 60_000,
    retry: 1,
  })
}
