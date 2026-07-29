/**
 * Query key factories. Keep keys hierarchical and stable.
 * Feature API hooks should import these rather than inventing ad-hoc strings.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.categories.all, 'list', params ?? {}] as const,
    detail: (slug: string) => [...queryKeys.categories.all, 'detail', slug] as const,
  },
  services: {
    all: ['services'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.services.all, 'list', params ?? {}] as const,
    detail: (slug: string) => [...queryKeys.services.all, 'detail', slug] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.bookings.all, 'list', params ?? {}] as const,
    detail: (id: number | string) => [...queryKeys.bookings.all, 'detail', id] as const,
  },
  contact: {
    all: ['contact'] as const,
  },
  admin: {
    all: ['admin'] as const,
    usersAll: ['admin', 'users'] as const,
    users: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.usersAll, params ?? {}] as const,
    categories: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, 'categories', params ?? {}] as const,
    services: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, 'services', params ?? {}] as const,
    bookings: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, 'bookings', params ?? {}] as const,
    contactMessages: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, 'contact-messages', params ?? {}] as const,
  },
} as const
