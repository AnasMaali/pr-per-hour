# Authentication Security

Security notes for PR Per Hour backend authentication (Phase 4).

Related: [AUTHENTICATION_API.md](AUTHENTICATION_API.md), [API_STANDARDS.md](API_STANDARDS.md), [CLIENT_SCHEMA_PARITY.md](CLIENT_SCHEMA_PARITY.md)

## Password hashing

- Passwords are hashed with Laravel’s `hashed` cast on `User` (bcrypt/argon per app config).
- Plaintext passwords are never logged or returned in API responses.
- `password_confirmation` is validation-only and is never persisted.

## Token handling

- Laravel Sanctum personal access tokens are used (`HasApiTokens`).
- Plaintext tokens are returned once on `register` and `login` only.
- `/me` and `/profile` never return tokens.
- Logout deletes **only** the current access token.
- Login does **not** revoke existing tokens.
- Token values must not be written to application logs.
- Tokens are not accepted via query strings.

## Rate limiting

| Route group | Limiter | Default |
| --- | --- | --- |
| `register`, `login` | `throttle:auth` | 5/min keyed by normalized email + IP (or IP) |
| Protected auth routes | global `api` throttle | 60/min by user id or IP |

Configure via `RATE_LIMIT_*` / `config/api.php`.

## Account enumeration prevention

- Unknown email and wrong password share one generic localized message.
- Response status for invalid credentials is `422` (validation), not a distinct “user not found” code.
- Inactive accounts use a separate `403` path only after successful credential verification.

## Role and status protection

- Public registration always forces `role=client` and `status=active` in `RegisterClient`.
- Request input cannot set `role` or `status` during registration.
- `User` mass-assignment (`$fillable`) excludes `role` and `status`; trusted seeders/actions set them explicitly.
- Admins are created via seeder/manual process only (no public admin registration route).

## Profile field restrictions

- Only `name` and `phone` may be updated.
- Protected fields (`email`, `password`, `role`, `status`, ids, timestamps) are **rejected** with validation errors when present.
- Empty profile payloads are rejected.

## Schema boundaries

Authentication does **not** add:

- `email_verified_at`
- `remember_token`
- `locale`
- `last_login_at`
- token metadata columns
- any new auth tables beyond Sanctum’s existing `personal_access_tokens`

Client SQL remains authoritative for the `users` table.

## Not implemented yet

- Email verification
- Password reset / forgot password
- MFA / OTP
- Social login
- Remember-me cookies as a product feature
- Device/session management UI
- Audit/login-history tables
- Password change dedicated endpoint

## Future security review items

- Production rate-limit thresholds under real traffic
- Optional logout-all-devices endpoint if product requires it
- Password policy tightening if compliance requires it
- Admin-only authentication separation if operations require a distinct entrypoint
- Credential stuffing monitoring / lockout policy beyond rate limits
- Review Sanctum stateful domains for production SPA cookie auth when frontend auth ships
