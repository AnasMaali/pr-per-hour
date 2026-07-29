# Frontend API Client

Centralized Axios client for the PR Per Hour React app.

Related: [API_STANDARDS.md](API_STANDARDS.md), [AUTHENTICATION_API.md](AUTHENTICATION_API.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)

## Configuration

- Env var: `VITE_API_BASE_URL` (see `frontend/.env.example`)
- Default fallback: `http://127.0.0.1:8000/api/v1`
- Resolved once in `shared/config/env.ts` — do not repeat the base URL elsewhere
- No secrets and no auth tokens in environment variables

## Client behavior (`shared/api/client.ts`)

| Behavior | Detail |
| --- | --- |
| Base URL | From `env.apiBaseUrl` |
| Accept | `application/json` |
| Content-Type | Set for requests with a body only |
| Locale | `X-Locale` from current i18n language (`en` / `ar`) |
| Auth | `Authorization: Bearer {token}` when `tokenStorage` has a value |
| Errors | Normalized to `ApiClientError` with `NormalizedApiError` |
| 401 | Clears stale auth via a single registered handler (no redirect loops) |
| Retries | Not performed by Axios; QueryClient retries safe GETs only |

## Response types (`shared/api/types.ts`)

Success:

```ts
{ success: true; message?: string; data: T; meta?: M }
```

Error:

```ts
{
  success: false
  message: string
  errors?: Record<string, string[]>
  error_code?: string
  request_id?: string
}
```

Normalized client error fields include `status`, `errorCode`, `requestId`, `errors`, and flags such as `isUnauthorized`, `isValidationError`, and `isInactiveAccount`.

## Token storage

- Abstraction: `shared/lib/tokenStorage.ts`
- Storage: `localStorage` key `prph.auth.token`
- Components must not read/write tokens directly
- Logout and 401 handling remove the token
- Tokens are never logged

**Production note:** HttpOnly cookie-based SPA authentication would be stronger for XSS resistance and should be reviewed before public launch. This foundation matches the current Sanctum Bearer token API without changing the backend.

## Query client

- Single `QueryClient` in `shared/api/queryClient.ts`
- Queries: limited retry (skips 401/403/404/422), `staleTime` 60s, `refetchOnWindowFocus: false`
- Mutations: `retry: false`
- No global toast duplication — features own user messaging

## Query keys

Factories in `shared/api/queryKeys.ts` for: `auth`, `categories`, `services`, `bookings`, `contact`, `admin`.

## Auth API methods

Foundation-only methods in `features/auth/api/authApi.ts`:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`
- `PATCH /auth/profile`

Domain feature API modules (services, bookings, contact, admin) are deferred.
