# Admin Categories (React)

Admin service categories management UI.

See [docs/ADMIN_SERVICE_CATEGORIES_UI.md](../../../../../docs/ADMIN_SERVICE_CATEGORIES_UI.md).

## Public surface

- `AdminCategoriesPage` — lazy-loaded at `/admin/categories`

## Notes

- List source: `GET /admin/service-categories` (active + inactive; soft-deleted excluded)
- Restore after delete uses known id only; no browsable trash list
- Admin Services UI is out of scope for this feature folder
