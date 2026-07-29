# Architecture

## Overview

PR Per Hour is a strategic communication and public relations consultancy platform.

- **Frontend:** React (Vite + TypeScript) in `frontend/`
- **Backend:** Laravel REST API in `backend/`

The React frontend communicates **only** with the Laravel REST API. React must **never** access the database directly.

## Feature-based modular structure

Code is organized by feature on both sides:

- Backend features live under `backend/app/Features/`
- Frontend features live under `frontend/src/features/`

Each feature should be independently understandable: purpose, boundaries, and planned components are documented in that feature's `README.md`.

## Backend and frontend boundaries

| Layer | Responsibility |
| --- | --- |
| React frontend | UI, client state, calling REST endpoints |
| Laravel API | Validation, authorization, business operations, persistence |
| Database | Accessed only by Laravel |

Shared frontend code (`frontend/src/shared`) must not contain feature-specific business logic.

## Backend layering rules

- **Controllers must remain thin.** They receive HTTP input, delegate work, and return responses.
- **Validation belongs in Form Requests.**
- **Response transformation belongs in API Resources.**
- **Business operations belong in Actions or Services.**
- **Authorization belongs in Policies or Middleware.**

## Design constraints

- Avoid oversized files and god classes.
- Avoid unnecessary repository abstraction over Eloquent.
- Prefer explicit, focused Actions for write operations.
- Features must remain independently understandable and reviewable.
- Do not leak AI provider secrets, payment secrets, or database credentials to the frontend.

## Cross-cutting presentation requirements

Localization, theming, and performance are **mandatory** first-class concerns for public and client-facing surfaces:

| Concern | Rule |
| --- | --- |
| Languages | English (LTR) and Arabic (RTL) |
| Theme | Light, dark, and system preference |
| Persistence | Language and theme selections persist between visits |
| Copy | No hardcoded public UI strings; use translation resources |
| Tokens | Shared design tokens for both themes |
| Performance | Code splitting, optimized assets, reduced-motion, no mandatory WebGL |

See:

- [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md)
- [THEME_STRATEGY.md](THEME_STRATEGY.md)
- [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md)
- [DECISIONS.md](DECISIONS.md) ADR-014, ADR-015, ADR-016

## API foundation (Phase 2)

Laravel exposes a versioned JSON API under `/api/v1` with:

- Standardized success/error envelopes (`App\Support\Api\ApiResponse`)
- Request correlation via `X-Request-ID`
- Locale resolution via `X-Locale` / `Accept-Language` and `Content-Language`
- Named rate limiters: `api`, `auth`, `contact`, `chatbot`
- Environment-driven CORS for the React Vite origins
- Sanctum personal access tokens for API authentication
- Explicit feature route registration map (`FeatureApiRouteRegistrar`)

See:

- [API_STANDARDS.md](API_STANDARDS.md)
- [BACKEND_LOCALIZATION.md](BACKEND_LOCALIZATION.md)
- [LOCAL_BACKEND_SETUP.md](LOCAL_BACKEND_SETUP.md)

## Authentication (Phase 4)

Backend Auth feature under `app/Features/Auth` provides:

- `POST /api/v1/auth/register|login|logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/profile`

Frontend authentication UI is not started. Password reset and email verification are excluded for now.

See:

- [AUTHENTICATION_API.md](AUTHENTICATION_API.md)
- [AUTHENTICATION_SECURITY.md](AUTHENTICATION_SECURITY.md)

## Service Categories (Phase 5)

Backend Service Categories under `app/Features/ServiceCategories` provides:

- Public `GET /api/v1/service-categories` and `GET /api/v1/service-categories/{slug}`
- Admin CRUD, status, soft-delete, and restore under `/api/v1/admin/service-categories`

Frontend category UI is not started. Filament is not installed.

See:

- [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md)
- [SERVICE_CATEGORIES_SECURITY.md](SERVICE_CATEGORIES_SECURITY.md)

## Services (Phase 6)

Backend Services under `app/Features/Services` provides:

- Public `GET /api/v1/services` and `GET /api/v1/services/{slug}`
- Admin CRUD, status, soft-delete, and restore under `/api/v1/admin/services`

Public visibility requires an active service under an active category. Frontend services UI and Bookings are not started. Filament is not installed.

See:

- [SERVICES_API.md](SERVICES_API.md)
- [SERVICES_SECURITY.md](SERVICES_SECURITY.md)

## Contact Messages (Phase 7)

Backend Contact Messages under `app/Features/ContactMessages` provides:

- Public `POST /api/v1/contact-messages` (rate-limited; receipt-only response)
- Admin list, details, status update, soft-delete, and restore under `/api/v1/admin/contact-messages`

No email sending, reply flow, or schema changes. Contact frontend UI is not started. Filament is not installed.

See:

- [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md)
- [CONTACT_MESSAGES_SECURITY.md](CONTACT_MESSAGES_SECURITY.md)

## Bookings (Phase 8)

Backend Bookings under `app/Features/Bookings` provides:

- Client create/list/details/cancel under `/api/v1/bookings`
- Admin list/details/status/meeting-link/notes under `/api/v1/admin/bookings`

No payments, invoices, calendar sync, or email. Bookings frontend UI is not started. Filament is not installed.

See:

- [BOOKINGS_API.md](BOOKINGS_API.md)
- [BOOKINGS_SECURITY.md](BOOKINGS_SECURITY.md)
- [BOOKING_STATUS_TRANSITIONS.md](BOOKING_STATUS_TRANSITIONS.md)

## Frontend application foundation

React foundation under `frontend/src` provides:

- Feature-based app shell (`app/`, `features/`, `shared/`)
- React Router with lazy placeholders for public, auth, client, and admin routes
- Route guards (guest, authenticated, client, admin)
- Axios API client, TanStack Query, Sanctum token storage
- EN/AR i18n with LTR/RTL and light/dark/system themes
- Shared layout shells and UI primitives

Final product pages (homepage, services, bookings, contact form, admin CRUD, chatbot, payments) are **not** implemented.

See:

- [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)
- [FRONTEND_API_CLIENT.md](FRONTEND_API_CLIENT.md)
- [FRONTEND_LOCALIZATION.md](FRONTEND_LOCALIZATION.md)
- [FRONTEND_APPEARANCE.md](FRONTEND_APPEARANCE.md)
- [FRONTEND_ACCESSIBILITY.md](FRONTEND_ACCESSIBILITY.md)
- [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md)

## Database schema (Phase 3)

Domain tables match `PR_Per_Hour_SQL.txt` exactly. No translation tables or unauthorized columns.

See:

- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- [CLIENT_SCHEMA_PARITY.md](CLIENT_SCHEMA_PARITY.md)
- [DATABASE_SEEDING.md](DATABASE_SEEDING.md)
- [MODEL_RELATIONSHIPS.md](MODEL_RELATIONSHIPS.md)

## Future-ready scaffolds

`Chatbot`, `Payments`, and `Invoices` are scaffolded only. Requirements are documented; business features are not implemented. See:

- [PROJECT_SCOPE.md](PROJECT_SCOPE.md)
- [FEATURE_MATRIX.md](FEATURE_MATRIX.md)
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [FUTURE_CHATBOT_HANDOFF.md](FUTURE_CHATBOT_HANDOFF.md)
- [FUTURE_PAYMENT_HANDOFF.md](FUTURE_PAYMENT_HANDOFF.md)
- [FEATURE_STATUS.md](FEATURE_STATUS.md)
- [DECISIONS.md](DECISIONS.md)
