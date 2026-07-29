# Client Profile UI

Client account profile display and name/phone update for PR Per Hour.

Related: [AUTHENTICATION_API.md](AUTHENTICATION_API.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md), [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md), [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/dashboard/profile` under `ClientRoute` + `ClientDashboardLayout`
- Account summary (name, email, phone, role, status)
- Editable name and phone
- Read-only email (not submitted)
- `PATCH /api/v1/auth/profile` via existing `authApi.updateProfile`
- Current-user query cache synchronization (AuthProvider welcome/header update)
- Unsaved-change detection, disabled Save when unchanged, Reset
- EN/AR, RTL/LTR, light/dark/system
- Accessibility and `noindex` metadata

Not implemented:

- Password change
- Email change
- Avatar upload
- Account deletion
- Notification preferences
- Admin profile UI

## Route

| Path | Page |
| --- | --- |
| `/dashboard/profile` | `ClientProfilePage` (lazy) |

## Data source

Uses `useAuth().user` from AuthProvider / `queryKeys.auth.me()` cache. Does not issue a redundant `/me` fetch when the user is already loaded. Shows a loader during auth bootstrap.

## Editable / read-only fields

| Field | UI | Submitted |
| --- | --- | --- |
| `name` | editable, required, max 255 | yes |
| `phone` | editable, optional, max 50; empty clears to `null` | yes (`string \| null`) |
| `email` | read-only | never |
| `role` / `status` | summary only | never |

## API

`PATCH /api/v1/auth/profile` with payload `{ name, phone }`.

Mutation: `useUpdateProfileMutation` (`retry: false`). On success, sets `queryKeys.auth.me()` to the returned user. Token is unchanged.

## Validation

Client-side (no library): name required/trimmed/max 255; phone optional/max 50; no invented phone pattern. Backend remains authoritative. Field errors map for `name` / `phone`.

## Unsaved changes

Compares trimmed name and normalized phone to the last synced user values. Save and Reset are disabled when unchanged. Optional “unsaved changes” status text. No router navigation blocker.

## Success / errors

Inline success region (`aria-live="polite"`). Clears when the user edits again. Errors: 401/403/422/429/5xx/network with optional request ID. No Axios dumps.

## Localization

Namespace: `profile` (EN + AR). Role/status codes remain stable (`client`, `admin`, `active`, `inactive`).

## Security

- Only `name` and `phone` submitted
- No token/password display or localStorage access in the feature
- No `dangerouslySetInnerHTML`
- No profile data in URL query parameters

## Performance

Lazy route; no new dependencies; no duplicate `/me`; CSS-only initials avatar.

## Live-testing limitation

Successful update requires an approved authenticated client. Unauthenticated `PATCH` with `Accept: application/json` returns `401 UNAUTHENTICATED`. This phase does not seed users.

## Deferred

Password change, email change, avatar, account deletion, notification settings, admin profile UI.
