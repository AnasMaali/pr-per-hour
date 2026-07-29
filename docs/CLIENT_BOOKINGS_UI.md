# Client Bookings UI

Client booking creation, listing, details, and cancellation for PR Per Hour.

Related: [BOOKINGS_API.md](BOOKINGS_API.md), [BOOKINGS_SECURITY.md](BOOKINGS_SECURITY.md), [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md), [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md), [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- Client dashboard overview
- Create booking (`/dashboard/bookings/new`)
- My bookings list with URL filters + pagination
- Booking details
- Client cancellation (pending/confirmed UI gate; backend authoritative)
- Service Details CTA with safe `service` slug preselection
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex` metadata

Not implemented:

- Admin booking UI
- Payment / invoice / checkout
- Rescheduling
- Calendar integration
- Email/SMS notifications
- Availability slot picker

## Routes

| Path | Page |
| --- | --- |
| `/dashboard` | Client overview + recent bookings preview |
| `/dashboard/bookings` | Paginated list |
| `/dashboard/bookings/new` | Create booking form |
| `/dashboard/bookings/:id` | Details + cancel |

All under `ClientRoute` + `ClientDashboardLayout`. Create route is declared before `:id`.

## Create flow

Accepted fields: `service_id`, `booking_date`, `start_time`, `end_time`, `notes`.

Never submitted: `user_id`, `status`, `meeting_link`, payment/invoice fields.

Service options come from `GET /api/v1/services` (`per_page=100`, sorted by title). Selected service must exist in that list.

### Service preselection

Query parameter: `?service=<slug>`

- Resolved against fetched public services
- Invalid slug leaves service unselected and shows a restrained notice
- Service Details CTA uses `/dashboard/bookings/new?service=<slug>`
- Guests login/register with `state.from` set to that path

### Duration helper

If the selected service has `duration_minutes`, a button can suggest end time from start time using same-day minute arithmetic. Midnight overflow is rejected with a translated message. The helper does not auto-run on every keystroke; the user can still edit end time. Backend remains authoritative.

## List filters (URL)

| URL key | Backend |
| --- | --- |
| `status` | `status` |
| `service_id` | `service_id` |
| `booking_date` | `booking_date` |
| `date_from` | `date_from` |
| `date_to` | `date_to` |
| `sort` | `sort` (`booking_date`, `start_time`, `created_at`, `updated_at`) |
| `direction` | `direction` |
| `page` | `page` |

Defaults: `page=1`, `per_page=10`, `sort=booking_date`, `direction=desc`. Explicit Apply; page resets when core filters change.

## Statuses

`pending`, `confirmed`, `completed`, `cancelled` only. Badge includes visible text (not color-only).

## Cancellation

`PATCH /api/v1/bookings/{id}/cancel`

- UI offers cancel for `pending` / `confirmed`
- Accessible dialog (Escape, focus restore)
- Handles `BOOKING_CANNOT_BE_CANCELLED`
- Soft status update only; booking remains visible

## Machine codes

| Code | UX |
| --- | --- |
| `BOOKING_TIME_CONFLICT` | Form-level conflict message; values preserved |
| `BOOKING_CANNOT_BE_CANCELLED` | Dialog/form error |

## Meeting link

Shown when present as external link with `rel="noopener noreferrer"`. Otherwise “Not available yet”. Clients cannot set meeting links.

## Security

- No admin endpoints
- No `user_id` / `status` / `meeting_link` on create
- Ownership enforced by backend (403/404)
- Notes rendered as text (no `dangerouslySetInnerHTML`)
- Mutations `retry: false`
- Intended destinations remain internal paths via auth redirect helper

## Empty database limitation

Local catalogs may have zero services/bookings. Empty states are expected. Successful create requires an approved client session and at least one active public service. This phase does not seed data.

## Performance

- Lazy routes
- No new dependencies
- Stable booking query keys
- Services options cached 5 minutes
- List paginated at 10

## Deferred

Admin booking UI, payment, invoice, reschedule, calendar, notifications.
