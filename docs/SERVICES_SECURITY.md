# Services Security

Security notes for the Services backend API (Phase 6).

Related: [SERVICES_API.md](SERVICES_API.md), [SERVICE_CATEGORIES_SECURITY.md](SERVICE_CATEGORIES_SECURITY.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md)

## Authorization

- Admin mutations/reads require Sanctum authentication.
- `ServicePolicy` allows actions only when `User::isAdmin()` is true.
- Clients receive HTTP `403`.
- No permissions package and no roles tables.

## Public surface

- Public list/detail return only active services under active, non-deleted categories.
- Inactive services and services under inactive/deleted categories behave as `404` on public detail.
- Public responses never expose `deleted_at`, bookings, payments, or invoices.

## Mass assignment and field protection

- Create/update Actions assign attributes from validated DTOs only.
- Update rejects `is_active` (dedicated status endpoint).
- Protected fields (`id`, timestamps, `deleted_at`) are rejected on update.
- Soft-deleted categories cannot be assigned on create/update.

## Validation

- Title/slug max `255`; currency max `10`; price max `99999999.99` (`DECIMAL(10,2)`).
- Slug normalized with `Str::slug` before uniqueness checks.
- Currency normalized to uppercase.
- Price range filters reject `min_price > max_price`.
- Errors use the central API exception renderer.

## Soft-delete and restore

- Soft delete only; no force-delete endpoint.
- Soft delete does not cascade to bookings.
- Restore is blocked with `422` / `CATEGORY_UNAVAILABLE` when the category is soft-deleted.
- Restore does not recreate or undelete categories.

## No payment or booking side effects

- Creating/updating/activating/deleting a service never creates payments, invoices, or bookings.
- Price may exist without checkout (project scope).

## Schema protection

- No migration changes in this phase.
- No translation tables, locale columns, icons, galleries, or featured flags.
- Service content in the database is not duplicated per language.

## Future review items

- Whether services with existing bookings should block soft delete at the application layer
- Admin trashed-list endpoint if operations need it
- Public cache for catalog pages if traffic warrants it
