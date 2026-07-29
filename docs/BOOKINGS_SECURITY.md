# Bookings Security

Security notes for the Bookings backend API (Phase 8).

Related: [BOOKINGS_API.md](BOOKINGS_API.md), [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md)

## Authenticated-only client flow

- All client booking endpoints require Sanctum authentication.
- Inactive users fail `create` / ownership policy checks (`403`).
- Public unauthenticated booking creation is not allowed.

## Ownership enforcement

- Clients may access only their own bookings.
- Non-owner access to an existing booking returns **HTTP 403**.
- Soft-deleted or unknown bookings return **404**.
- `user_id` is never accepted from client input; it is taken from the authenticated user.
- Admins manage bookings through `/api/v1/admin/bookings` only (client routes remain owner-scoped).

## Admin-only management

- Admin list/details/status/meeting-link/notes require `User::isAdmin()` (active admin).
- Clients receive HTTP `403` on admin routes.
- No permissions package and no authorization tables beyond `users.role`.

## Protected fields

Create rejects: `user_id`, `status`, `meeting_link`, timestamps, `deleted_at`, payment/invoice identifiers, and related operational fields (`422`).

Status is always forced to `pending` on create; meeting link is always `null`.

## Status transition protection

- Admin status updates follow the documented transition matrix.
- Terminal states (`completed`, `cancelled`) cannot transition further.
- `paid` is not a valid booking status and is rejected by validation.
- Client cancel only sets `cancelled` when allowed; it cannot set other statuses.

## No payment or invoice side effects

Creating, cancelling, or updating a booking never creates payments or invoices, never triggers refunds, and never calls payment gateways.

## No external calendar or meeting APIs

Meeting links are stored as plain URL strings only. No Google Meet, Zoom, calendar sync, email, SMS, or reminder jobs.

## Schema protection

No migration changes in this phase. Exact client `bookings` columns remain unchanged.

## Future concurrency considerations

Create uses a database transaction and `lockForUpdate()` where the driver supports it. Full high-concurrency availability locking and consultant-level scheduling remain future work.
