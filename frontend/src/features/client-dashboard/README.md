# Client dashboard (frontend)

## Feature responsibility

Authenticated client area for bookings and profile.

## Status

- Layout shell under `/dashboard`
- Overview, bookings list/create/details/cancel, and profile are implemented via `features/bookings` and `features/profile`
- This folder retains compatibility re-exports only; router imports the owning features directly
