# Admin Service Categories UI

Admin management for service categories in PR Per Hour.

Related: [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [SERVICE_CATEGORIES_SECURITY.md](SERVICE_CATEGORIES_SECURITY.md), [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/admin/categories` under `AdminRoute` + `AdminDashboardLayout`
- Paginated list with search and active/inactive filter
- Create category dialog
- Edit category dialog (content + status)
- Soft-delete confirmation dialog
- Post-delete restore via known id (Undo/Restore success action)
- Loading, empty, and error states
- Backend validation mapping
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex`
- Query invalidation for admin lists and public catalog

Not implemented:

- Admin Bookings UI
- Contact Messages Management
- Users / Payments / Invoices / Chatbot
- Browsable deleted-category list (backend limitation)
- Force delete
- Nested create/edit routes
- Backend or schema changes

## Route

| Path | Page |
| --- | --- |
| `/admin/categories` | `AdminCategoriesPage` (lazy) |

No `/admin/service-categories` route. Sidebar active state uses `/admin/categories`.

## Feature structure

```
frontend/src/features/admin/categories/
├── api/adminCategoriesApi.ts
├── components/
│   ├── CategoriesSkeleton.tsx
│   ├── CategoriesTable.tsx
│   ├── CategoryDeleteDialog.tsx
│   ├── CategoryDialogShell.tsx
│   ├── CategoryFormDialog.tsx
│   └── CategoryStatusBadge.tsx
├── pages/AdminCategoriesPage.tsx
├── queries/
├── types/adminCategories.types.ts
├── utils/
├── styles/admin-categories.css
└── README.md
```

## List source (critical)

| Question | Answer |
| --- | --- |
| List endpoint | `GET /api/v1/admin/service-categories` |
| Includes inactive? | **Yes** (filterable via `is_active`) |
| Includes soft-deleted? | **No** — excluded by backend |
| Deleted rows discoverable for restore? | **No** from the list API |
| Restore UI | After a successful delete in this session, a success region offers **Restore** using the known numeric id. No fake deleted rows. No permanent client-side trash store. |

`deleted_at` is never exposed in the resource.

## APIs used

| Action | Method | Path |
| --- | --- | --- |
| List | `GET` | `/admin/service-categories` |
| Create | `POST` | `/admin/service-categories` |
| Update content | `PATCH` | `/admin/service-categories/{id}` |
| Update status | `PATCH` | `/admin/service-categories/{id}/status` |
| Soft delete | `DELETE` | `/admin/service-categories/{id}` |
| Restore | `POST` | `/admin/service-categories/{id}/restore` |

Restore uses **POST**, not PATCH (per backend docs).

## Visible fields

`id` (actions only), `name`, `slug`, `description` (nullable), `is_active`, `updated_at`. No fabricated service counts. No HTML rendering of descriptions.

## Validation

Client-side (no library), aligned with backend:

- `name`: required, trim, max 255
- `slug`: required, max 255, `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- `description`: optional; no invented max
- `is_active`: boolean

Backend remains authoritative. Field errors map onto controls.

## Create / edit

- Create submits `name`, `slug`, `description`, `is_active`
- Edit content submits only changed `name` / `slug` / `description`
- Status changes use the status endpoint when `is_active` differs
- Save disabled when edit form is unchanged
- Dialog closes only on success; values preserved on error

## Soft delete / restore

- Confirmation dialog explains soft delete (not permanent)
- No force delete
- After delete, row leaves the list; success + Restore uses known id
- Restore confirmation is the same success-region action (no browsable trash UI)

## Query invalidation

On create / update / status / delete / restore success:

1. `['admin', 'categories']` prefix (all admin category list variants)
2. `queryKeys.categories.all` (public catalog + overview active-category count)

No `queryClient.clear()`. Mutations use `retry: false`.

## Dialogs

Shared `CategoryDialogShell`: `role="dialog"`, `aria-modal`, labelled title, Escape/backdrop close when not pending, focus enter/restore. No dialog library.

## Localization

Namespace: `adminCategories` (EN + AR). Category record content displayed as stored (English DB content).

## Security

- Route guarded by `AdminRoute`
- Central Axios + token storage only
- No `dangerouslySetInnerHTML`
- No force delete; no unsupported fields
- Backend authorization remains authoritative

## SEO

`noindex, nofollow` via `useDocumentMeta`. No canonical / structured data.

## Performance

Lazy route; no new dependencies; no data-grid or animation packages; CSS-only transitions; targeted invalidation.

## Live-testing limitation

Unauthenticated admin mutations return `401`. Full CRUD success paths need an approved admin account. This phase does not invent credentials.

## Deferred

Contact Messages Management and remaining admin CRUD modules. Admin Services UI is documented in [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md). Admin Bookings UI is documented in [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md).
