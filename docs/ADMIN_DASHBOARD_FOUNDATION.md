# Admin Dashboard Foundation

Admin shell and operational overview for PR Per Hour (React admin path).

Related: [BOOKINGS_API.md](BOOKINGS_API.md), [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md), [SERVICES_API.md](SERVICES_API.md), [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- Final `AdminDashboardLayout` (sidebar, mobile drawer, topbar)
- Admin navigation to overview + management sections
- `/admin` operational overview
- Accurate metrics from API pagination meta / public active catalogs
- Recent bookings preview (admin API, read-only)
- Recent contact messages preview (admin API, read-only)
- Quick actions to categories/services/bookings/contact messages + public site
- EN/AR, RTL/LTR, light/dark/system
- Accessibility, security, `noindex`

Not implemented:

- User management
- Payments / invoices / chatbot
- Charts, analytics, fake KPIs

## Routes

| Path | Status |
| --- | --- |
| `/admin` | Overview (this phase) |
| `/admin/categories` | **Admin Service Categories UI** (see [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md)) |
| `/admin/services` | **Admin Services UI** (see [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md)) |
| `/admin/bookings` | **Admin Bookings UI** (see [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md)) |
| `/admin/bookings/:id` | Booking details (same feature) |
| `/admin/contact-messages` | **Admin Contact Messages UI** (see [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md)) |
| `/admin/contact-messages/:id` | Contact message details (same feature) |

All under `AdminRoute` + `AdminDashboardLayout`. Existing path `/admin/categories` is retained (not renamed to `service-categories`) to avoid dead links.

## Layout

- Desktop: persistent sidebar
- Mobile: accessible drawer with backdrop, Escape close, click-outside close, focus move into drawer, focus restore to toggle, `aria-expanded` / `aria-controls`
- Topbar: identity (name, email, admin role), language, theme, logout
- Link to public website
- Skip link retained

## Accurate metrics

| Metric | Source |
| --- | --- |
| Active categories | `GET /service-categories` array length (public active only) |
| Active services | `GET /services?per_page=1` → `meta.total` |
| Total bookings | `GET /admin/bookings` preview → `meta.total` |
| Pending bookings | `GET /admin/bookings?status=pending&per_page=1` → `meta.total` |
| New messages | `GET /admin/contact-messages?status=new&per_page=1` → `meta.total` |

Never derived from counting a single page of rows as a global total.

## Previews

- Bookings: admin list `per_page=5`, `sort=created_at`, `direction=desc` — no mutations
- Messages: admin list `per_page=5`, `sort=created_at`, `direction=desc` — text excerpt only, no HTML

Section failures are localized; one failed query does not blank the whole overview.

## Guards

`AdminRoute` waits for auth bootstrap, requires authenticated admin, redirects guests to login with intended path, non-admins to `/unauthorized`. Backend remains authoritative.

## Empty database

Zero metrics and empty previews are valid polished states. No seeding.

## Live-testing limitation

Successful admin reads require an approved admin account. Unauthenticated admin GETs with `Accept: application/json` return `401 UNAUTHENTICATED`. This phase does not invent credentials or mutate data.

## Deferred

User management; payments; invoices; chatbot. Categories, services, bookings, and contact messages management are documented in [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md), [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md), [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md), and [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md).
