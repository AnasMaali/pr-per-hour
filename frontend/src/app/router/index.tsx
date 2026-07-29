import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { ClientDashboardLayout } from '@/app/layouts/ClientDashboardLayout'
import { AdminDashboardLayout } from '@/app/layouts/AdminDashboardLayout'
import { GuestOnlyRoute } from '@/app/router/guards/GuestOnlyRoute'
import { ClientRoute } from '@/app/router/guards/ClientRoute'
import { AdminRoute } from '@/app/router/guards/AdminRoute'
import { RouteErrorFallback } from '@/app/error-boundary/RouteErrorFallback'
import { PageLoader } from '@/shared/components/PageLoader'
import { HomePage } from '@/features/public/home/pages/HomePage'

const ServicesPage = lazy(() =>
  import('@/features/services/pages/ServicesPage').then((m) => ({
    default: m.ServicesPage,
  })),
)
const ServiceDetailPage = lazy(() =>
  import('@/features/services/pages/ServiceDetailsPage').then((m) => ({
    default: m.ServiceDetailsPage,
  })),
)
const ContactPage = lazy(() =>
  import('@/features/contact/pages/ContactPage').then((m) => ({
    default: m.ContactPage,
  })),
)
const UnauthorizedPage = lazy(() =>
  import('@/features/auth/pages/UnauthorizedPage').then((m) => ({
    default: m.UnauthorizedPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/features/public/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  })),
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/pages/VerifyEmailPage').then((m) => ({
    default: m.VerifyEmailPage,
  })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const ClientAccountPage = lazy(() =>
  import('@/features/profile/pages/ClientAccountPage').then((m) => ({
    default: m.ClientAccountPage,
  })),
)
const ClientProfilePage = lazy(() =>
  import('@/features/profile/pages/ClientProfilePage').then((m) => ({
    default: m.ClientProfilePage,
  })),
)
const AdminHomePage = lazy(() =>
  import('@/features/admin/dashboard/pages/AdminOverviewPage').then((m) => ({
    default: m.AdminOverviewPage,
  })),
)
const AdminUsersPage = lazy(() =>
  import('@/features/admin/users/pages/AdminUsersPage').then((m) => ({
    default: m.AdminUsersPage,
  })),
)
const AdminCategoriesPage = lazy(() =>
  import('@/features/admin/categories/pages/AdminCategoriesPage').then((m) => ({
    default: m.AdminCategoriesPage,
  })),
)
const AdminServicesPage = lazy(() =>
  import('@/features/admin/services/pages/AdminServicesPage').then((m) => ({
    default: m.AdminServicesPage,
  })),
)
const AdminContactMessagesPage = lazy(() =>
  import(
    '@/features/admin/contact-messages/pages/AdminContactMessagesPage'
  ).then((m) => ({
    default: m.AdminContactMessagesPage,
  })),
)
const AdminContactMessageDetailsPage = lazy(() =>
  import(
    '@/features/admin/contact-messages/pages/AdminContactMessageDetailsPage'
  ).then((m) => ({
    default: m.AdminContactMessageDetailsPage,
  })),
)

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

/**
 * Booking page imports live only inside the enabled branch so Vite can drop
 * the dynamic import graph when VITE_FEATURE_BOOKINGS_ENABLED !== "true".
 * When disabled, booking paths resolve to NotFound without shipping booking chunks.
 */
function clientBookingRoutes(): RouteObject[] {
  if (import.meta.env.VITE_FEATURE_BOOKINGS_ENABLED !== 'true') {
    return [
      {
        path: 'bookings/*',
        element: withSuspense(<NotFoundPage />),
      },
    ]
  }

  const ClientBookingsPage = lazy(() =>
    import('@/features/bookings/pages/ClientBookingsPage').then((m) => ({
      default: m.ClientBookingsPage,
    })),
  )
  const CreateBookingPage = lazy(() =>
    import('@/features/bookings/pages/CreateBookingPage').then((m) => ({
      default: m.CreateBookingPage,
    })),
  )
  const ClientBookingDetailPage = lazy(() =>
    import('@/features/bookings/pages/ClientBookingDetailsPage').then((m) => ({
      default: m.ClientBookingDetailsPage,
    })),
  )

  return [
    {
      path: 'bookings',
      element: withSuspense(<ClientBookingsPage />),
    },
    {
      path: 'bookings/new',
      element: withSuspense(<CreateBookingPage />),
    },
    {
      path: 'bookings/:id',
      element: withSuspense(<ClientBookingDetailPage />),
    },
  ]
}

function adminBookingRoutes(): RouteObject[] {
  if (import.meta.env.VITE_FEATURE_BOOKINGS_ENABLED !== 'true') {
    return [
      {
        path: 'bookings/*',
        element: withSuspense(<NotFoundPage />),
      },
    ]
  }

  const AdminBookingsPage = lazy(() =>
    import('@/features/admin/bookings/pages/AdminBookingsPage').then((m) => ({
      default: m.AdminBookingsPage,
    })),
  )
  const AdminBookingDetailsPage = lazy(() =>
    import('@/features/admin/bookings/pages/AdminBookingDetailsPage').then(
      (m) => ({
        default: m.AdminBookingDetailsPage,
      }),
    ),
  )

  return [
    {
      path: 'bookings',
      element: withSuspense(<AdminBookingsPage />),
    },
    {
      path: 'bookings/:id',
      element: withSuspense(<AdminBookingDetailsPage />),
    },
  ]
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorFallback />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'services', element: withSuspense(<ServicesPage />) },
          {
            path: 'services/:slug',
            element: withSuspense(<ServiceDetailPage />),
          },
          { path: 'contact', element: withSuspense(<ContactPage />) },
          {
            path: 'unauthorized',
            element: withSuspense(<UnauthorizedPage />),
          },
        ],
      },
      {
        element: <GuestOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: withSuspense(<LoginPage />) },
              { path: 'register', element: withSuspense(<RegisterPage />) },
              {
                path: 'verify-email',
                element: withSuspense(<VerifyEmailPage />),
              },
              {
                path: 'forgot-password',
                element: withSuspense(<ForgotPasswordPage />),
              },
              {
                path: 'reset-password',
                element: withSuspense(<ResetPasswordPage />),
              },
            ],
          },
        ],
      },
      {
        path: 'dashboard',
        element: <ClientRoute />,
        children: [
          {
            element: <ClientDashboardLayout />,
            children: [
              {
                index: true,
                element: withSuspense(<ClientAccountPage />),
              },
              ...clientBookingRoutes(),
              {
                path: 'profile',
                element: withSuspense(<ClientProfilePage />),
              },
            ],
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboardLayout />,
            children: [
              { index: true, element: withSuspense(<AdminHomePage />) },
              {
                path: 'users',
                element: withSuspense(<AdminUsersPage />),
              },
              {
                path: 'categories',
                element: withSuspense(<AdminCategoriesPage />),
              },
              {
                path: 'services',
                element: withSuspense(<AdminServicesPage />),
              },
              ...adminBookingRoutes(),
              {
                path: 'contact-messages',
                element: withSuspense(<AdminContactMessagesPage />),
              },
              {
                path: 'contact-messages/:id',
                element: withSuspense(<AdminContactMessageDetailsPage />),
              },
            ],
          },
        ],
      },
      {
        element: <PublicLayout />,
        children: [
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
])
