# Admin Contact Messages (React)

Admin inbox for contact form submissions: list, details, status, soft-delete.

See [docs/ADMIN_CONTACT_MESSAGES_UI.md](../../../../../docs/ADMIN_CONTACT_MESSAGES_UI.md).

## Public surface

- `AdminContactMessagesPage` — `/admin/contact-messages`
- `AdminContactMessageDetailsPage` — `/admin/contact-messages/:id`

## Notes

- No subject field (backend has none)
- Statuses: `new`, `read`, `replied`, `closed`
- Soft delete only; restore API exists but is not exposed in this UI
- No reply / outbound email
