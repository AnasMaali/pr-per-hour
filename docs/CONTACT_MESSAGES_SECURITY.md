# Contact Messages Security

Security notes for the Contact Messages backend API (Phase 7).

Related: [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md), [API_STANDARDS.md](API_STANDARDS.md)

## Public rate limiting

- Public `POST /api/v1/contact-messages` uses `throttle:contact`.
- The named limiter keys by requester IP (default 5 requests/minute).
- IP addresses are used only for throttling and are **not** stored on `contact_messages`.

## Validation and field protection

- Form Request validation rejects missing/invalid `full_name`, `email`, and `message`.
- Email is trimmed and lowercased before persistence.
- Application max length for `message` is 5000 characters (not a DB column change).
- Protected operational fields (`status`, timestamps, `deleted_at`, `assigned_to`, `subject`, locale/IP/UA fields) are rejected with `422` when present.
- Status cannot be overridden on public submission; create Action always assigns `new`.

## Admin-only management

- Admin list/details/status/delete/restore require Sanctum authentication.
- `ContactMessagePolicy` allows actions only when `User::isAdmin()` is true.
- Clients and inactive users receive HTTP `403` / inactive handling consistent with Auth.
- Unauthenticated admin calls receive `401`.
- No permissions package and no roles tables beyond `users.role`.

## Soft delete only

- Soft delete only; no force-delete endpoint.
- Soft-deleted records are excluded from admin list and details.
- Restore uses `onlyTrashed()`; live or unknown ids return `404`.
- Restore does not alter status.

## No automatic email or reply flow

- Submitting or updating a contact message never sends email.
- No reply body storage, no `replied_at`, no assign-to-user, no notification queue.
- Status `replied` means operational tracking only; outbound mail is out of scope.

## Schema protection

- No migration changes in this phase.
- Exact client `contact_messages` columns remain unchanged.
- No subject, spam score, IP, user-agent, or attachment columns added.

## Public response minimization

- Public create returns only receipt fields: `id`, `status`, `created_at`.
- Full message body and contact PII are not echoed on the public response.

## Future anti-spam considerations

Production hardening may later include CAPTCHA, honeypot fields, content heuristics, or abuse review workflows. Those are explicitly deferred; this phase relies on validation + IP rate limiting only.
