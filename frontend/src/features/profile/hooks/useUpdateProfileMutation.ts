import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { AuthUser } from '@/shared/types/user'
import { authApi } from '@/features/auth/api/authApi'
import type { ProfileUpdatePayload } from '@/features/profile/types/profile.types'

/**
 * PATCH /auth/profile — updates current-user query cache (AuthProvider source).
 * Does not touch the token. retry: false.
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload): Promise<AuthUser> => {
      const response = await authApi.updateProfile(payload)
      return response.data
    },
    retry: false,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user)
    },
  })
}
