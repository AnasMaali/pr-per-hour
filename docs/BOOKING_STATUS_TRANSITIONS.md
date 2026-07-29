# Booking Status Transitions

Exact allowed admin status transitions for PR Per Hour Bookings (Phase 8).

Statuses: `pending`, `confirmed`, `completed`, `cancelled`.

`paid` is **not** a booking status in V1 and must never be accepted.

## Transition matrix

| From | Allowed next statuses |
| --- | --- |
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `completed`, `cancelled` |
| `completed` | _(none)_ |
| `cancelled` | _(none)_ |

## Rules

- Backwards transitions (for example `confirmed` → `pending`) are not allowed.
- Terminal states cannot change further.
- Invalid transition → HTTP `422` with `error_code: BOOKING_INVALID_STATUS_TRANSITION`.
- Client cancellation sets `cancelled` only when current status is `pending` or `confirmed` and the booking start is still in the future; it does not use this admin matrix endpoint.

## Side effects

Status changes update only the `status` column. No payment, invoice, email, queue, or calendar side effects.
