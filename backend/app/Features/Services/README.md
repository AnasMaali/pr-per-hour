# Services

## Feature purpose

Define and expose PR consultancy services (offerings) that clients can browse and later book.

## Current status

**Backend API:** implemented (Phase 6) — public list/detail and admin CRUD/status/soft-delete/restore.  
**Frontend:** not started.  
**Bookings / Payments:** not started (price may exist without checkout).

## Responsibilities

- Public active service listing and slug detail (category must also be active)
- Admin create/update/status/soft-delete/restore
- Filtering, sorting, and pagination
- Authorization via `ServicePolicy` (active admin only)
- English and Arabic API messages for this feature

## Explicit non-responsibilities

- Booking creation and scheduling (Bookings)
- Payment capture (Payments)
- Invoice generation (Invoices)
- Category CRUD (ServiceCategories)
- Filament admin UI / frontend service pages
- Translation tables / bilingual DB content
- Image upload, gallery, icons, featured flags, sort order

## Backend components

- Controllers: `PublicServiceController`, `AdminServiceController`
- Form Requests, Actions, DTOs, `ServiceResource`, `ServiceCategorySummaryResource`
- `ServicePolicy`
- Feature routes: `app/Features/Services/routes/api.php`

## Docs

- [SERVICES_API.md](../../../../docs/SERVICES_API.md)
- [SERVICES_SECURITY.md](../../../../docs/SERVICES_SECURITY.md)
