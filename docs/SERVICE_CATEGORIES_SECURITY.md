# Service Categories Security

Security notes for the Service Categories backend API (Phase 5).

Related: [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md), [CLIENT_SCHEMA_PARITY.md](CLIENT_SCHEMA_PARITY.md)

## Authorization

- Mutations and admin reads require Sanctum authentication.
- `ServiceCategoryPolicy` allows actions only when `User::isAdmin()` is true (`role = admin` and `status = active`).
- Clients receive HTTP `403`.
- Unauthenticated callers receive HTTP `401`.
- No Spatie permissions package and no roles/permissions tables.

## Public surface

- Public list/detail return only active, non-deleted categories.
- Inactive and soft-deleted categories behave as `404` on public detail.
- Public responses never expose `deleted_at` or related services.

## Mass assignment and field protection

- Create/update Actions assign attributes explicitly from validated DTOs.
- Update rejects `is_active`, `id`, `deleted_at`, and timestamps on the general update endpoint.
- Status changes go only through the dedicated status endpoint.

## Validation

- Name/slug max length `255` matches the client schema.
- Slug is normalized with `Str::slug` before uniqueness checks.
- Admin list rejects unsupported `sort` values and caps `per_page` at `100`.
- Errors flow through the central API exception renderer (`422` / `401` / `403` / `404`).

## Soft-delete boundaries

- Soft delete only; no force-delete endpoint.
- Soft delete does not permanently remove related services; FK `ON DELETE RESTRICT` applies to hard deletes only.
- Restore uses `onlyTrashed()` lookup by id so standard model binding cannot accidentally restore live rows.

## Schema protection

- No migration changes in this phase.
- No translation tables, locale columns, icons, sort order, or featured flags.
- Category content in the database is not duplicated per language.

## Future review items

- Whether deleting a category with attached services should be blocked at the application layer
- Admin trashed-list endpoint if operations need to browse deleted categories
- Cache for public catalog if traffic warrants it
