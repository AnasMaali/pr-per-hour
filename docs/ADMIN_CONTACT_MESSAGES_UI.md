# Admin Contact Messages UI

Admin inbox for PR Per Hour contact form submissions.

Related: [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md), [CONTACT_MESSAGES_SECURITY.md](CONTACT_MESSAGES_SECURITY.md), [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/admin/contact-messages` list (lazy)
- `/admin/contact-messages/:id` details (lazy)
- URL filters + pagination
- Status update dialog
- Soft-delete confirmation
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex`

Not implemented:

- Reply / outbound email
- Restore UI (API exists; soft-deleted rows are not listable)
- Attachments / subject field (backend has neither)
- Backend or schema changes

Public Contact Page is implemented separately — see [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md).

## Routes

| Path | Page |
| --- | --- |
| `/admin/contact-messages` | `AdminContactMessagesPage` |
| `/admin/contact-messages/:id` | `AdminContactMessageDetailsPage` |

Both under `AdminRoute` + `AdminDashboardLayout`. No create/reply routes.

## List endpoint

`GET /api/v1/admin/contact-messages`

| Capability | Value |
| --- | --- |
| Soft-deleted | Excluded |
| Default `per_page` | 15 (max 100) |
| Default sort | `created_at` desc |
| Filters | `search`, `status`, `email`, `organization`, `created_from`, `created_to` |
| Search covers | `full_name`, `email`, `phone`, `organization`, `message` |
| Sort | `id`, `full_name`, `email`, `status`, `created_at`, `updated_at` |

## Resource

```json
{
  "id": 1,
  "full_name": "...",
  "email": "...",
  "phone": null,
  "organization": null,
  "message": "...",
  "status": "new",
  "created_at": "...",
  "updated_at": "..."
}
```

No `subject`, attachments, assigned admin, reply thread, or `deleted_at` in the resource.

## Statuses

`new` | `read` | `replied` | `closed`

Any documented status may be set via `{ "status": "..." }`. `replied` is operational tracking only — no email is sent.

## Soft delete

`DELETE /api/v1/admin/contact-messages/{id}` soft-deletes. Message leaves list/details (`404`). Restore API (`POST .../restore`) exists but is **not** exposed in this UI.

## Query invalidation

On status update / delete success:

1. Invalidate `['admin', 'contact-messages']` (lists, previews, new-count, detail)
2. Status: set detail cache from mutation response
3. Delete: remove detail cache for that id

Mutations `retry: false`. No `queryClient.clear()`.

## Live-testing limitation

Unauthenticated admin GETs/PATCH/DELETE return `401`. Full success paths need an approved admin account. This phase does not invent credentials.

## Deferred

Advanced motion/3D; map; chatbot; outbound email; privacy-policy page. Public contact form is documented in [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md).
