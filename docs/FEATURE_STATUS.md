# Feature Status

This file tracks implementation progress. It is distinct from requirements documentation.

## Status vocabulary

| Value | Meaning |
| --- | --- |
| `not_started` | No scaffold and no implementation |
| `scaffolded` | Feature folder/README exists |
| `requirements_documented` | Scope captured in docs (not code) |
| `in_progress` | Active implementation |
| `completed` | Implemented and verified |
| `blocked` | Cannot proceed |

**Current phase note:** Backend Phases 2–8 and the frontend foundation are in place. **Core functional frontend is complete**. **Full Product Review is complete**. **Advanced public visual experience** and **Final Visual Polish** checkpoints are complete. **Public 3D Scroll Redesign is complete** (cinematic scroll + logo draw; GSAP homepage-only; **no WebGL** — see [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md)). Chatbot, payments, invoices remain not started.

## Backend features (`backend/app/Features`)

| Feature | Scaffold | Requirements | Implementation |
| --- | --- | --- | --- |
| Auth | scaffolded | requirements_documented | backend implemented (register/login/logout/me/profile); **frontend Login/Register + Client Profile UI implemented**; forgot-password/email-verification excluded |
| Users | scaffolded | requirements_documented | model/schema + profile fields via Auth; admin user APIs not_started |
| ServiceCategories | scaffolded | requirements_documented | backend API implemented (public + admin); public filter UI via Services listing; **admin categories management UI implemented** |
| Services | scaffolded | requirements_documented | backend API implemented (public + admin); **public listing + details UI implemented**; **admin services management UI implemented**; client booking create UI lives under Bookings |
| Bookings | scaffolded | requirements_documented | backend API implemented (client + admin); **client booking UI implemented**; **admin bookings list/details/status/meeting-link/notes UI implemented**; payments/invoices/calendar not implemented |
| ContactMessages | scaffolded | requirements_documented | backend API + **public contact form** + **admin contact messages UI** implemented; email/reply not implemented |
| Chatbot | scaffolded | requirements_documented | conversation/message models only; no AI provider |
| Payments | scaffolded | requirements_documented | schema/model only; business excluded from V1 |
| Invoices | scaffolded | requirements_documented | schema/model only; business excluded from V1 |

## Frontend features (`frontend/src/features`)

| Feature | Scaffold | Requirements | Implementation |
| --- | --- | --- | --- |
| auth | scaffolded | requirements_documented | **Login/Register/Unauthorized UI implemented**; token/provider foundation reused; profile update UI lives under `profile` feature; forgot-password not_started (excluded) |
| public | scaffolded | requirements_documented | homepage cinematic scroll redesign complete; services/contact routes delegate to those features |
| services | scaffolded | requirements_documented | **public listing + details UI implemented**; visual framing upgraded in redesign; CTA links to client booking create |
| bookings | scaffolded | requirements_documented | **client create/list/details/cancel UI implemented**; **admin bookings UI implemented** under `admin/bookings` |
| profile | scaffolded | requirements_documented | **client profile display + name/phone update implemented**; password/email/avatar/delete not_started |
| contact | scaffolded | requirements_documented | **public contact form + admin contact messages UI implemented**; no reply/email |
| admin | scaffolded | requirements_documented | **layout + overview foundation implemented**; **categories + services + bookings + contact messages UI implemented** |
| chatbot | scaffolded | requirements_documented | boundary only; UI/provider not_started |
| client-dashboard | scaffolded | requirements_documented | **overview + bookings + profile routes implemented** |

## Cross-cutting planned items

| Item | Status |
| --- | --- |
| Laravel API Foundation (`/api/v1`, responses, locale, CORS, Sanctum infra) | implemented (Phase 2) |
| Client DB schema parity (9 tables + models/factories/seeders) | implemented (Phase 3; no domain APIs) |
| Frontend application foundation (router, API client, layouts, guards, i18n, theme) | implemented |
| Public homepage shell | implemented (cinematic scroll redesign complete — see PUBLIC_3D_SCROLL_REDESIGN.md) |
| Public Services listing + Service Details UI | implemented |
| Frontend Auth UI (login/register/unauthorized) | implemented |
| Client Booking UI | implemented |
| Client Profile UI | implemented |
| Admin Dashboard Foundation | implemented (layout + overview) |
| Admin Service Categories UI | implemented (create/edit/status/soft-delete; restore via known id after delete; no browsable trash list) |
| Admin Services UI | implemented (create/edit/status/soft-delete; restore via known id after delete; no browsable trash list) |
| Admin Bookings UI | implemented (list/details/status/meeting-link/notes; no payment/invoice/reschedule) |
| Admin Contact Messages UI | implemented (list/details/status/soft-delete; no reply/email; restore API not exposed in UI) |
| Public Contact Page | implemented (form submit; no subject/attachments/reply/email) |
| Full Product Review | completed (stabilization; see FULL_PRODUCT_REVIEW.md) |
| Advanced Public Experience | implemented + checkpoint QA (CSS 3D + shared motion; **no WebGL**; superseded for public pages by redesign — see ADVANCED_PUBLIC_EXPERIENCE.md) |
| Final Visual Polish | **completed** (historical polish checkpoint; see FINAL_VISUAL_POLISH.md) |
| Public 3D Scroll Redesign | **completed** (CSS 3D sculpture + GSAP logo draw; homepage-only GSAP; **no WebGL**; see PUBLIC_3D_SCROLL_REDESIGN.md) |
| Public Website UI (full services/contact/marketing set) | homepage + services catalog + contact form + cinematic scroll redesign done; remaining marketing pages not_started |
| Localization (EN/AR, LTR/RTL) | backend request locale implemented; **frontend foundation implemented** |
| Theme System (light/dark/system) | **frontend foundation implemented** (+ public cinematic tokens) |
| Performance System | foundation + Full Product Review baseline + advanced public + redesign budgets measured |
| Motion System | **public cinematic scroll redesign complete** (CSS 3D + homepage GSAP; **no WebGL**); further WebGL deferred |
| Emails | planned supportive capability |
| Deployment | planned |

## Notes

- Chatbot AI provider integration is **not implemented** and is not treated as completed V1 scope.
- Payments and Invoices business features are **excluded** from Version 1; schema preparation may occur later without enabling product flows.
- Localization and theming are **mandatory**, not optional, for public and client-facing UI.
- Public homepage shell, Services UI, Auth UI, Client Booking UI, Client Profile UI, Admin Dashboard Foundation, Admin Service Categories UI, Admin Services UI, Admin Bookings UI, Admin Contact Messages UI, and Public Contact Page are implemented; **Full Product Review complete**; **Public 3D Scroll Redesign complete** (CSS 3D + homepage GSAP; no WebGL); chatbot and payments remain not started.
- Service Categories / Services / Contact / Bookings backend APIs are implemented; client booking/profile, admin management UIs, and public contact form are implemented.
- See also: [FEATURE_MATRIX.md](FEATURE_MATRIX.md), [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [PUBLIC_HOMEPAGE.md](PUBLIC_HOMEPAGE.md), [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md), [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md), [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md), [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md), [CLIENT_PROFILE_UI.md](CLIENT_PROFILE_UI.md), [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md), [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md), [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md), [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md), [AUTHENTICATION_API.md](AUTHENTICATION_API.md), [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [SERVICES_API.md](SERVICES_API.md), [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md), [BOOKINGS_API.md](BOOKINGS_API.md), [API_STANDARDS.md](API_STANDARDS.md), [PROJECT_SCOPE.md](PROJECT_SCOPE.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [THEME_STRATEGY.md](THEME_STRATEGY.md), [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md).
