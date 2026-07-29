# Backend Localization

Backend locale foundation for the PR Per Hour API.

Related: [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [API_STANDARDS.md](API_STANDARDS.md)

## Supported locales

| Locale | Direction (frontend) | Backend status |
| --- | --- | --- |
| `en` | LTR | Supported fallback |
| `ar` | RTL | Supported |

English is the fallback locale.

## Resolution priority

1. Valid explicit `X-Locale` header
2. Supported locale from `Accept-Language` (when enabled)
3. Configured fallback locale (`en`)

Normalization examples:

- `ar-PS` → `ar`
- `en-US` → `en`
- unsupported values → fallback `en`

## Headers

| Header | Direction | Purpose |
| --- | --- | --- |
| `X-Locale` | Request | Explicit locale override |
| `Accept-Language` | Request | Browser/client negotiation |
| `Content-Language` | Response | Resolved locale for the response |

Config: `config/localization.php`

## Translation file ownership

Shared API messages:

- `backend/lang/en/api.php`
- `backend/lang/ar/api.php`

Auth feature messages:

- `backend/lang/en/auth.php`
- `backend/lang/ar/auth.php`

Service Categories feature messages:

- `backend/lang/en/service_categories.php`
- `backend/lang/ar/service_categories.php`

Services feature messages:

- `backend/lang/en/services.php`
- `backend/lang/ar/services.php`

Contact Messages feature messages:

- `backend/lang/en/contact_messages.php`
- `backend/lang/ar/contact_messages.php`

Bookings feature messages:

- `backend/lang/en/bookings.php`
- `backend/lang/ar/bookings.php`

Foundation files cover shared errors and health messaging. Feature files own domain success/failure copy.

## API messages vs dynamic database content

- API validation/auth/not-found style messages use Laravel translation files
- Dynamic domain content (services, categories) requires a separate approved localization strategy later
- Do not mix domain content translations into `api.php`

## Not implemented yet

- User locale persistence in the database
- Locale switching endpoint
- Localized URL routes
- Frontend language switcher / preference storage
- Domain feature translations

The React app remains responsible for persistent user language preference later. The API resolves locale per request from headers.
