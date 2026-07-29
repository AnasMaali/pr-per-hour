# Admin Services UI

Admin management for catalog services in PR Per Hour.

Related: [SERVICES_API.md](SERVICES_API.md), [SERVICES_SECURITY.md](SERVICES_SECURITY.md), [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md), [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/admin/services` under `AdminRoute` + `AdminDashboardLayout`
- Paginated admin list with search, category, status, currency, sort
- Create / edit dialogs (content + status)
- Soft-delete confirmation
- Post-delete in-session Restore (known id)
- Category selection from admin categories API
- Decimal price kept as string
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex`

Not implemented:

- Admin Bookings UI (see [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md); implemented separately)
- Contact Messages Management
- Users / Payments / Invoices / Chatbot
- Browsable deleted-service trash list
- Force delete
- Nested create/edit routes
- Backend or schema changes

## Route

| Path | Page |
| --- | --- |
| `/admin/services` | `AdminServicesPage` (lazy) |

## List source (critical)

| Question | Answer |
| --- | --- |
| List endpoint | `GET /api/v1/admin/services` |
| Active + inactive? | **Yes** |
| Soft-deleted? | **No** — excluded |
| Paginated? | **Yes** (default `per_page` 15) |
| Filters | `search`, `category_id`, `is_active`, `currency` (+ unused but supported: `category`, `duration_minutes`, `min_price`, `max_price`) |
| Sort | `id`, `title`, `price`, `duration_minutes`, `created_at`, `updated_at` |
| Restore | `POST /api/v1/admin/services/{id}/restore` |
| Rediscover after refresh? | **No** |

Restore UI: success-region **Restore** after delete using known id only.

## APIs

| Action | Method | Path |
| --- | --- | --- |
| List | `GET` | `/admin/services` |
| Create | `POST` | `/admin/services` |
| Update content | `PATCH` | `/admin/services/{id}` |
| Status | `PATCH` | `/admin/services/{id}/status` |
| Soft delete | `DELETE` | `/admin/services/{id}` |
| Restore | `POST` | `/admin/services/{id}/restore` |

Create fields: `category_id`, `title`, `slug`, `description`, `duration_minutes`, `price`, `currency`, `is_active`.  
Update fields: same except `is_active` (status endpoint).

## Price handling

Form and display keep `price` as a **string**. Client validation uses decimal-string rules without `parseFloat` for storage/display. Backend remains authoritative for `DECIMAL(10,2)`.

## Category selection

Uses `GET /admin/service-categories` (`per_page=100`, sort `name`). Inactive categories labeled. Create/update blocked when category list fails. Assigned category remains representable on edit if missing from options.

## Query invalidation

On create / update / status / delete / restore:

1. `['admin', 'services']` prefix
2. `queryKeys.services.all` (public list/details + overview active-service count)

No `queryClient.clear()`. Mutations `retry: false`.

## Localization

Namespace: `adminServices` (EN + AR). Service/category record content displayed as stored.

## Live-testing limitation

Unauthenticated admin calls return `401`. Full CRUD success paths need an approved admin account. This phase does not invent credentials.

## Deferred

Contact Messages Management and remaining admin CRUD modules. Bookings ops UI is documented in [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md).
