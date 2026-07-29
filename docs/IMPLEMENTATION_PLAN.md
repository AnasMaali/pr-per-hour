# Implementation Plan

Ordered delivery plan for PR Per Hour Version 1.

Rules for every phase:

- Work one phase / one feature focus at a time
- Frontend never accesses the database directly
- Chatbot remains scaffold/integration-ready unless a provider spec is approved
- Payments/invoices remain foundation-only (schema at most)
- Heavy animation only after functional UI is stable **and** performance checks pass
- Every UI phase includes Arabic, English, RTL, LTR, light, and dark acceptance checks
- Performance verification is continuous, not only final-phase
- Do not mix unrelated features in one phase

Related docs: [PROJECT_SCOPE.md](PROJECT_SCOPE.md), [FEATURE_MATRIX.md](FEATURE_MATRIX.md), [DECISIONS.md](DECISIONS.md), [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [THEME_STRATEGY.md](THEME_STRATEGY.md), [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md)

---

## Phase 0 — Foundation Review

**Objective:** Confirm existing Laravel/React scaffolds and docs before coding.

**Files or modules involved:** `backend/`, `frontend/`, `docs/`, `.cursor/rules/`

**Prerequisites:** Repository available; PHP 8.3+, Composer, Node/npm available.

**Implementation tasks:**

- Verify feature folders exist
- Verify no domain business logic yet
- Confirm documentation set is complete after requirements phase

**Explicit non-goals:** No code changes; no migrations; no dependency installs beyond what already exists.

**Verification commands:**

```bash
# inspect only
ls backend/app/Features
ls frontend/src/features
ls docs
```

**Expected report:** Foundation intact; ready for domain modeling docs consumption.

**Rollback considerations:** N/A (read-only).

**Handoff notes:** Use Laragon PHP 8.3 for Laravel commands.

---

## Phase 1 — Requirements and Domain Modeling

**Objective:** Normalize PDF requirements into project docs and decision records.

**Files or modules involved:** `docs/*`, `.cursor/rules/*`, `README.md`

**Prerequisites:** Phase 0; readable `PR_Per_Hour_Decu.pdf`

**Implementation tasks:**

- Maintain PROJECT_SCOPE, FEATURE_MATRIX, TRACEABILITY, GLOSSARY, DECISIONS
- Keep chatbot/payment/invoice boundaries explicit
- Keep localization, theme, and performance strategies current

**Explicit non-goals:** No application code; no migrations.

**Verification commands:** Confirm required markdown files exist; review internal links.

**Expected report:** Requirements documented; ambiguities logged.

**Rollback considerations:** Revert doc commits only.

**Handoff notes:** Requirements include mandatory EN/AR, themes, and performance. Stop before coding unless a later phase is explicitly requested.

---

## Phase 2 — Laravel API Foundation

**Objective:** Prepare API bootstrap (CORS, API route file conventions, base response patterns) and locale-awareness preparation without translating domain features yet.

**Files or modules involved:** `backend/bootstrap/`, `backend/routes/`, `backend/config/`, `backend/app/Providers/`

**Prerequisites:** Phase 1 complete.

**Implementation tasks:**

- Confirm API routing entrypoints
- Document/base JSON conventions
- Environment placeholders for frontend origin
- Prepare locale-awareness hooks (e.g. Accept-Language / locale header conventions) without domain translations yet
- Document that validation/API user messages will be localizable

**Explicit non-goals:** No Sanctum install unless this phase explicitly includes auth prep later split; no domain controllers; no Filament; no full translation catalogs for all domain features.

**Verification commands:**

```bash
cd backend
php artisan --version
php artisan route:list
php artisan test
```

**Expected report:** API skeleton ready for feature endpoints; locale-awareness approach documented.

**Rollback considerations:** Revert config/route changes.

**Handoff notes:** Keep controllers thin from the first endpoint onward. See LOCALIZATION_STRATEGY.md.

---

## Phase 3 — Database Migrations and Models

**Objective:** Create Laravel migrations/models for the PDF schema, including future-ready `payments` and `invoices` tables.

**Files or modules involved:** `backend/database/migrations/`, `backend/app/Models/`, feature READMEs

**Prerequisites:** Phase 2; MySQL configured.

**Implementation tasks:**

- Migrate `users` extensions, `service_categories`, `services`, `bookings`, `chat_conversations`, `chat_messages`, `contact_messages`
- Add `payments` and `invoices` tables as schema-only
- Seed initial service categories
- Soft deletes/indexes per PDF

**Explicit non-goals:** No payment/invoice business logic; no controllers yet beyond what is strictly needed for smoke checks.

**Verification commands:**

```bash
cd backend
php artisan migrate
php artisan db:seed --class=...   # when seeder exists
php artisan test
```

**Expected report:** Schema matches PDF; payments/invoices unused by app code.

**Rollback considerations:** `php artisan migrate:rollback` on non-prod only.

**Handoff notes:** Do not expose payment/invoice models via API in V1.

---

## Phase 4 — Authentication

**Objective:** Implement register/login/logout/me with client-only public registration.

**Files or modules involved:** `backend/app/Features/Auth/`, Users model, routes, tests

**Prerequisites:** Phase 3.

**Implementation tasks:**

- Install/configure Sanctum if selected
- Auth endpoints from PDF §20.1
- Force `role=client` on public register
- Admin seeder
- Policies/middleware baselines

**Explicit non-goals:** Password reset, email verification, social login, MFA.

**Verification commands:**

```bash
cd backend
php artisan test --filter=Auth
```

**Expected report:** Auth flows pass; admin cannot be publicly registered.

**Rollback considerations:** Remove auth routes/package config carefully.

**Handoff notes:** Hash passwords; rate-limit login later in security phase if not done here.

---

## Phase 5 — Service Categories

**Objective:** Public read + admin write for categories.

**Files or modules involved:** `backend/app/Features/ServiceCategories/`

**Prerequisites:** Phase 4 (for admin protection).

**Implementation tasks:**

- Controllers, Form Requests, Resources, Actions/Services
- Public GET list/detail by slug
- Admin POST/PUT/DELETE
- `is_active` filtering

**Explicit non-goals:** Frontend UI; unrelated booking logic.

**Verification commands:**

```bash
cd backend
php artisan test --filter=ServiceCategor
```

**Expected report:** Category API works; inactive hidden publicly.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Keep slug unique.

---

## Phase 6 — Services

**Objective:** Public/admin service APIs with category relation.

**Files or modules involved:** `backend/app/Features/Services/`

**Prerequisites:** Phase 5.

**Implementation tasks:**

- Service CRUD endpoints
- Price/currency/duration fields without payment
- Active filtering

**Explicit non-goals:** Checkout; payment intents.

**Verification commands:**

```bash
cd backend
php artisan test --filter=Service
```

**Expected report:** Services API complete for V1 read/manage.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Price may be non-zero without enabling payments.

---

## Phase 7 — Contact Messages

**Objective:** Public contact submit + admin status management.

**Files or modules involved:** `backend/app/Features/ContactMessages/`

**Prerequisites:** Phase 4 for admin routes.

**Implementation tasks:**

- `POST /api/contact`
- Admin list/show/status endpoints
- Statuses: new/read/replied/closed
- Rate limiting recommended

**Explicit non-goals:** CRM pipelines; email autoresponders beyond basic if not specified.

**Verification commands:**

```bash
cd backend
php artisan test --filter=Contact
```

**Expected report:** Contact intake stored and manageable.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Keep separate from chatbot tables.

---

## Phase 8 — Bookings

**Objective:** Authenticated booking create/list and admin status updates.

**Files or modules involved:** `backend/app/Features/Bookings/`

**Prerequisites:** Phases 4 and 6.

**Implementation tasks:**

- Client booking endpoints
- Admin booking list + status update
- Statuses: pending/confirmed/completed/cancelled
- Notes + meeting_link support

**Explicit non-goals:** Payment status; calendar sync; multi-consultant scheduling.

**Verification commands:**

```bash
cd backend
php artisan test --filter=Booking
```

**Expected report:** End-to-end booking API without payment.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Never add `paid` booking status in V1.

---

## Phase 9 — Admin Dashboard

**Objective:** Deliver admin management for active V1 modules.

**Status:** Admin Dashboard Foundation, **Admin Service Categories UI**, **Admin Services UI**, **Admin Bookings UI**, and **Admin Contact Messages UI** implemented in React (see [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md), [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md), [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md), [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md), [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md)). Filament remains not started.

**Files or modules involved:** `frontend/src/features/admin/`, `frontend/src/app/layouts/AdminDashboardLayout*`, admin APIs (backend already done)

**Prerequisites:** Phases 4–8 (and chatbot foundation if enabling chat admin in same release train).

**Implementation tasks:**

- Admin layout, navigation, overview metrics/previews (done)
- Categories CRUD management UI (done; restore discovery limited by API)
- Services CRUD management UI (done; restore discovery limited by API)
- Bookings list/details/status/meeting-link/notes UI (done; no payment/invoice/reschedule)
- Contact messages list/details/status/soft-delete UI (done; no reply/email; restore API not exposed)
- Users CRUD module (deferred)
- Optional chatbot conversations module when foundation ready

**Explicit non-goals:** Payment/invoice admin screens; installing unnecessary packages beyond chosen admin approach.

**Verification commands:**

```bash
cd frontend
npm run build
```

**Expected report:** Admin can open overview and manage service categories, services, bookings, and contact messages.

**Rollback considerations:** Feature-scoped frontend revert; Filament remains optional and not installed.

**Handoff notes:** Filament is recommended but not mandatory; do not mark installed until actually added. Do not invent analytics KPIs. Soft-deleted categories/services are not listable via current admin GET — restore UI is session/known-id only.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 10 — React Application Foundation

**Objective:** Wire React app for routing, API client baseline, layouts, **localization foundation**, and **theme foundation** — still minimal UI.

**Status:** Implemented in the repository as the frontend foundation (task labeling may say “Phase 9”; this plan’s Phase 10 is the matching scope).

**Files or modules involved:** `frontend/src/app/`, `shared/api/`, `shared/layouts/`, `shared/styles/`, locale/theme shared modules, router setup

**Prerequisites:** Backend API foundation available.

**Implementation tasks:**

- Add routing (React Router when approved to install)
- API base URL config
- Public/Dashboard layout shells
- Auth token/session client baseline
- Localization foundation: EN/AR resources structure, direction (LTR/RTL), language switch persistence, browser detection + English fallback
- Theme foundation: light/dark/system, persistence, design tokens, startup flash prevention approach
- Ensure no hardcoded public UI strings in foundation shells

**Explicit non-goals:** Full visual marketing design; animation libraries; choosing final locale routing strategy; translating all future pages content beyond foundation keys; Tailwind/theme library unless approved for this phase.

**Verification commands:**

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Expected report:** App boots with routes shell, API config, working language switch (EN/AR + dir), and theme switch (light/dark/system) without flash.

**Rollback considerations:** Revert frontend foundation commits.

**Handoff notes:** Install only dependencies approved for the phase. See LOCALIZATION_STRATEGY.md, THEME_STRATEGY.md, and FRONTEND_*.md docs.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark, system.

---

## Phase 11 — Public Website

**Objective:** Implement homepage sections and public pages content structure.

**Status:** Public homepage shell implemented (see [PUBLIC_HOMEPAGE.md](PUBLIC_HOMEPAGE.md)). Public Services listing and Service Details UI implemented (see [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md)). **Public Contact Page implemented** (see [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md)).

**Files or modules involved:** `frontend/src/features/public/`, public layout shells

**Prerequisites:** Phase 10 (React Application Foundation / frontend foundation commit).

**Implementation tasks:**

- Hero through Contact sections per PROJECT_SCOPE / approved phase brief
- About/Founder/Services entry pages as required
- Static content from translation resources (EN/AR)
- Hooks to live services where ready
- Direction-aware layouts (LTR/RTL) and theme-token styling

**Explicit non-goals:** Heavy motion; payment pages; inventing locale URL strategy without approval.

**Verification commands:**

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Expected report:** Public homepage renders required sections/CTAs in EN/AR with correct direction and both themes.

**Rollback considerations:** Page-scoped revert.

**Handoff notes:** Keep brand-first composition; avoid dashboard-like homepage. All static copy from translation resources. Founder pages remain a separate follow-up. Services catalog continues in Phase 13 (implemented). Contact form is documented in PUBLIC_CONTACT_PAGE.md.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark. Spot-check performance (image weight, no unnecessary heavy libs).

---

## Phase 12 — Authentication UI

**Objective:** Login/Register UI integrated with Auth API.

**Status:** Implemented (see [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md)).

**Files or modules involved:** `frontend/src/features/auth/`

**Prerequisites:** Phases 4 and 10.

**Implementation tasks:**

- Login/Register forms
- Session handling
- Safe redirect back to intended route (including future booking entry)

**Explicit non-goals:** Social login; MFA; password reset unless later approved.

**Verification commands:**

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Expected report:** Client can register/login from UI in both languages and themes; open redirects blocked.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Never store API provider secrets in frontend. Localize form labels and validation display. Forgot-password remains excluded.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 13 — Services UI

**Objective:** Services list/details UI from API.

**Status:** Implemented (see [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md)). Booking form remains Phase 14.

**Files or modules involved:** `frontend/src/features/services/`

**Prerequisites:** Phases 6 and 11.

**Implementation tasks:**

- Services page
- Service details page
- Book Consultation CTA gating (auth-aware links only)

**Explicit non-goals:** Checkout UI; booking form / `POST /bookings`.

**Verification commands:**

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Expected report:** Active services browsable; inactive hidden by API; localized UI chrome; empty catalog handled without fake data.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Price display must not imply online payment in V1. Booking creation is deferred to Phase 14.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 14 — Booking UI

**Objective:** Booking form flow with auth gate.

**Status:** Implemented (see [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md)). Admin booking UI remains deferred.

**Files or modules involved:** `frontend/src/features/bookings/`

**Prerequisites:** Phases 8 and 12–13.

**Implementation tasks:**

- Booking page/form
- Auth redirect behavior
- Success/pending confirmation UX
- Client list/details/cancel

**Explicit non-goals:** Payment step; calendar sync; admin booking UI.

**Verification commands:**

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Expected report:** Client can submit pending booking from UI in both languages and themes.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Mirror backend status vocabulary exactly; localize status labels for display.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 15 — Client Dashboard

**Objective:** Basic authenticated booking view.

**Status:** Client overview, bookings routes, and profile page implemented (see [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md), [CLIENT_PROFILE_UI.md](CLIENT_PROFILE_UI.md)).

**Files or modules involved:** `frontend/src/features/bookings/`, `frontend/src/features/profile/`, `frontend/src/features/client-dashboard/`

**Prerequisites:** Phase 14.

**Implementation tasks:**

- Dashboard layout (existing)
- List client bookings/statuses
- Modest overview with recent bookings preview
- Client profile name/phone update

**Explicit non-goals:** Invoice/payment history; password/email/avatar/account-delete.

**Verification commands:**

```bash
cd frontend
npm run build
```

**Expected report:** Authenticated client can view bookings overview, manage bookings, and update profile name/phone.

**Rollback considerations:** Feature-scoped revert.

**Handoff notes:** Do not invent analytics totals from incomplete pagination. Email remains read-only on profile.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 16 — Chatbot Foundation

**Objective:** Integration-ready chatbot scaffold only.

**Files or modules involved:** `backend/app/Features/Chatbot/`, `frontend/src/features/chatbot/`

**Prerequisites:** Phase 3 schema; Phase 10+ for placeholder UI.

**Implementation tasks:**

- Provider interface/contracts
- Conversation/message persistence endpoints foundation
- Placeholder widget UI supporting **English and Arabic** and **light/dark themes**
- Admin conversation read path
- Handoff docs update

**Explicit non-goals:** OpenAI/Gemini/Claude; prompt engineering; KB; vectors; streaming; usage billing; production AI quality guarantees.

**Verification commands:** Feature tests for storage endpoints + frontend build.

**Expected report:** Foundation ready for a future provider adapter; placeholder usable in EN/AR and both themes.

**Rollback considerations:** Disable chat routes/widget without affecting bookings.

**Handoff notes:** Secrets stay on backend; see FUTURE_CHATBOT_HANDOFF.md.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark.

---

## Phase 17 — Payment and Invoice Foundations

**Objective:** Ensure schema/docs foundations only; no business features.

**Files or modules involved:** migrations for `payments`/`invoices` (if not already), feature READMEs, handoff docs

**Prerequisites:** Phase 3 preferably already created tables.

**Implementation tasks:**

- Confirm tables exist and are unused by V1 APIs/UI
- Document future statuses/methods
- Explicitly omit controllers/routes/admin screens

**Explicit non-goals:** Gateway, webhooks, checkout, PDF, taxes, discounts, refunds, accounting.

**Verification commands:** Schema inspection; grep to ensure no payment/invoice business routes.

**Expected report:** Future-ready DB without V1 payment/invoice product surface.

**Rollback considerations:** Keep tables if already migrated; do not add app code.

**Handoff notes:** Requires approved provider specification before any implementation. If payment UI is ever added later, it **must** support English, Arabic, LTR, RTL, light, and dark themes.

---

## Full Product Review (stabilization gate)

**Status:** Completed. See [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md).

**Objective:** Review the shipped functional frontend, fix proven defects only, record the performance baseline, and confirm readiness for Phase 18 Motion only after baseline acceptance.

**Explicit non-goals:** Motion/3D; payments; invoices; chatbot; schema/API contract changes; redesign.

---

## Phase 18 — Motion and Interaction System

**Objective:** Add intentional motion after functional UI is stable **and** performance checks pass.

**Status:** Public advanced experience checkpoint (CSS 3D + shared motion hooks) and **Final Visual Polish** completed. **Public 3D Scroll Redesign completed** — CSS 3D sculpture + scroll-scrubbed logo draw with **GSAP homepage-only** (no WebGL) — see [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md), and [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md). Further WebGL / Three.js scenes remain deferred.

**Files or modules involved:** `frontend/src/shared/motion/`, public pages

**Prerequisites:** Phases 11–15 functionally stable; **Full Product Review** performance baseline completed ([FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md)).

**Implementation tasks:**

- Introduce approved motion approach only with clear value
- Apply intentional motions for presence/hierarchy (not noise)
- Lazy-load animation/3D libraries; never require WebGL for content access
- Provide reduced-motion and WebGL fallbacks
- Ensure motion works in LTR/RTL and light/dark
- Prefer transforms/opacity; clean up on unmount; skippable intros

**Explicit non-goals:** Motion before stable UI; decorative-only blocking motion; loading overlapping animation systems; global bundle of unused 3D libs.

**Verification commands:**

```bash
cd frontend
npm run build
```

Plus manual: reduced-motion, mobile simplified motion, theme/locale checks, before/after bundle notes.

**Expected report:** Motion enhances without blocking core flows or harming average-device usability.

**Rollback considerations:** Feature-flag or remove motion module.

**Handoff notes:** Checkpoint used shared CSS/IO motion only. Redesign adds homepage-isolated GSAP — see PUBLIC_3D_SCROLL_REDESIGN.md and PERFORMANCE_STRATEGY.md.

**UI acceptance checks:** English, Arabic, LTR, RTL, light, dark, reduced-motion.

---

## Phase 19 — Accessibility and Responsive QA

**Objective:** Verify responsive behavior and baseline accessibility across locales and themes.

**Files or modules involved:** Public pages, forms, dashboard

**Prerequisites:** Phases 11–15 (and 18 if motion added).

**Implementation tasks:**

- Mobile/desktop pass of key journeys
- Keyboard access for forms/nav
- Contrast/semantics spot checks in light and dark
- RTL and LTR layout checks
- Reduced-motion checks

**Explicit non-goals:** Full formal WCAG certification unless later required.

**Verification commands:** Manual QA checklist; frontend build.

**Expected report:** Critical journeys usable on mobile and desktop in EN/AR and both themes.

**Rollback considerations:** Fix-forward preferred.

**Handoff notes:** Keep checks practical; theme contrast and direction are mandatory.

---

## Phase 20 — Testing, Performance, and Security

**Objective:** Harden V1 before launch; consolidate continuous performance verification.

**Files or modules involved:** backend tests, frontend build, rate limits, caches

**Prerequisites:** Feature phases complete for launch candidate.

**Implementation tasks:**

- Expand feature/API tests including locale-aware message expectations where implemented
- Indexes/pagination/caching as needed (never incorrectly cache private user data)
- Rate limit login/contact/chat
- Production route/config/event/view cache prep when applicable
- Image optimization pass
- Review Core Web Vitals, Lighthouse on representative pages, JS bundle, image weight
- Network/CPU throttling, RTL/LTR, light/dark, reduced-motion checks
- Confirm no mandatory WebGL dependency for content

**Explicit non-goals:** Inventing guaranteed Lighthouse scores; advanced analytics; payment security productization beyond “do not expose”.

**Verification commands:**

```bash
cd backend
php artisan test
cd ../frontend
npm run build
```

**Expected report:** Launch candidate meets NFR checklist including localization, theme, and performance strategies.

**Rollback considerations:** Revert risky cache/rate-limit configs if they break local DX.

**Handoff notes:** HTTPS mandatory in production. See PERFORMANCE_STRATEGY.md.

---

## Phase 21 — Deployment and Handoff

**Objective:** Deploy and transfer runbooks.

**Files or modules involved:** env samples, README, ops notes

**Prerequisites:** Phase 20.

**Implementation tasks:**

- Production deploy
- Seed admin
- Verify critical flows on production
- Update FEATURE_STATUS and handoff docs

**Explicit non-goals:** Enabling payments/invoices/chatbot AI without approval.

**Verification commands:** Production smoke tests for register/login/book/contact/admin.

**Expected report:** V1 live; exclusions still honored.

**Rollback considerations:** Previous release artifact / DB backup restore plan.

**Handoff notes:** Re-state that Chatbot AI, Payments, and Invoices business features remain unimplemented.
