# Users

## Feature purpose

Own the `User` Eloquent model and user-domain persistence for the PR Per Hour platform.

## Current status

`model/schema` complete (Phase 3). Profile fields `name` / `phone` are updated through the Auth feature profile endpoint (Phase 4). Broader user management APIs and admin UI are not started.

## Responsibilities

- `App\Features\Users\Models\User` model (Sanctum tokens, soft deletes, role/status enums)
- Coordination with Auth for identity (Auth owns credential endpoints)
- Future user listing/management for authorized staff

## Explicit non-responsibilities

- Authentication credential flows (belongs to Auth)
- Bookings, payments, invoices, or chatbot conversations
- Frontend dashboard UI
- Direct database access from the React frontend

## Notes for future developers

- `$fillable` is limited to `name`, `email`, `phone`, `password`
- `role` and `status` are assigned explicitly in trusted Actions/seeders
- Do not add `email_verified_at` or `remember_token` without an approved schema change
- Keep user domain logic here; keep auth HTTP flows in Auth
