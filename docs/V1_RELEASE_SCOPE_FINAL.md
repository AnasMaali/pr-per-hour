# PR Per Hour — Final Version 1 Release Scope

## Active modules

- Public website and bilingual public navigation.
- Public service categories, services, and service details.
- Public client registration and login.
- Client account/profile area.
- Public contact form with database storage, rate limiting, and honeypot spam protection.
- Admin dashboard for registered users, service categories, services, and contact messages.

## Disabled future modules

The source code and database migrations remain available, but no HTTP routes or navigation links are exposed by default for:

- Bookings.
- Chatbot.
- Payments.
- Invoices.

The defaults are controlled by backend and frontend environment flags:

```env
FEATURE_BOOKINGS_ENABLED=false
FEATURE_CHATBOT_ENABLED=false
FEATURE_PAYMENTS_ENABLED=false
FEATURE_INVOICES_ENABLED=false

VITE_FEATURE_BOOKINGS_ENABLED=false
VITE_FEATURE_CHATBOT_ENABLED=false
```

Both the backend and frontend flag must be enabled during a future release. Do not enable only one side.

## Authentication baseline

Version 1 uses Laravel Sanctum Bearer tokens. The API no longer enables cookie-based stateful middleware while the frontend is using Bearer tokens. Tokens:

- Are stored in `sessionStorage`, not persistent `localStorage`.
- Expire according to `SANCTUM_TOKEN_EXPIRATION` (default: 480 minutes).
- Are revoked when a new login is completed.
- Are revoked when an admin deactivates a client account.

## Production reminders

- Never deploy or commit `.env` files.
- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Use HTTPS and allow only the real frontend origin in CORS.
- Use strong unique database and admin passwords.
- Run `php artisan config:cache`, `php artisan route:cache`, and the frontend production build after setting production environment values.
