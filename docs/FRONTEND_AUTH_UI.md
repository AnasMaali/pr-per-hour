# Frontend Auth UI

Final login, register, and unauthorized pages for PR Per Hour.

Related: [AUTHENTICATION_API.md](AUTHENTICATION_API.md), [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/login` polished form
- `/register` polished form (client-only)
- `/unauthorized` auth-aware actions
- AuthLayout polish (brand panel, language/theme, home link)
- Client-side validation aligned with backend rules
- Backend field/form error mapping via normalized API errors
- Safe intended-destination redirects
- Role-aware fallback redirects
- Inactive-account handling (403 `INACTIVE_ACCOUNT`)
- EN/AR localization, RTL/LTR, light/dark/system
- Accessibility and `noindex` SEO metadata

Visual framing (deeper auth atmosphere, elevated cards/benefits) was upgraded in the [public 3D scroll redesign](PUBLIC_3D_SCROLL_REDESIGN.md) without API or auth-behavior changes.

Not implemented:

- Forgot password / reset password
- Email verification
- Social login / OTP / MFA
- Remember-me beyond current token storage
- Booking UI
- Dashboard content
- Admin CRUD UI

## Routes

| Path | Guard | Layout |
| --- | --- | --- |
| `/login` | `GuestOnlyRoute` | `AuthLayout` |
| `/register` | `GuestOnlyRoute` | `AuthLayout` |
| `/unauthorized` | Public | `PublicLayout` |

## Login fields

- `email` (required, valid email)
- `password` (required)

## Register fields

Exact API contract:

- `name` (required, max 255)
- `email` (required, email, max 255)
- `phone` (optional, max 50, nullable)
- `password` (required, min 8, confirmed)
- `password_confirmation` (required)

Never submitted: `role`, `status`, organization, locale, avatar.

Public registration always creates `role=client`, `status=active` on the backend.

## API integration

| Action | Endpoint |
| --- | --- |
| Login | `POST /api/v1/auth/login` |
| Register | `POST /api/v1/auth/register` |
| Logout | `POST /api/v1/auth/logout` (unauthorized page / layouts) |

Uses existing `authApi` + `AuthProvider`. No duplicate Axios client. No direct `localStorage` outside `tokenStorage`.

## Token / cache flow

Registration and login both return a Sanctum plaintext token.

On success:

1. `tokenStorage.set(token)`
2. `queryKeys.auth.me()` cache set to returned user
3. Navigate to safe destination

Inactive users cannot remain authenticated (`isActiveUser` + session clear). Login of inactive accounts fails with `403` before a session is established.

## Redirect behavior

Helper: `resolvePostAuthRedirect(intended, user)`

- Accepts only internal paths starting with `/`
- Rejects `//…`, absolute URLs, schemes (`javascript:`, etc.), backslashes
- Ignores `/login` and `/register` as destinations (avoids loops)
- Fallback: admin → `/admin`, client → `/dashboard`

Intended destination comes from `location.state.from` (set by guards and service CTA).

## Validation

Client-side (no validation library):

- Login: email format, password required
- Register: name/email/phone/password/confirmation rules matching backend limits

Backend remains authoritative. `422` field errors map onto form fields. Generic credential failures use the email field message from the API when present.

## Error mapping

| Condition | UI behavior |
| --- | --- |
| `422` validation / invalid credentials | Field and/or form messages |
| `403` `INACTIVE_ACCOUNT` | Form-level inactive message |
| `429` | Rate-limit message |
| Network | Network message |
| `5xx` | Server message + optional request ID |

No stack traces or Axios dumps. Request ID shown as optional support reference.

## Password field

Accessible show/hide toggle with translated `aria-label`. Does not alter submitted value. No strength meter library.

## Security controls

- No password/token logging
- No open redirects from `state.from`
- No token in URL/query
- No role/status on register payload
- Autocomplete: `email`, `current-password`, `new-password`, `tel`, `name`
- Token remains in `localStorage` via `tokenStorage` (documented architecture trade-off vs HttpOnly cookies)

## Localization

Namespace: `auth` (EN + AR). AuthLayout benefits panel and all form chrome are translated.

## Themes / direction

Reuses navy/gold tokens. AuthLayout uses logical CSS. Language and theme switchers remain available.

## Accessibility

- One H1 per page
- Labels + `aria-invalid` / `aria-describedby`
- Form-level alert for non-field errors
- Disabled submit while pending
- Focus moves to first invalid field or error summary after failed submit

## SEO

Login, register, and unauthorized set title, description, and `robots: noindex, nofollow`. No canonical URL package.

## Performance

- No new npm dependencies
- Routes remain lazy-loaded
- Mutations go through AuthProvider (single token write path)
- CSS-only transitions

## Live verification notes

Invalid login and validation can be exercised against the running API. Full successful login/register requires an approved local test user or a new client registration against a writable local database. Do not invent admin credentials or seed from this phase.

## Deferred

Forgot password, email verification, social login, OTP, booking form, dashboard content.
