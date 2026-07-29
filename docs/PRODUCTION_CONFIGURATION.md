# Production configuration — PR Per Hour

This guide covers safe production environment setup for the Laravel API and React SPA. Version 1 keeps bookings, chatbot, payments, and invoices disabled.

## Files that stay outside Git

Commit only example templates. Never commit real secrets.

| File | Role | In Git? |
| --- | --- | --- |
| `backend/.env` | Local / server runtime secrets | No |
| `backend/.env.production` | Production runtime secrets | No |
| `backend/.env.example` | Local development template | Yes |
| `backend/.env.production.example` | Production placeholders only | Yes |
| `frontend/.env` | Local Vite values | No |
| `frontend/.env.production` | Production Vite build values | No |
| `frontend/.env.example` | Local development template | Yes |
| `frontend/.env.production.example` | Production placeholders only | Yes |

Copy examples to the real env files on each machine or host. Fill in real keys, database credentials, and domains only in those private files.

## HTTPS

Serve both the API and the SPA over HTTPS in production. Set:

- `APP_URL=https://…` on the API
- `VITE_API_BASE_URL=https://…/api/v1` for the frontend build

Terminate TLS at your reverse proxy or host. Do not expose plain HTTP for production traffic.

## `APP_DEBUG=false`

Production must use:

```env
APP_ENV=production
APP_DEBUG=false
```

Never leave debug mode enabled. It can expose stack traces and internal details.

## Real frontend and backend URLs

Replace every `example.com` placeholder with your real hosts before go-live:

- Backend: `APP_URL` and database / mail settings
- Frontend: `VITE_API_BASE_URL` pointing at the live API `/api/v1` prefix
- CORS: every browser origin that loads the SPA (see below)

## Strict CORS origins

`CORS_ALLOWED_ORIGINS` is a comma-separated list of exact origins (scheme + host + optional port). Values are trimmed; empty entries and `*` are rejected.

Example:

```env
CORS_ALLOWED_ORIGINS=https://www.example.com,https://example.com
```

This API authenticates with Sanctum **Bearer tokens**, not cookie-based SPA sessions. Do not enable wildcard origins. Supply production SPA origins through the environment — do not hardcode live domains in the repository.

## Rebuild React after changing `VITE_*` variables

Vite embeds `VITE_*` values at **build time**. Changing a production env file does nothing until you rebuild:

```bash
cd frontend
npm run build
```

Then deploy the new `dist/` output.

## Keep future-module flags aligned

Backend (`FEATURE_*`) and frontend (`VITE_FEATURE_*`) must match for each release:

| Module | Backend | Frontend |
| --- | --- | --- |
| Bookings | `FEATURE_BOOKINGS_ENABLED` | `VITE_FEATURE_BOOKINGS_ENABLED` |
| Chatbot | `FEATURE_CHATBOT_ENABLED` | `VITE_FEATURE_CHATBOT_ENABLED` |
| Payments | `FEATURE_PAYMENTS_ENABLED` | `VITE_FEATURE_PAYMENTS_ENABLED` |
| Invoices | `FEATURE_INVOICES_ENABLED` | `VITE_FEATURE_INVOICES_ENABLED` |

Version 1 defaults: all `false`.

- Backend: `false`, `0`, `off`, and `no` never enable a flag (safe parsing).
- Frontend: only the exact string `true` enables a flag; anything else is `false`.

If the frontend flag is `true` and the backend flag is `false`, users may see UI that hits missing API routes. Keep both sides false until a module is intentionally released, then rebuild the SPA.

## Never run `migrate:fresh` in production

`php artisan migrate:fresh` drops all tables. Use only:

```bash
php artisan migrate --force
```

on production, and only after backup and review.

## Clear and cache Laravel configuration after deployment

After updating production `.env` (or deploying new config):

```bash
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Confirm future modules are still off:

```bash
php artisan route:list --path=api/v1
```

There must be no booking, chatbot, payment, or invoice HTTP routes while those flags remain `false`.

## One-time email code cleanup

Schedule Laravel’s scheduler (`* * * * * php artisan schedule:run`) so expired/used OTP rows are pruned daily:

```bash
php artisan otp:prune
```

Configured in `routes/console.php` as `Schedule::command('otp:prune')->daily()`. Retention defaults to `OTP_PRUNE_AFTER_DAYS=7`. No queue worker is required for OTP mail when using synchronous notifications and `MAIL_MAILER=log` (or SMTP) without `ShouldQueue`.

## Resend SMTP (transactional email)

Production sends verification and password-reset codes through Resend’s SMTP relay using Laravel’s built-in `smtp` mailer. Do **not** install a Resend PHP package for this phase.

1. Create a Resend account and an API key with only the sending permissions you need.
2. Verify your production sending domain (or subdomain) in Resend.
3. Add the SPF and DKIM DNS records Resend supplies for that domain.
4. Use an approved `MAIL_FROM_ADDRESS` under the verified domain (for example `no-reply@yourdomain.com`).
5. Set production mail environment variables (placeholders in `backend/.env.production.example`):

```env
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=  # Resend API key — never commit
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

Local development may keep `MAIL_MAILER=log`. Automated tests use `MAIL_MAILER=array` and must not send real email.

After changing mail environment variables:

```bash
php artisan config:clear
php artisan config:cache
```

Send a production smoke-test email before launch. Never commit the API key. Provider errors must not appear in API responses.

## Cloudflare Turnstile

Turnstile protects abuse-sensitive public auth flows:

| Flow | Turnstile action |
| --- | --- |
| Registration | `register` |
| Resend email verification code | `resend_verification` |
| Forgot password | `forgot_password` |

OTP code submission, login, logout, profile, and admin routes do **not** use Turnstile in this phase.

Backend (`TURNSTILE_*`) holds the **secret**. Frontend (`VITE_TURNSTILE_*`) holds only the **public site key**.

Local development may use Cloudflare’s official always-pass test pair:

- Site key: `1x00000000000000000000AA`
- Secret key: `1x0000000000000000000000000000000AA`

Always-fail test keys are documented by Cloudflare for negative testing. Production examples must use real keys from the Cloudflare dashboard — never commit them.

When `TURNSTILE_ENABLED=true` and the secret is missing, verification fails closed. Temporary Cloudflare outages also fail closed with `HUMAN_VERIFICATION_FAILED`.

## Authentication note

Production continues to use Sanctum **Bearer tokens** (`Authorization` header). Do not enable stateful cookie SPA authentication for this phase.
