# Bookings

## Feature purpose

Allow authenticated clients to request consultation bookings and allow admins to manage booking status, meeting links, and notes.

## Current status

Backend API implemented (Phase 8). Bookings frontend not started. Payments and invoices remain future-only. Calendar integration not implemented. Filament not installed.

## Responsibilities

- Client create / list / details / cancel
- Admin list / details / status / meeting-link / notes
- Overlap conflict detection for pending/confirmed bookings
- English and Arabic API messages
- Ownership and admin authorization

## Explicit non-responsibilities

- Payments, invoices, checkout, refunds
- Availability calendars, reschedule, recurring bookings
- Google Meet / Zoom APIs, email, SMS, reminders
- Consultant assignment, bulk actions, delete/restore
- Frontend booking UI
- Filament
- Schema / migration changes

## Backend components

- Controllers: `ClientBookingController`, `AdminBookingController`
- Form Requests, DTOs, Actions, Policy, Resources
- Model scopes for filters/search/overlap
- Routes: `routes/api.php`

## Frontend relationship

Consumed later by `frontend/src/features/bookings` through REST API calls only.

## Notes for future developers

- Notes max length `5000` is an application validation limit.
- App timezone is `UTC` for cancellation start checks.
- High-concurrency locking beyond transactional `lockForUpdate` is future work.
- See [docs/BOOKINGS_API.md](../../../../docs/BOOKINGS_API.md), [docs/BOOKINGS_SECURITY.md](../../../../docs/BOOKINGS_SECURITY.md), [docs/BOOKING_STATUS_TRANSITIONS.md](../../../../docs/BOOKING_STATUS_TRANSITIONS.md).
