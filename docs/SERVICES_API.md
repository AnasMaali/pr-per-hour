# Services API

Backend Services endpoints for PR Per Hour (Phase 6).

Related: [SERVICES_SECURITY.md](SERVICES_SECURITY.md), [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [API_STANDARDS.md](API_STANDARDS.md)

## Public endpoints

| Method | Path | Auth | Behavior |
| --- | --- | --- | --- |
| `GET` | `/api/v1/services` | Public | Paginated active services under active categories |
| `GET` | `/api/v1/services/{slug}` | Public | Active service by slug (category must be active) |

### Public visibility

A service is publicly visible only when:

- the service is active and not soft-deleted
- its category is active and not soft-deleted

Activating a service under an inactive category does **not** expose it publicly.

### Public listing

- Default sort: `id` ascending
- Default `per_page`: `12` (max `100`)
- Eager-loads category summary only

Filters:

| Query | Notes |
| --- | --- |
| `search` | title, slug, description |
| `category` | category slug |
| `duration_minutes` | exact match |
| `currency` | normalized uppercase |
| `min_price` / `max_price` | decimal; min must not exceed max |
| `sort` | `id`, `title`, `price`, `duration_minutes`, `created_at` |
| `direction` | `asc` \| `desc` |

Unsupported sort → `422`.

### Public detail

- Resolves by service slug
- Inactive/deleted service, inactive/deleted category, or unknown slug → `404`
- Includes category summary (`id`, `name`, `slug`)
- Never includes bookings, payments, or invoices

## Admin endpoints

All require `auth:sanctum`, active admin, and global `api` throttle.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/admin/services` | Paginated list |
| `POST` | `/api/v1/admin/services` | Create |
| `GET` | `/api/v1/admin/services/{id}` | Details |
| `PATCH` | `/api/v1/admin/services/{id}` | Update fields |
| `PATCH` | `/api/v1/admin/services/{id}/status` | Activate / deactivate |
| `DELETE` | `/api/v1/admin/services/{id}` | Soft delete |
| `POST` | `/api/v1/admin/services/{id}/restore` | Restore soft-deleted |

Clients receive `403`.

### Admin listing

- Includes active and inactive services
- Includes services under inactive categories
- Excludes soft-deleted services
- Default sort: `created_at` descending
- Default `per_page`: `15` (max `100`)

Additional filters: `category_id`, `is_active`, plus the public filter set.

## Resource fields

```json
{
  "id": 1,
  "title": "Media Training",
  "slug": "media-training",
  "description": "...",
  "duration_minutes": 60,
  "price": "100.50",
  "currency": "USD",
  "is_active": true,
  "category": {
    "id": 1,
    "name": "PR Campaigns",
    "slug": "pr-campaigns"
  },
  "created_at": "2026-07-10T12:00:00+00:00",
  "updated_at": "2026-07-10T12:00:00+00:00"
}
```

Price format: fixed 2-decimal **string** (e.g. `"0.00"`, `"12.50"`). Currency is uppercase. `deleted_at` is never exposed.

## Create

Accepted: `category_id`, `title`, `slug`, `description`, `duration_minutes`, `price`, `currency`, `is_active`.

- Slug required, normalized with `Str::slug`, unique
- Category must exist and not be soft-deleted (inactive category allowed)
- Defaults: `price = 0.00`, `currency = USD`, `is_active = true`
- Returns `201`

## Update

Allows: `category_id`, `title`, `slug`, `description`, `duration_minutes`, `price`, `currency`.

Rejects `is_active` (use status endpoint), `id`, timestamps, `deleted_at`. At least one allowed field required.

## Status

`{ "is_active": true|false }` required. Does not change category status or bookings.

## Soft delete and restore

- Soft delete only; no force-delete route
- Restore uses `onlyTrashed()` by numeric id
- Unknown/non-trashed id → `404`
- If the service’s category is soft-deleted → `422` with `error_code: CATEGORY_UNAVAILABLE`
- Restore does not auto-restore the category

## Localization

Messages: `backend/lang/{en,ar}/services.php`.

Database service content remains English-only (client SQL).

## Excluded

- Booking / payment / invoice endpoints
- Translation tables
- Image/gallery/icon/featured/sort_order
- Bulk actions / permanent delete
- Filament / frontend UI
