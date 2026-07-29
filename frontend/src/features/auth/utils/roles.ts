import type { AuthUser, UserRole } from '@/shared/types/user'

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isClient(user: AuthUser | null | undefined): boolean {
  return user?.role === 'client'
}

export function isActiveUser(user: AuthUser | null | undefined): boolean {
  return user?.status === 'active'
}

export function hasRole(
  user: AuthUser | null | undefined,
  role: UserRole,
): boolean {
  return user?.role === role
}

export function canAccessClientArea(user: AuthUser | null | undefined): boolean {
  return isActiveUser(user) && isClient(user)
}

export function canAccessAdminArea(user: AuthUser | null | undefined): boolean {
  return isActiveUser(user) && isAdmin(user)
}
