import type { AuthUser } from '@/shared/types/user'

const AUTH_ENTRY_PATHS = new Set([
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
])

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/contact',
  '/unauthorized',
])

/**
 * Accept only same-origin relative app paths.
 * Rejects absolute URLs, protocol-relative URLs, and scheme handlers.
 */
export function isSafeInternalPath(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const path = value.trim()
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\\')) return false
  if (path.includes('://')) return false
  // Reject javascript:, data:, etc. even without ://
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false

  return true
}

export function getDefaultRedirectForUser(
  user: AuthUser | null | undefined,
): string {
  if (user?.role === 'admin') return '/admin'
  if (user?.role === 'client') return '/dashboard'
  return '/'
}

function pathnameOf(path: string): string {
  return path.split('?')[0]?.split('#')[0] ?? path
}

export function isPublicDestinationPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true
  if (pathname === '/services' || pathname.startsWith('/services/')) {
    return true
  }
  return false
}

export function isAdminDestinationPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function isClientDashboardPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
}

function isBookingDestinationPath(pathname: string): boolean {
  return (
    pathname === '/dashboard/bookings' ||
    pathname.startsWith('/dashboard/bookings/') ||
    pathname === '/admin/bookings' ||
    pathname.startsWith('/admin/bookings/')
  )
}

function bookingsFeatureEnabled(): boolean {
  // Build-time foldable check (must match env.ts strict "true" rule).
  return import.meta.env.VITE_FEATURE_BOOKINGS_ENABLED === 'true'
}

/**
 * Resolve post-login/register (and guest-only) destination.
 *
 * Rules:
 * - Admin default: /admin; client default: /dashboard
 * - Clients never land on /admin/*
 * - Admins requesting /dashboard* are sent to /admin
 * - Safe public paths (/, /services, /services/*, /contact) are preserved
 * - Booking destinations are ignored while bookings are disabled
 */
export function resolvePostAuthRedirect(
  intended: unknown,
  user: AuthUser | null | undefined,
): string {
  const fallback = getDefaultRedirectForUser(user)

  if (!isSafeInternalPath(intended)) {
    return fallback
  }

  const pathname = pathnameOf(intended)

  if (AUTH_ENTRY_PATHS.has(pathname)) {
    return fallback
  }

  if (isPublicDestinationPath(pathname)) {
    return intended
  }

  if (!bookingsFeatureEnabled() && isBookingDestinationPath(pathname)) {
    return fallback
  }

  if (user?.role === 'admin') {
    if (isClientDashboardPath(pathname)) {
      return '/admin'
    }
    if (isAdminDestinationPath(pathname)) {
      return intended
    }
    return fallback
  }

  if (user?.role === 'client') {
    if (isAdminDestinationPath(pathname)) {
      return fallback
    }
    if (isClientDashboardPath(pathname)) {
      return intended
    }
    return fallback
  }

  return fallback
}

export function readIntendedFromState(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) return undefined
  return (state as { from?: unknown }).from
}
