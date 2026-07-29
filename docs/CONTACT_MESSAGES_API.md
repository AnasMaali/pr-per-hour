# Contact Messages API

Backend Contact Messages endpoints for PR Per Hour (Phase 7).

Related: [CONTACT_MESSAGES_SECURITY.md](CONTACT_MESSAGES_SECURITY.md), [API_STANDARDS.md](API_STANDARDS.md), [BACKEND_LOCALIZATION.md](BACKEND_LOCALIZATION.md)

## Public endpoint

| Method | Path | Auth | Middleware |
| --- | --- | --- | --- |
| `POST` | `/api/v1/contact-messages` | Public (guest) | `throttle:contact`, locale, request ID, global `api` throttle |

### Accepted fields

| Field | Rules |
| --- | --- |
| `full_name` | required, string, max 255 |
| `email` | required, string, email, max 255; trimmed and lowercased |
| `phone` | optional, string, max 50 |
| `organization` | optional, string, max 255 |
| `message` | required, string, max **5000** (application validation limit; the DB column is `TEXT` with no schema length change) |

### Rejected / protected fields

Clients must not send: `status`, `id`, `created_at`, `updated_at`, `deleted_at`, `assigned_to`, `subject`, `locale`, `ip`, `ip_address`, `user_agent`.

Presence of any of these fields returns `422`.

### Behavior

- Status is always set to `new` in the Action; it is never accepted from the request.
- No authentication required.
- No email is sent.
- No admin notification, queue job, chatbot conversation, or booking is created.
- Request IP and headers are not stored.
- Duplicate prevention is limited to rate limiting.
- HTTP `201` with a localized success message.

### Public receipt response

Only safe receipt fields are returned:

```json
{
  "id": 1,
  "status": "new",
  "created_at": "2026-07-10T14:00:00+00:00"
}
```

The full message body and contact PII are not returned on the public response.

## Admin endpoints

All require `auth:sanctum`, active admin (`ContactMessagePolicy`), and global `api` throttle. Clients receive `403`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/contact-messages` | Paginated list |
| `GET` | `/api/v1/admin/contact-messages/{contactMessage}` | Full details |
| `PATCH` | `/api/v1/admin/contact-messages/{contactMessage}/status` | Update status only |
| `DELETE` | `/api/v1/admin/contact-messages/{contactMessage}` | Soft delete |
| `POST` | `/api/v1/admin/contact-messages/{id}/restore` | Restore soft-deleted |

### Admin listing

- Includes all statuses (`new`, `read`, `replied`, `closed`)
- Excludes soft-deleted records
- Default `per_page`: `15` (max `100`)
- Default sort: `created_at` descending (tie-break `id`)

Filters:

| Query | Notes |
| --- | --- |
| `search` | `full_name`, `email`, `phone`, `organization`, `message` |
| `status` | `ContactMessageStatus` values |
| `email` | exact match after normalize |
| `organization` | partial match |
| `created_from` / `created_to` | valid dates; from must not exceed to |
| `sort` | `id`, `full_name`, `email`, `status`, `created_at`, `updated_at` |
| `direction` | `asc` \| `desc` |

Unsupported sort or invalid date range → `422`.

No trashed-list endpoint. No eager loading required.

### Admin details

- Returns full `ContactMessageResource`
- Soft-deleted or unknown id → `404`
- Does **not** auto-change status to `read` on GET
- Does not expose `deleted_at`

### Status update

Accepted body: `{ "status": "new"|"read"|"replied"|"closed" }`

- Updates only `status`
- No reply body, no `replied_at`, no email
- Localized success message based on the new status
- HTTP `200`

### Soft delete

- Soft delete only; no force-delete endpoint
- Removed from admin list and details (`404`)
- HTTP `200` with localized message

### Restore

- Uses `onlyTrashed()`
- Unknown id or non-deleted id → `404`
- Does not change status
- HTTP `200` with resource + localized message

## Admin resource fields

```json
{
  "id": 1,
  "full_name": "Sara Client",
  "email": "sara@example.com",
  "phone": "0599000000",
  "organization": "Acme",
  "message": "I need a consultation.",
  "status": "new",
  "created_at": "2026-07-10T14:00:00+00:00",
  "updated_at": "2026-07-10T14:00:00+00:00"
}
```

- `status` is a string enum value
- Timestamps are ISO-8601
- Nullable `phone` / `organization` may be `null`
- Never includes `deleted_at`

## Statuses

| Value | Meaning |
| --- | --- |
| `new` | Fresh submission (default on create) |
| `read` | Reviewed by admin |
| `replied` | Handled offline / replied outside this API |
| `closed` | Closed |

## Localization

Messages live in:

- `backend/lang/en/contact_messages.php`
- `backend/lang/ar/contact_messages.php`

`Content-Language` and `X-Request-ID` follow API standards. Database content is not translated.

## Rate limiting

Public submission uses named limiter `contact` (default 5/min by requester IP). CAPTCHA and advanced anti-spam are out of scope for this phase; production anti-spam review remains future work.

## Explicit exclusions

- No reply endpoint
- No send-email endpoint
- No attachment upload
- No subject field
- No spam scoring
- No bulk actions
- No force delete
- No Filament
- No frontend UI
- No schema / migration changes
