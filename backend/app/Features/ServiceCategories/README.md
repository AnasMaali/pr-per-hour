# ServiceCategories

## Feature purpose

Organize consultancy offerings into categories for browsing and discovery.

## Current status

**Backend API:** implemented (Phase 5) — public list/detail and admin CRUD/status/soft-delete/restore.  
**Frontend:** not started.  
**Services API:** not started (model relation exists only).

## Responsibilities

- Public active category listing and slug detail
- Admin create/update/status/soft-delete/restore
- Authorization via `ServiceCategoryPolicy` (active admin only)
- English and Arabic API messages for this feature

## Explicit non-responsibilities

- Individual service CRUD (belongs to Services)
- Booking or payment rules
- Filament admin UI
- Frontend marketing pages
- Category translation tables / bilingual DB content
- Image upload, icons, sort order, featured flags

## Backend components

- Controllers: `PublicServiceCategoryController`, `AdminServiceCategoryController`
- Form Requests, Actions, DTOs, `ServiceCategoryResource`
- `ServiceCategoryPolicy`
- Feature routes: `app/Features/ServiceCategories/routes/api.php`

## Docs

- [SERVICE_CATEGORIES_API.md](../../../../docs/SERVICE_CATEGORIES_API.md)
- [SERVICE_CATEGORIES_SECURITY.md](../../../../docs/SERVICE_CATEGORIES_SECURITY.md)
