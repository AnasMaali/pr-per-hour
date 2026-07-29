# Public Contact Page

Public contact form for PR Per Hour.

Related: [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md), [CONTACT_MESSAGES_SECURITY.md](CONTACT_MESSAGES_SECURITY.md), [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/contact` public page (lazy)
- Contact form submission via `POST /api/v1/contact-messages`
- Client validation matching backend limits
- Success receipt state
- 422 / 429 / network / server error handling
- EN/AR, RTL/LTR, light/dark/system
- Public SEO metadata (`index, follow`)

Visual framing (depth background, elevated form) was upgraded in the [public 3D scroll redesign](PUBLIC_3D_SCROLL_REDESIGN.md) without API or behavior changes.

Not implemented:

- Subject / attachments
- Reply or outbound email
- Map embed / live chat / chatbot
- Fake office address, phone, hours, or response SLA
- Backend or schema changes
- WebGL

## Route

| Path | Page |
| --- | --- |
| `/contact` | `ContactPage` |

Public, lazy, inside `PublicLayout`. Header, footer, homepage, and services CTAs already link to `/contact`.

## Endpoint

`POST /api/v1/contact-messages` (public, `throttle:contact` ≈ 5/min by IP)

### Request fields

| Field | Rules |
| --- | --- |
| `full_name` | required, string, max 255 |
| `email` | required, email, max 255 (trimmed + lowercased) |
| `phone` | optional, string, max 50, empty → `null` |
| `organization` | optional, string, max 255, empty → `null` |
| `message` | required, string, max 5000 |

Forbidden client fields (subject, status, etc.) are not sent.

### Response

HTTP `201` receipt:

```json
{ "id": 1, "status": "new", "created_at": "..." }
```

No message body or PII echoed. No email is sent by this action.

## Submission UX

- Pending disables submit and prevents duplicates
- Values preserved on error
- Field errors mapped from 422
- 429 shows a clear wait-and-retry message (no client countdown)
- Success focuses the success region; offers send-another / services / home
- Success copy does **not** claim an email reply was sent

## Live-testing note (local backend)

Verified against `http://127.0.0.1:8000/api/v1/contact-messages`:

| Case | Result |
| --- | --- |
| Empty `{}` | `422` `VALIDATION_FAILED` (required `full_name`, `email`, `message`) |
| Invalid email | `422` on `email` |
| Valid identifiable message | `201` receipt `{ id: 1, status: "new", created_at }` |
| Subsequent request under throttle | `429` `TOO_MANY_REQUESTS` |

**Database:** one local row was created (`id: 1`, name `Frontend Contact Test`, email `frontend-contact-test@example.test`). Not deleted. No seeding. No production data. Backend code and schema were not changed.

**Throttle note:** When the IP limit is already exhausted, an empty or invalid payload may receive `429` before `422`. Empty `{}` returned `422` in this phase only while the throttle window still had capacity.

## Deferred

Advanced motion/3D; map; chatbot; outbound email; privacy-policy page.
