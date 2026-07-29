import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { setUnauthorizedHandler } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { tokenStorage } from '@/shared/lib/tokenStorage'
import type { AuthUser } from '@/shared/types/user'
import {
  authApi,
  type LoginPayload,
  type RegisterPayload,
  type RegistrationResult,
  type UpdateProfilePayload,
} from '@/features/auth/api/authApi'
import {
  canAccessAdminArea,
  canAccessClientArea,
  isActiveUser,
} from '@/features/auth/utils/roles'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  isClient: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  /** Creates an unverified client; does not store a token. */
  register: (payload: RegisterPayload) => Promise<RegistrationResult>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function clearAuthCaches(queryClient: ReturnType<typeof useQueryClient>): void {
  tokenStorage.remove()
  queryClient.setQueryData(queryKeys.auth.me(), null)
  void queryClient.removeQueries({ queryKey: queryKeys.auth.all })
  // Drop private client/admin caches so a later session cannot briefly show
  // another user's bookings or admin data on a shared browser.
  void queryClient.removeQueries({ queryKey: queryKeys.bookings.all })
  void queryClient.removeQueries({ queryKey: queryKeys.admin.all })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const hasToken = tokenStorage.hasToken()

  const clearSession = useCallback(() => {
    clearAuthCaches(queryClient)
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async ({ signal }) => {
      const response = await authApi.me(signal)
      return response.data
    },
    enabled: hasToken,
    retry: false,
  })

  useEffect(() => {
    if (meQuery.isError) {
      clearSession()
      return
    }

    if (meQuery.data && !isActiveUser(meQuery.data)) {
      clearSession()
    }
  }, [meQuery.isError, meQuery.data, clearSession])

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authApi.login(payload)
      tokenStorage.set(response.data.token)
      queryClient.setQueryData(queryKeys.auth.me(), response.data.user)
      return response.data.user
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await authApi.register(payload)
      // Phase 7B: no token until email is verified and the user signs in.
      return response.data
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout()
      } finally {
        clearSession()
      }
    },
  })

  const profileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await authApi.updateProfile(payload)
      queryClient.setQueryData(queryKeys.auth.me(), response.data)
      return response.data
    },
    retry: false,
  })

  const rawUser = meQuery.data ?? null
  const user = rawUser && isActiveUser(rawUser) ? rawUser : null
  const isBootstrapping =
    hasToken && !user && (meQuery.isPending || meQuery.isFetching) && !meQuery.isError

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStorage.hasToken()),
      isBootstrapping,
      isClient: canAccessClientArea(user),
      isAdmin: canAccessAdminArea(user),
      login: (payload) => loginMutation.mutateAsync(payload),
      register: (payload) => registerMutation.mutateAsync(payload),
      logout: async () => {
        await logoutMutation.mutateAsync()
      },
      updateProfile: (payload) => profileMutation.mutateAsync(payload),
      clearSession,
    }),
    [
      user,
      isBootstrapping,
      loginMutation,
      registerMutation,
      logoutMutation,
      profileMutation,
      clearSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
