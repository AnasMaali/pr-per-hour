# PR Per Hour

Strategic communication and public relations consultancy platform.

## Architecture overview

PR Per Hour uses a separated frontend and backend:

- **React** (Vite + TypeScript) talks only to the **Laravel REST API**
- React never accesses the database directly
- Code is organized in a feature-based modular structure on both sides

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/PROJECT_SCOPE.md](docs/PROJECT_SCOPE.md).

## Project locations

| Area | Path |
| --- | --- |
| Backend (Laravel) | `backend/` |
| Frontend (React + Vite + TypeScript) | `frontend/` |
| Documentation | `docs/` |
| Handoff PDF | `PR_Per_Hour_Decu.pdf` |

## Current project status

**Backend Phases 2–8 and the frontend foundation are in place. Core functional frontend is complete. Full Product Review is complete. Public 3D Scroll Redesign is complete (CSS 3D + GSAP homepage-only; WebGL still not used). Chatbot, payments, and invoices remain not started.**

- Laravel backend with `/api/v1` health endpoint and API standards
- Domain migrations/models match `PR_Per_Hour_SQL.txt` exactly (no translation tables)
- Backend auth: register, login, logout, me, profile (Sanctum tokens; EN/AR messages)
- Backend service categories and services: public list/detail + admin management APIs
- Backend contact messages: public submit + admin list/details/status/soft-delete/restore (no email sending)
- Backend bookings: client create/list/details/cancel + admin status/meeting-link/notes (no payments/calendar)
- React frontend: public homepage + services + contact + auth + client bookings/profile + admin management; cinematic public scroll redesign (GSAP homepage-only) — see [docs/PUBLIC_3D_SCROLL_REDESIGN.md](docs/PUBLIC_3D_SCROLL_REDESIGN.md)
- English + Arabic (LTR/RTL) and light/dark/system themes are wired
- No chatbot AI, payment gateway, invoice generation, Filament, or WebGL are implemented

## Version 1 exclusions (business features)

Prominently excluded from Version 1 implementation:

- No online payment, payment gateway, webhooks, checkout, or payment admin UI
- No invoice generation, PDF invoices, invoice frontend, or invoice admin UI
- No taxes, discounts, refunds, or accounting system
- No advanced CRM, advanced permissions, complex calendar sync, or advanced analytics
- No advanced/production AI chatbot provider integration without an approved specification

Schema preparation for `payments` and `invoices` may occur later without enabling those product features.

## Mandatory presentation requirements

- **Languages:** English (LTR) and Arabic (RTL), with persistent language selection
- **Themes:** Light, dark, and system preference, with persistent selection and no startup flash
- **Performance:** Code splitting, optimized assets, reduced-motion, no mandatory WebGL; measure before advanced motion

Details: [LOCALIZATION_STRATEGY.md](docs/LOCALIZATION_STRATEGY.md), [THEME_STRATEGY.md](docs/THEME_STRATEGY.md), [PERFORMANCE_STRATEGY.md](docs/PERFORMANCE_STRATEGY.md)

## Local development prerequisites

- PHP 8.3+ (Laragon PHP 8.3 recommended for this workspace)
- Composer 2.x
- Node.js 20+ and npm
- MySQL when persistence work begins

## Setup instructions (placeholder)

### Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
# Configure database settings in .env when persistence work begins
php artisan serve
```

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to the Laravel API (default `http://127.0.0.1:8000/api/v1`). See [FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md) and [frontend/README.md](frontend/README.md).

## Documentation

### Scope and planning

- [Project scope](docs/PROJECT_SCOPE.md)
- [Feature matrix](docs/FEATURE_MATRIX.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Requirements traceability](docs/REQUIREMENTS_TRACEABILITY.md)
- [Domain glossary](docs/DOMAIN_GLOSSARY.md)
- [Decision log](docs/DECISIONS.md)
- [Localization strategy](docs/LOCALIZATION_STRATEGY.md)
- [Theme strategy](docs/THEME_STRATEGY.md)
- [Performance strategy](docs/PERFORMANCE_STRATEGY.md)
- [API standards](docs/API_STANDARDS.md)
- [Local backend setup](docs/LOCAL_BACKEND_SETUP.md)
- [Backend localization](docs/BACKEND_LOCALIZATION.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Client schema parity](docs/CLIENT_SCHEMA_PARITY.md)
- [Database seeding](docs/DATABASE_SEEDING.md)
- [Model relationships](docs/MODEL_RELATIONSHIPS.md)

### Frontend foundation

- [Frontend architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Frontend API client](docs/FRONTEND_API_CLIENT.md)
- [Frontend localization](docs/FRONTEND_LOCALIZATION.md)
- [Frontend appearance](docs/FRONTEND_APPEARANCE.md)
- [Frontend accessibility](docs/FRONTEND_ACCESSIBILITY.md)
- [Frontend performance](docs/FRONTEND_PERFORMANCE.md)
- [Public homepage](docs/PUBLIC_HOMEPAGE.md)
- [Public Services UI](docs/PUBLIC_SERVICES_UI.md)
- [Frontend Auth UI](docs/FRONTEND_AUTH_UI.md)
- [Public 3D scroll redesign](docs/PUBLIC_3D_SCROLL_REDESIGN.md)
- [Advanced public experience](docs/ADVANCED_PUBLIC_EXPERIENCE.md) (earlier checkpoint)
- [Final visual polish](docs/FINAL_VISUAL_POLISH.md) (earlier checkpoint)
- [Client Bookings UI](docs/CLIENT_BOOKINGS_UI.md)

### Architecture and status

- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Feature status](docs/FEATURE_STATUS.md)
- [Naming conventions](docs/NAMING_CONVENTIONS.md)
- [Future chatbot handoff](docs/FUTURE_CHATBOT_HANDOFF.md)
- [Future payment handoff](docs/FUTURE_PAYMENT_HANDOFF.md)

## Important warnings

**Chatbot AI, Payments, and Invoices are not implemented.**

They are documented boundaries and scaffolds only. Do not assume AI providers, payment gateways, webhook handlers, or invoice/PDF generation are available.
