# Admin Bookings UI

Admin booking operations UI for PR Per Hour.

Related: [BOOKINGS_API.md](BOOKINGS_API.md), [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md), [BOOKINGS_SECURITY.md](BOOKINGS_SECURITY.md), [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/admin/bookings` list (lazy)
- `/admin/bookings/:id` details (lazy)
- URL filters + pagination
- Status update dialog (allowed transitions only)
- Meeting-link update dialog
- Notes update dialog (shared booking notes)
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex`

Not implemented:

- Payment / invoice / refund
- Reschedule / calendar
- Email/SMS notifications
- Contact Messages Management
- User management
- Backend or schema changes

## Routes

| Path | Page |
| --- | --- |
| `/admin/bookings` | `AdminBookingsPage` |
| `/admin/bookings/:id` | `AdminBookingDetailsPage` |

Both under `AdminRoute` + `AdminDashboardLayout`. No `/admin/bookings/new`.

## List endpoint

`GET /api/v1/admin/bookings`

| Capability | Value |
| --- | --- |
| Soft-deleted | Excluded |
| Default `per_page` | 15 (max 100) |
| Default sort | `booking_date` desc |
| Filters | `search`, `status`, `user_id`, `service_id`, `booking_date`, `date_from`, `date_to` |
| Sort | `id`, `booking_date`, `start_time`, `end_time`, `status`, `created_at`, `updated_at` |

## Resource

Admin booking includes `client` (`id`, `name`, `email`, `phone`), `service` + category, `notes`, `meeting_link`, status, times, timestamps. No payments/invoices/`deleted_at`.

## Mutations

| Action | Method | Body |
| --- | --- | --- |
| Status | `PATCH .../status` | `{ status }` |
| Meeting link | `PATCH .../meeting-link` | `{ meeting_link: string\|null }` (`present`) |
| Notes | `PATCH .../notes` | `{ notes: string\|null }` (`present`, max 5000) |

### Status transitions

| From | Allowed |
| --- | --- |
| pending | confirmed, cancelled |
| confirmed | completed, cancelled |
| completed / cancelled | none |

Invalid → `422` / `BOOKING_INVALID_STATUS_TRANSITION`.

### Notes privacy

Notes are the shared booking `notes` field (also visible to the client). UI labels them honestly—not “private admin notes”.

## Filters UX

- Service select: first 100 admin services by title (inactive labeled). If catalog exceeds 100, some services are omitted from the dropdown (documented compromise; numeric `service_id` still works via URL if known).
- Client filter: optional numeric `user_id` (no users directory endpoint).

## Query invalidation

On status / meeting-link / notes success:

1. `['admin', 'bookings']` (lists, previews, counts, detail)
2. `queryKeys.bookings.all` (client list/detail visibility)
3. Detail cache set from mutation response

Mutations `retry: false`. No `queryClient.clear()`.

## Live-testing limitation

Unauthenticated admin GETs/PATCHes return `401`. Full success paths need an approved admin account. This phase does not invent credentials.

## Deferred

Public Contact Page; payments; invoices; reschedule; calendar; notifications.
