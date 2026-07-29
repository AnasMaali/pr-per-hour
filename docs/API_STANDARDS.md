# API Standards

PR Per Hour Laravel REST API conventions for Version 1.

## Base path

All application API routes are versioned under:

```text
/api/v1
```

Example health endpoint:

```text
GET /api/v1/health
```

## Success response format

```json
{
  "success": true,
  "message": "Optional localized message",
  "data": {},
  "meta": {}
}
```

Rules:

- `message` is optional
- `data` may be `null`, an object, or an array
- `meta` is omitted when unused
- HTTP status codes remain semantically correct (`200`, `201`, `204`, …)
- `204 No Content` responses have an empty body
- Future domain payloads must use Laravel API Resources

Shared helper: `App\Support\Api\ApiResponse`

## Error response format

```json
{
  "success": false,
  "message": "Localized human-readable message",
  "errors": {},
  "error_code": "OPTIONAL_MACHINE_CODE",
  "request_id": "OPTIONAL_REQUEST_ID"
}
```

Handled statuses include:

| Condition | Status |
| --- | --- |
| ValidationException | 422 |
| AuthenticationException | 401 |
| AuthorizationException | 403 |
| ModelNotFound / NotFoundHttp | 404 |
| MethodNotAllowedHttp | 405 |
| Throttle / TooManyRequests | 429 |
| Unexpected Throwable | 500 |

Production responses must not leak stack traces, SQL, absolute paths, tokens, or secrets.

## HTTP status conventions

- `200` success reads/updates
- `201` created
- `204` no content
- `401` unauthenticated
- `403` forbidden
- `404` missing resource/route
- `405` wrong method
- `422` validation failure
- `429` rate limited
- `500` unexpected server error

## API Resources

Controllers remain thin. Domain JSON shaping belongs in API Resources when features are implemented.

## Pagination meta expectations

List endpoints that paginate place metadata in `meta`:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```

Conventions used by current features:

- Default `per_page`: `15`
- Maximum `per_page`: `100` (validated)
- Unsupported sort fields are rejected with `422`
- Very small public catalogs may omit pagination when explicitly documented (Service Categories public list)

## Request ID behavior

- Header: `X-Request-ID`
- Valid incoming values (letters, numbers, hyphen; max 64) are preserved
- Invalid/empty/oversized values are replaced with a UUID
- Value is stored in request attributes and logging context
- Returned on API responses
- Not persisted to the database

## Locale headers

### `X-Locale`

Explicit request locale. Supported values: `en`, `ar` (regional tags like `ar-PS` normalize to `ar`).

### `Accept-Language`

Used when `X-Locale` is absent or invalid. First supported language tag wins.

### Priority

1. Valid `X-Locale`
2. Supported `Accept-Language`
3. Fallback `en`

### `Content-Language`

API responses include `Content-Language` matching the resolved locale.

## Named rate limiters

Registered names:

| Name | Default | Key | Attached |
| --- | --- | --- | --- |
| `api` | 60/min | authenticated user id or IP | Global API middleware |
| `auth` | 5/min | normalized email + IP when email present | Auth register/login |
| `contact` | 5/min | IP | Public contact message submission |
| `chatbot` | 20/min | authenticated user id or IP | Reserved for chatbot |

Configure via `RATE_LIMIT_*` env vars. Production thresholds require validation.

## Route ownership

- Core versioned routes live in `routes/api.php` and `routes/api/v1.php`
- Features register through `App\Support\Routing\FeatureApiRouteRegistrar`
- Registered features:
  - Auth: `app/Features/Auth/routes/api.php`
  - ServiceCategories: `app/Features/ServiceCategories/routes/api.php`
  - Services: `app/Features/Services/routes/api.php`
  - ContactMessages: `app/Features/ContactMessages/routes/api.php`
  - Bookings: `app/Features/Bookings/routes/api.php`
- Do not create empty placeholder route files
- Feature routes remain under `/api/v1`

## Authentication

- Sanctum personal access tokens (`Authorization: Bearer {token}`)
- Endpoints: register, login, logout, me, profile — see [AUTHENTICATION_API.md](AUTHENTICATION_API.md)
- Invalid login credentials use `422` with a generic message (no account enumeration)
- Inactive accounts use `403` / `INACTIVE_ACCOUNT`
- Frontend auth UI is not part of the API foundation

## Frontend boundary

React must call this API only. The frontend must never access MySQL directly.

## CORS expectations

- Origins come from `CORS_ALLOWED_ORIGINS` (comma-separated)
- Development defaults: `http://localhost:5173`, `http://127.0.0.1:5173`
- Credentials supported for future Sanctum SPA cookies
- No wildcard origin with credentials
- Allowed request headers include `X-Locale` and `X-Request-ID`
- Exposed response headers include `X-Request-ID` and `Content-Language`
