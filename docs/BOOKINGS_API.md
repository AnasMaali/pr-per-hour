# Bookings API

Backend Bookings endpoints for PR Per Hour (Phase 8).

Related: [BOOKINGS_SECURITY.md](BOOKINGS_SECURITY.md), [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md), [SERVICES_API.md](SERVICES_API.md), [API_STANDARDS.md](API_STANDARDS.md)

## Client endpoints

All require `auth:sanctum`, an active authenticated user, and global `api` throttle.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/bookings` | Create booking |
| `GET` | `/api/v1/bookings` | List own bookings |
| `GET` | `/api/v1/bookings/{booking}` | Own booking details |
| `PATCH` | `/api/v1/bookings/{booking}/cancel` | Cancel own booking |

### Create booking

Accepted fields:

| Field | Rules |
| --- | --- |
| `service_id` | required; active, non-deleted service under active, non-deleted category |
| `booking_date` | required; today or future (`YYYY-MM-DD`) |
| `start_time` | required; `H:i` |
| `end_time` | required; `H:i`; must be after `start_time` |
| `notes` | optional; string; max **5000** (application limit on `TEXT`) |

Rejected fields (HTTP `422`): `user_id`, `status`, `meeting_link`, timestamps, payment/invoice fields, `id`, `deleted_at`.

Behavior:

- `user_id` always comes from the authenticated user
- `status` always `pending`
- `meeting_link` always `null` on create
- no payment, invoice, email, queue, or calendar side effects
- HTTP `201` with `BookingResource` (service + category loaded)

### Conflict detection

Overlapping bookings for the **same service** on the **same booking_date** are rejected when existing status is `pending` or `confirmed`:

```
new_start < existing_end AND new_end > existing_start
```

Ignored: `cancelled`, `completed`, soft-deleted rows. Adjacent slots (end == next start) are allowed.

On conflict: HTTP `422`, `error_code: BOOKING_TIME_CONFLICT`.

Conflict checks run inside a DB transaction with row locks where supported. Advanced high-concurrency availability locking remains future work.

### Client listing

- Own bookings only; soft-deleted excluded
- Default `per_page`: `10` (max `100`)
- Default sort: `booking_date` desc, then `start_time` desc

Filters: `status`, `service_id`, `booking_date`, `date_from`, `date_to`  
Sort: `booking_date`, `start_time`, `created_at`, `updated_at` (`asc`/`desc`)

Invalid date range → `422`. Eager-loads `service.category` only.

### Client details

- Owner only; non-owner → **403** (booking exists but not owned)
- Soft-deleted / unknown → `404`
- Includes service + category summary, notes, meeting_link
- Does **not** include client summary, payments, or invoices

### Client cancellation

Allowed only when status is `pending` or `confirmed`, and only before booking start datetime (app timezone `UTC`).

Blocked for `completed`, `cancelled`, or past start → `422` / `BOOKING_CANNOT_BE_CANCELLED`.

Sets status to `cancelled` only (no soft delete, refund, email, or payment behavior).

## Admin endpoints

All require `auth:sanctum`, active admin (`BookingPolicy`), and global `api` throttle. Clients receive `403`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/bookings` | Paginated list (all users) |
| `GET` | `/api/v1/admin/bookings/{booking}` | Details |
| `PATCH` | `/api/v1/admin/bookings/{booking}/status` | Status transition |
| `PATCH` | `/api/v1/admin/bookings/{booking}/meeting-link` | Set/clear meeting link |
| `PATCH` | `/api/v1/admin/bookings/{booking}/notes` | Set/clear notes |

### Admin listing

- All statuses; excludes soft-deleted
- Default `per_page`: `15` (max `100`)
- Default sort: `booking_date` desc, `start_time` desc
- Eager-loads `user`, `service.category`

Filters: `status`, `user_id`, `service_id`, `booking_date`, `date_from`, `date_to`, `search`  
Search: user name/email, service title/slug  
Sort: `id`, `booking_date`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`

### Admin details

Includes booking fields, client summary (`id`, `name`, `email`, `phone`), service + category summaries. No password/token/payment/invoice data.

### Status update

Body: `{ "status": "pending"|"confirmed"|"completed"|"cancelled" }`  
`paid` is rejected. See [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md).

Invalid transition → `422` / `BOOKING_INVALID_STATUS_TRANSITION`.

### Meeting link

Body must include `meeting_link` (`present`):

- non-null: valid URL, max 500
- `null` clears the link

No Zoom/Meet API, email, or status change.

### Notes

Body must include `notes` (`present`):

- string max 5000, or `null` to clear

No status change, email, or audit table.

## Resource fields

```json
{
  "id": 1,
  "booking_date": "2026-07-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "status": "pending",
  "notes": "...",
  "meeting_link": null,
  "service": {
    "id": 1,
    "title": "Media Training",
    "slug": "media-training",
    "duration_minutes": 60,
    "price": "150.50",
    "currency": "USD",
    "category": { "id": 1, "name": "...", "slug": "..." }
  },
  "client": { "id": 2, "name": "...", "email": "...", "phone": "..." },
  "created_at": "...",
  "updated_at": "..."
}
```

- `client` only when `user` relation is loaded (admin)
- status string; date `YYYY-MM-DD`; times `HH:mm`; price 2-decimal string; timestamps ISO-8601
- never `deleted_at`, payments, or invoices

## Localization

- `backend/lang/en/bookings.php`
- `backend/lang/ar/bookings.php`

## Explicit exclusions

No payment/invoice/checkout, availability endpoint, reschedule, calendar sync, Google Meet/Zoom APIs, email/SMS/reminders, recurring bookings, bulk actions, delete/restore, Filament, or frontend UI. No schema changes.
