# Authentication API

Backend authentication endpoints for PR Per Hour (Phase 4).

Related: [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md), [API_STANDARDS.md](API_STANDARDS.md), [BACKEND_LOCALIZATION.md](BACKEND_LOCALIZATION.md)

## Base path

```text
/api/v1/auth
```

## Authentication header

Protected routes require:

```http
Authorization: Bearer {plain-text-token}
```

Tokens are Laravel Sanctum personal access tokens. The plaintext token is returned **only** from `register` and `login`.

## Endpoints

| Method | Path | Auth | Throttle | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | `auth` | Register a client user and issue a token |
| `POST` | `/api/v1/auth/login` | Public | `auth` | Authenticate and issue a token |
| `POST` | `/api/v1/auth/logout` | Bearer | `api` (global) | Revoke the **current** access token |
| `GET` | `/api/v1/auth/me` | Bearer | `api` (global) | Current authenticated user |
| `PATCH` | `/api/v1/auth/profile` | Bearer | `api` (global) | Update name and/or phone |

## Registration

`POST /api/v1/auth/register`

### Request fields

| Field | Required | Rules |
| --- | --- | --- |
| `name` | yes | string, max 255 |
| `email` | yes | email, max 255, unique `users.email` (normalized to lowercase) |
| `phone` | no | string, max 50, nullable |
| `password` | yes | confirmed, minimum 8 characters |
| `password_confirmation` | yes | must match `password` |

`role` and `status` are **not** accepted from input. Registration always creates:

- `role = client`
- `status = active`

### Success response — `201`

```json
{
  "success": true,
  "message": "Registration completed successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Test Client",
      "email": "client@example.com",
      "phone": "0599000000",
      "role": "client",
      "status": "active",
      "created_at": "2026-07-10T12:00:00+00:00",
      "updated_at": "2026-07-10T12:00:00+00:00"
    },
    "token": "1|plainTextTokenValue",
    "token_type": "Bearer"
  }
}
```

Token name stored by Sanctum: `client-access-token`.

## Login

`POST /api/v1/auth/login`

### Request fields

| Field | Required | Rules |
| --- | --- | --- |
| `email` | yes | email (normalized) |
| `password` | yes | string |

### Behavior

- Active **client** and active **admin** users may authenticate on this shared endpoint.
- Invalid credentials (unknown email or wrong password) return the **same** generic validation error (`422`) to prevent account enumeration.
- Inactive accounts return `403` with error code `INACTIVE_ACCOUNT`.
- Login creates a **new** token and does **not** delete existing tokens.

### Success response — `200`

Same `data.user` / `data.token` / `data.token_type` shape as registration.

### Invalid credentials — `422`

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["These credentials do not match our records."]
  },
  "error_code": "VALIDATION_FAILED",
  "request_id": "..."
}
```

### Inactive account — `403`

```json
{
  "success": false,
  "message": "This account is inactive. Please contact support.",
  "error_code": "INACTIVE_ACCOUNT",
  "request_id": "..."
}
```

## Current user

`GET /api/v1/auth/me`

Returns the authenticated user resource only (no token).

Unauthenticated → `401` `UNAUTHENTICATED`.

## Profile update

`PATCH /api/v1/auth/profile`

### Allowed fields

| Field | Rules |
| --- | --- |
| `name` | sometimes, required, string, max 255 |
| `phone` | sometimes, nullable, string, max 50 |

At least one of `name` or `phone` must be present (`phone: null` clears the phone).

### Rejected fields (`422`)

Sending any of the following is rejected (not silently ignored):

`email`, `password`, `password_confirmation`, `role`, `status`, `id`, `deleted_at`, `created_at`, `updated_at`

### Success — `200`

Returns the updated user resource (no token).

## Logout

`POST /api/v1/auth/logout`

- Deletes **only** the current personal access token
- Does not revoke other device tokens
- Clears any incidental web session established by Sanctum stateful API
- Success: `200` with localized message (JSON body)

## User resource fields

| Field | Notes |
| --- | --- |
| `id` | integer |
| `name` | string |
| `email` | string |
| `phone` | string or `null` |
| `role` | `admin` \| `client` |
| `status` | `active` \| `inactive` |
| `created_at` | ISO-8601 |
| `updated_at` | ISO-8601 |

Never includes password, token hashes, or `deleted_at`.

## Locales

Supported via existing locale middleware:

- `X-Locale: en` \| `ar`
- or `Accept-Language`

Responses include `Content-Language` and `X-Request-ID`.

Auth messages live in `backend/lang/{en,ar}/auth.php`.

## Excluded from this phase

- Password reset / forgot password
- Email verification
- Remember me
- Social login / MFA / OTP
- Admin public registration
- Password change endpoint
- Account deletion
- Avatar upload
- Logout-all-devices endpoint
- Frontend auth UI
