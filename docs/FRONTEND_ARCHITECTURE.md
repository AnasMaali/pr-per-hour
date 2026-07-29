# Frontend Architecture

React application foundation for PR Per Hour (Phase 9 / Implementation Plan Phase 10).

Related: [ARCHITECTURE.md](ARCHITECTURE.md), [FRONTEND_API_CLIENT.md](FRONTEND_API_CLIENT.md), [FRONTEND_LOCALIZATION.md](FRONTEND_LOCALIZATION.md), [FRONTEND_APPEARANCE.md](FRONTEND_APPEARANCE.md), [FRONTEND_ACCESSIBILITY.md](FRONTEND_ACCESSIBILITY.md), [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md)

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | React 19 + TypeScript (strict) |
| Bundler | Vite 8 |
| Routing | React Router 7 (lazy route modules) |
| Server state | TanStack Query |
| HTTP | Axios (single instance) |
| i18n | i18next + react-i18next |
| Styling | Plain CSS + design tokens (no Tailwind / UI kit) |
| Icons | lucide-react (tree-shakeable) |

## Directory layout

```text
frontend/src/
  app/                 # App shell: providers, router, layouts, error boundary
  features/            # Feature boundaries (auth, public, admin, …)
  shared/              # Cross-feature API, UI primitives, i18n, styles
  assets/brand/        # Approved brand assets only
  main.tsx
```

## Boundaries

- React talks **only** to the Laravel REST API under `/api/v1`
- Feature business UI belongs in `features/*`
- `shared/` holds reusable primitives and infrastructure — not feature workflows
- Feature public exports go through each feature `index.ts`

## What this foundation includes

- Environment config (`VITE_API_BASE_URL`)
- Axios client + normalized errors + request ID surfacing
- Auth token storage + auth provider + role helpers
- Route groups: public, auth (guest), client dashboard, admin
- Route guards: guest-only, authenticated, client, admin
- Layout shells with language + appearance controls
- EN/AR localization with LTR/RTL
- Light / dark / system appearance with flash prevention
- Public homepage shell (see [PUBLIC_HOMEPAGE.md](PUBLIC_HOMEPAGE.md))
- Public Services listing and Service Details UI (see [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md))
- Final Login / Register / Unauthorized UI (see [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md))
- Client Booking UI (see [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md))
- Client Profile UI (see [CLIENT_PROFILE_UI.md](CLIENT_PROFILE_UI.md))
- Admin Dashboard Foundation (see [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md))
- Admin Service Categories UI (see [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md))
- Admin Services UI (see [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md))

## What is explicitly not included

- Contact form UI
- Forgot password / email verification / social login
- Admin user management / contact restore UI
- Chatbot UI / AI providers
- Payments / invoices UI
- Reschedule / calendar integration
- Animation libraries / 3D libraries

## Route map

| Area | Paths |
| --- | --- |
| Public | `/`, `/services`, `/services/:slug`, `/contact` |
| Auth | `/login`, `/register` |
| Client | `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/new`, `/dashboard/bookings/:id`, `/dashboard/profile` |
| Admin | `/admin`, `/admin/categories`, `/admin/services`, `/admin/bookings`, `/admin/bookings/:id`, `/admin/contact-messages`, `/admin/contact-messages/:id` |
| System | `/unauthorized`, `*` → not found |

Guards: `GuestOnlyRoute`, `ClientRoute`, `AdminRoute`. Logout clears auth token plus private `bookings` and `admin` React Query caches (public catalog caches may remain).

Public motion: `frontend/src/shared/motion/` (reveals, stagger, route transition, reduced-motion). Hero depth uses CSS 3D — see [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md).

Full product review / route inventory: [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md).

## Local setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Scripts: `dev`, `build`, `lint`, `typecheck`, `preview`.
