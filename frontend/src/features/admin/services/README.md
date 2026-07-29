# Admin Services (React)

Admin catalog services management UI.

See [docs/ADMIN_SERVICES_UI.md](../../../../../docs/ADMIN_SERVICES_UI.md).

## Public surface

- `AdminServicesPage` — lazy-loaded at `/admin/services`

## Notes

- List: `GET /admin/services` (active + inactive; soft-deleted excluded; paginated)
- Restore after delete uses known id only
- Price remains a decimal string
- Admin Bookings UI is out of scope
