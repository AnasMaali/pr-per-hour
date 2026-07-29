# Service Categories API

Backend Service Categories endpoints for PR Per Hour (Phase 5).

Related: [SERVICE_CATEGORIES_SECURITY.md](SERVICE_CATEGORIES_SECURITY.md), [API_STANDARDS.md](API_STANDARDS.md), [AUTHENTICATION_API.md](AUTHENTICATION_API.md)

## Public endpoints

| Method | Path | Auth | Behavior |
| --- | --- | --- | --- |
| `GET` | `/api/v1/service-categories` | Public | Active, non-deleted categories |
| `GET` | `/api/v1/service-categories/{slug}` | Public | Active category by slug |

### Public listing

- Returns **only** `is_active = true` and non-soft-deleted rows
- Ordered by `id` ascending
- **Not paginated** — the catalog is intentionally small (seeded to three categories); pagination would add noise without benefit
- Does not load or return related services

### Public details

- Resolves by `slug`
- Inactive or soft-deleted categories return standardized `404`
- Unknown slug returns `404`
- No services relationship

## Admin endpoints

All require `Authorization: Bearer {token}`, `auth:sanctum`, active **admin** role, and the global `api` throttle.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/service-categories` | Paginated list (active + inactive) |
| `POST` | `/api/v1/admin/service-categories` | Create |
| `GET` | `/api/v1/admin/service-categories/{id}` | Details (non-deleted) |
| `PATCH` | `/api/v1/admin/service-categories/{id}` | Update name/slug/description |
| `PATCH` | `/api/v1/admin/service-categories/{id}/status` | Activate / deactivate |
| `DELETE` | `/api/v1/admin/service-categories/{id}` | Soft delete |
| `POST` | `/api/v1/admin/service-categories/{id}/restore` | Restore soft-deleted row |

Clients receive `403`. Unauthenticated callers receive `401`.

## Resource fields

```json
{
  "id": 1,
  "name": "Strategic Communication",
  "slug": "strategic-communication",
  "description": "...",
  "is_active": true,
  "created_at": "2026-07-10T12:00:00+00:00",
  "updated_at": "2026-07-10T12:00:00+00:00"
}
```

`deleted_at` is never exposed. The same resource shape is used for public and admin responses (`is_active` included for consistency).

## Admin list filters

| Query | Rules |
| --- | --- |
| `search` | optional string; matches `name`, `slug`, `description` (LIKE, parameterized) |
| `is_active` | optional boolean |
| `sort` | `id` \| `name` \| `created_at` \| `updated_at` (unsupported → `422`) |
| `direction` | `asc` \| `desc` (default `desc`) |
| `per_page` | 1–100 (default `15`) |
| `page` | ≥ 1 |

Default sort: `created_at` descending, then `id` descending.

Soft-deleted rows are excluded from the admin list.

Pagination `meta`:

```json
{
  "current_page": 1,
  "per_page": 15,
  "total": 3,
  "last_page": 1
}
```

## Create

Accepted fields: `name` (required), `slug` (required), `description` (nullable), `is_active` (optional boolean, default `true`).

Slug behavior:

- Admin supplies an explicit slug
- Server normalizes with `Str::slug` before validation
- Must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Must be unique on `service_categories.slug`

Returns `201` with localized message and resource.

## Update

`PATCH` allows `name`, `slug`, `description` only. At least one field required.

- `is_active` is **rejected** here (use the status endpoint)
- Protected fields (`id`, timestamps, `deleted_at`) are rejected
- Slug uniqueness ignores the current row

## Status

`PATCH .../status` body: `{ "is_active": true|false }` (required boolean).

Localized message differs for activated vs deactivated. Does not cascade to services.

## Soft delete and restore

- `DELETE` soft-deletes only (`200` + message). No force-delete route.
- Soft-deleted categories disappear from public and default admin lists.
- `POST .../{id}/restore` resolves **only** `onlyTrashed()` by numeric id. Missing or non-trashed ids return `404`.
- Restore does not cascade to services.

## Localization

Messages: `backend/lang/{en,ar}/service_categories.php`.

Database category content remains English-only (client SQL). Bilingual API messages do not imply bilingual DB rows.

## Excluded

- Services API
- Translation tables/endpoints
- Image/icon/sort_order/featured fields
- Bulk actions
- Permanent delete
- Filament / frontend UI
