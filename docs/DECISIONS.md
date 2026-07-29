# Architecture Decision Records

Decisions for PR Per Hour Version 1. Filament is **recommended**, not installed.

---

## ADR-001 — React frontend separated from Laravel API

- **Status:** Accepted
- **Context:** PDF §5–§6 requires a React frontend and Laravel backend with clear separation.
- **Decision:** Keep `frontend/` (React + Vite + TypeScript) and `backend/` (Laravel REST API) as separate applications.
- **Consequences:** Independent deploy/build pipelines; CORS and API contracts required; no Blade-driven public UI as the primary V1 site.
- **Alternatives:** Monolithic Laravel + Blade; Inertia/Livewire-centric UI.
- **Future review trigger:** If team size/ops cost makes SPA separation unjustified.

## ADR-002 — All database access through Laravel

- **Status:** Accepted
- **Context:** PDF §6 states React must not connect directly to the database.
- **Decision:** MySQL is accessed only by Laravel (Eloquent/migrations/queries). React uses HTTP APIs only.
- **Consequences:** Stronger security boundary; all validation/authorization centralized.
- **Alternatives:** Direct Supabase-style client DB access (rejected).
- **Future review trigger:** None expected for V1.

## ADR-003 — Feature-based architecture

- **Status:** Accepted
- **Context:** Project foundation established feature folders on backend and frontend for modular ownership.
- **Decision:** Organize domain work under `backend/app/Features/*` and `frontend/src/features/*` with shared code only for cross-cutting utilities.
- **Consequences:** Clear ownership; easier scoped PRs; requires discipline against shared-folder dumping.
- **Alternatives:** Classic Laravel `app/Http` only layering without feature folders.
- **Future review trigger:** If feature folders become inconsistent with Filament resource layout.

## ADR-004 — Laravel REST API

- **Status:** Accepted
- **Context:** PDF specifies Laravel as REST API backend.
- **Decision:** Expose Version 1 business operations as JSON REST endpoints.
- **Consequences:** Explicit API versioning/contracts may be needed later; frontend is API-consumer only.
- **Alternatives:** GraphQL; RPC-style endpoints.
- **Future review trigger:** If clients require GraphQL aggregation.

## ADR-005 — MySQL for Version 1

- **Status:** Accepted
- **Context:** PDF §5.3 says MySQL is acceptable/simple for V1; PostgreSQL optional later.
- **Decision:** Use MySQL for Version 1.
- **Consequences:** Simple local/prod setup with Laragon/XAMPP-compatible tooling.
- **Alternatives:** PostgreSQL from day one.
- **Future review trigger:** Scalability or Postgres-specific features needed.

## ADR-006 — Simple role field for Version 1

- **Status:** Accepted
- **Context:** PDF §10 requires simple `role` on users; advanced permissions excluded.
- **Decision:** Use `users.role` with at least `admin` and `client`.
- **Consequences:** Fast authorization checks; limited granularity.
- **Alternatives:** Spatie Permission / full RBAC immediately.
- **Future review trigger:** Multiple staff roles with distinct permissions required.

## ADR-007 — Public registration creates clients only

- **Status:** Accepted
- **Context:** PDF §10.3 forbids admin creation via public signup; first admin via seeder/manual setup.
- **Decision:** Force `client` on public register; seed/create admin out-of-band.
- **Consequences:** Safer bootstrap; admin provisioning is an ops task.
- **Alternatives:** Invite-only client registration; admin self-signup with secret (rejected for V1).
- **Future review trigger:** Need for staff invite workflows.

## ADR-008 — Filament recommended for admin

- **Status:** Accepted (recommendation only)
- **Context:** PDF §5.4 recommends Filament; custom React admin is alternative.
- **Decision:** Prefer Filament for V1 admin speed unless stakeholders require custom React admin.
- **Consequences:** Faster admin delivery; Filament not installed until Phase 9 explicitly executes.
- **Alternatives:** Custom React admin dashboard.
- **Future review trigger:** Brand/UX requires fully custom admin UI.

## ADR-009 — Payments excluded from Version 1 implementation

- **Status:** Accepted
- **Context:** PDF §1, §12, §20.7 exclude payment business features while allowing schema readiness.
- **Decision:** No gateway, webhooks, checkout, payment APIs, or payment admin UI in V1. `payments` table may exist as schema only.
- **Consequences:** Booking statuses exclude `paid`; price fields are informational only.
- **Alternatives:** Implement Stripe/PayPal in V1 (rejected by PDF).
- **Future review trigger:** Approved provider specification and commercial go-ahead.

## ADR-010 — Invoices excluded from Version 1 implementation

- **Status:** Accepted
- **Context:** PDF §1, §13, §20.8 exclude invoice business features while allowing schema readiness.
- **Decision:** No invoice generation, PDF, frontend, or admin invoice screens in V1. `invoices` table may exist as schema only.
- **Consequences:** No billing documents in client/admin UX.
- **Alternatives:** Manual offline invoicing outside the system (process, not product feature).
- **Future review trigger:** Explicit approval to implement invoicing.

## ADR-011 — Chatbot provider isolated for future implementation

- **Status:** Accepted
- **Context:** PDF §14 includes a simple V1 chatbot; project ownership requires no production AI provider without approval. Secrets must never reach React.
- **Decision:** Ship chatbot as foundation (module, contracts, storage, placeholder UI). Isolate any future provider behind a backend interface. Do not integrate OpenAI/Gemini/Claude until approved.
- **Consequences:** Free-consultation assistant path is storage/UI-ready, not AI-complete.
- **Alternatives:** Hard-code a production vendor in V1 (rejected under current project rule).
- **Future review trigger:** Approved provider specification, budget, and privacy review.

## ADR-012 — Heavy motion only after functional stability

- **Status:** Accepted
- **Context:** Project delivery plan places motion after functional UI; PDF emphasizes clean MVP first.
- **Decision:** Do not implement heavy animation systems before public/auth/services/booking UI are stable (Phase 18).
- **Consequences:** Faster functional delivery; motion is additive polish.
- **Alternatives:** Motion-first design implementation (rejected for sequencing).
- **Future review trigger:** Marketing demands launch motion earlier with explicit approval.

## ADR-013 — Future-ready database without premature business implementation

- **Status:** Accepted
- **Context:** PDF repeatedly requires payments/invoices tables without implementing those modules.
- **Decision:** Include future-ready tables in migrations when domain schema is created; forbid controllers/routes/UI/business logic for those modules in V1.
- **Consequences:** Avoids later restructuring; risk of accidental feature creep must be guarded by docs/rules.
- **Alternatives:** Omit payment/invoice tables until needed (rejected by PDF).
- **Future review trigger:** Schema drift or unused-table operational concerns.

## ADR-014 — Localization is a first-class architectural requirement

- **Status:** Accepted
- **Context:** The product must serve English and Arabic audiences. Retrofitting i18n/RTL late causes hardcoded strings, broken layouts, and SEO debt.
- **Decision:** Treat bilingual EN/AR support with LTR/RTL, persistent language selection, translation resources, and localizable API/validation messages as a **first-class architectural requirement** from React Application Foundation onward — not a late patch.
- **Consequences:** Locale/theme foundations land in Phase 10; every UI phase includes EN/AR and direction checks; dynamic content needs an approved localization strategy before services UI ships.
- **Alternatives:** English-only V1 with Arabic later (rejected); admin-only localization first (rejected for public/client scope).
- **Future review trigger:** Approved locale routing strategy; dynamic content schema choice; translation library selection.

## ADR-015 — Theme architecture (light, dark, system)

- **Status:** Accepted
- **Context:** Public and client-facing UI must support light and dark experiences without flash or inaccessible contrast.
- **Decision:** Require light, dark, and system modes with persistent manual selection, shared design tokens, intentional dark design (not inversion), and no startup theme flash. Theme foundation is part of React Application Foundation.
- **Consequences:** Components consume tokens; logos/media need dual-theme readability; chatbot placeholder and future payment UI must support themes.
- **Alternatives:** Light-only V1 (rejected); CSS filter inversion for dark mode (rejected).
- **Future review trigger:** Theme library vs custom tokens decision; persistence mechanism.

## ADR-016 — Performance and motion performance as mandatory NFR

- **Status:** Accepted
- **Context:** PDF recommends performance practices; project elevates them to mandatory rules covering frontend, backend, assets, motion, mobile, and reduced-motion.
- **Decision:** Enforce route-level code splitting, optimized responsive images, lazy non-critical assets, reduced-motion, no mandatory WebGL, measurement before advanced motion, and continuous performance verification. Motion only after functional pages pass performance checks.
- **Consequences:** Heavy libraries require justification and lazy loading; overlapping animation systems are forbidden; budgets/scores are set later without inventing guarantees now.
- **Alternatives:** Defer all performance work to final phase only (rejected); ship WebGL-required hero (rejected).
- **Future review trigger:** Formal performance budgets; dependency approval for GSAP/Framer Motion/Three.js.

## ADR-017 — Client SQL schema is authoritative

- **Status:** Accepted
- **Context:** The client supplied `PR_Per_Hour_SQL.txt` as the exact database structure. Documentation previously discussed optional translation strategies that would alter that schema.
- **Decision:** Laravel migrations/models must match `PR_Per_Hour_SQL.txt` exactly. No translation tables, locale columns, or framework convenience columns (`email_verified_at`, `remember_token`, etc.) may be added to client domain tables without written client approval. Bilingual UI/API messages proceed without schema changes.
- **Consequences:** Catalog content remains English fields as supplied; i18n for static/API messages stays in translation files; schema parity tests guard against drift.
- **Alternatives:** Introduce translation tables immediately (rejected without client approval).
- **Future review trigger:** Written client approval for a schema change request.
