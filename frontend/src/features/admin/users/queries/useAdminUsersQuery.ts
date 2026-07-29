import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import {
  fetchAdminUsers,
  updateAdminUserStatus,
} from '@/features/admin/users/api/adminUsersApi'
import type {
  AdminUsersFiltersState,
  AdminUserStatus,
} from '@/features/admin/users/types/adminUsers.types'

function toParams(filters: AdminUsersFiltersState) {
  return {
    search: filters.search.trim() || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
    sort: 'created_at' as const,
    direction: 'desc' as const,
    per_page: 15,
    page: filters.page,
  }
}

export function useAdminUsersQuery(filters: AdminUsersFiltersState) {
  const params = toParams(filters)

  return useQuery({
    queryKey: queryKeys.admin.users({ ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminUsers(params, signal)
      return {
        users: response.data,
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

export function useUpdateAdminUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminUserStatus }) =>
      updateAdminUserStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.usersAll,
      })
    },
  })
}
