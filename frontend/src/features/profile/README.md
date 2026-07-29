# Profile (frontend)

Client profile display and name/phone update.

## Status

Implemented:

- `/dashboard/profile` page
- Account summary (name, email, phone, role, status)
- Editable name and phone
- Read-only email
- `PATCH /auth/profile` via existing `authApi`
- Auth `/me` cache synchronization
- EN/AR, RTL/LTR, light/dark/system

Not implemented:

- Password change
- Email change
- Avatar upload
- Account deletion
- Notification preferences
- Admin profile UI

## Docs

See [docs/CLIENT_PROFILE_UI.md](../../../../docs/CLIENT_PROFILE_UI.md).
