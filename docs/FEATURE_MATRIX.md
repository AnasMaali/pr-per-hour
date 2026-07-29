# Feature Matrix

Source: `PR_Per_Hour_Decu.pdf` + project foundation state.

Allowed statuses: `not_started` | `scaffolded` | `planned` | `future` | `excluded` | `backend implemented / frontend not_started`

Authentication backend is implemented; no full-stack business feature is marked wholly completed while frontend remains pending.

| Feature | Version | User Types | Public/Protected | Backend | Frontend | Admin | Database | Status | Dependencies | Explicit Exclusions | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public Website | V1 | Guest, Client | Public | Optional public APIs for services/contact | Homepage + services listing/details + **contact form implemented**; cinematic scroll redesign | Content mostly static in V1 | N/A for static sections | homepage + services + contact UI + **3D scroll redesign** implemented | Brand copy, assets | Payment/invoice pages | See PUBLIC_HOMEPAGE.md, PUBLIC_SERVICES_UI.md, PUBLIC_CONTACT_PAGE.md, PUBLIC_3D_SCROLL_REDESIGN.md |
| Authentication | V1 | Guest→Client, Admin | Public auth + protected session | Register/login/logout/me/profile (backend done) | Login/Register/Unauthorized + Client Profile UI implemented | Seeded/manual admin only | `users` | backend + frontend auth/profile UI implemented | Users schema | Password reset, social, MFA (not in PDF V1) | Public signup creates clients only; Sanctum tokens; see FRONTEND_AUTH_UI.md and CLIENT_PROFILE_UI.md |
| Users | V1 | Admin, Client | Protected | User management APIs / Filament | Client profile name/phone update | Manage users | `users` | client profile UI implemented; admin user APIs not_started | Auth | Advanced RBAC | Simple `role` field |
| Service Categories | V1 | Guest, Admin | Public read / Admin write | Public + admin category endpoints (backend done) | Public category filter on Services listing; **admin categories management UI implemented** | CRUD, activate/deactivate via API + admin UI | `service_categories` | backend + admin UI implemented / public filter via Services | None | Translation tables; Filament; browsable trash list (API excludes soft-deleted) | Seed 3 initial categories; see ADMIN_SERVICE_CATEGORIES_UI.md |
| Services | V1 | Guest, Client, Admin | Public read / Admin write | Public + admin service endpoints (backend done) | List + details UI implemented; **admin services management UI implemented**; booking form under Bookings | CRUD, activate/deactivate via API + admin UI | `services` | backend + public UI + admin UI implemented | Service Categories | Online payment | Price may exist without checkout; see PUBLIC_SERVICES_UI.md and ADMIN_SERVICES_UI.md |
| Bookings | V1 | Client, Admin | Protected | Client create/list/details/cancel + admin manage (backend done) | Client booking UI implemented; **admin bookings list/details/status/meeting-link/notes UI implemented** | List/status/meeting-link/notes via API + admin UI | `bookings` | backend + client UI + admin UI implemented | Auth, Services | `paid` status; payments; calendar sync; reschedule | See CLIENT_BOOKINGS_UI.md, ADMIN_BOOKINGS_UI.md |
| Client Dashboard | V1 | Client | Protected | Client booking reads | Overview + bookings + profile | N/A | `bookings` | client overview + profile implemented | Auth, Bookings | Payments/invoices widgets | See CLIENT_BOOKINGS_UI.md and CLIENT_PROFILE_UI.md |
| Contact Messages | V1 | Guest, Admin | Public submit / Admin manage | Public POST + admin list/show/status/delete/restore (backend done) | **Public contact form implemented**; **admin contact messages list/details/status/soft-delete UI implemented** | List/view/status/soft-delete via API + admin UI | `contact_messages` | backend + public form + admin UI implemented | None | Chatbot merge; email send; Filament; restore UI | Statuses: new/read/replied/closed; no email; see PUBLIC_CONTACT_PAGE.md, ADMIN_CONTACT_MESSAGES_UI.md |
| Chatbot Foundation | V1 prep | Guest, Client, Admin | Public widget / Admin review | Storage, contracts, placeholder responses path | Placeholder widget (EN/AR + themes) | View conversations | `chat_conversations`, `chat_messages` | scaffolded | Optional Auth; Localization; Theme | OpenAI/Gemini/Claude, KB, vectors, streaming, billing | AI provider not implemented |
| Payments Foundation | Future schema / excluded business | N/A in V1 UX | N/A | Migration/table + model only | None in V1; future UI must support EN/AR + themes | None in V1 | `payments` | scaffolded | Bookings schema | Gateway, webhooks, checkout, admin UI | Exact client SQL parity; feature excluded |
| Invoices Foundation | Future schema / excluded business | N/A in V1 UX | N/A | Migration/table + model only | None in V1 | None in V1 | `invoices` | scaffolded | Bookings schema | PDF, generation, admin UI, taxes | Exact client SQL parity; feature excluded |
| Admin Dashboard | V1 | Admin | Protected | Admin APIs (backend done) | Layout + overview + **categories + services + bookings + contact messages UI** | Users, categories, services, bookings, chat, contact | Related V1 tables | foundation + categories/services/bookings/contact UI implemented / users+chat not_started | Auth + domain modules | Payments/invoices admin | See ADMIN_DASHBOARD_FOUNDATION.md, ADMIN_SERVICE_CATEGORIES_UI.md, ADMIN_SERVICES_UI.md, ADMIN_BOOKINGS_UI.md, ADMIN_CONTACT_MESSAGES_UI.md; Filament not installed |
| Localization (EN/AR) | V1 | Guest, Client | Public + client | Locale-aware messages; dynamic content strategy | Language switch, LTR/RTL, translation resources (foundation done) | Optional | TBD dynamic content schema | frontend foundation implemented | React foundation | Hardcoded UI strings | See LOCALIZATION_STRATEGY.md / FRONTEND_LOCALIZATION.md |
| Theme System | V1 | Guest, Client | Public + client | N/A | Light/dark/system, tokens, no flash (foundation done) | Optional | N/A | frontend foundation implemented | React foundation | Scattered hardcoded theme colors | See THEME_STRATEGY.md / FRONTEND_APPEARANCE.md |
| Performance System | V1 | All | Cross-cutting | Pagination, indexes, safe cache, queues | Code splitting, assets, reduced-motion | Efficient admin lists | Indexes per query paths | planned | All UI/API phases | Global heavy animation bundles | See PERFORMANCE_STRATEGY.md |
| Motion System | V1 late | Guest | Public | N/A | Public CSS 3D + scroll-scrubbed logo draw (GSAP homepage-only) + public/auth visual framing | N/A | N/A | **public 3D scroll redesign complete; WebGL not used** | Stable public UI + perf baseline | Heavy motion before functional UI; mandatory WebGL | See PUBLIC_3D_SCROLL_REDESIGN.md, ADVANCED_PUBLIC_EXPERIENCE.md, FINAL_VISUAL_POLISH.md |
| Emails | V1 supportive | Client, Admin | System | Queued mail recommended | N/A | N/A | N/A | planned | Auth/Bookings/Contact as needed | Marketing automation | PDF recommends queues for emails |
| Deployment | V1 | Ops | N/A | Production Laravel config/cache | Production frontend build | N/A | MySQL | planned | Completed V1 features | — | HTTPS, caches, testing first |

## Status interpretation

| Status | Meaning |
| --- | --- |
| scaffolded | Feature folder/README exists; no business implementation |
| planned | Required for V1 delivery but implementation not started |
| future | Deferred beyond current V1 business delivery or late-phase polish |
| excluded | Must not be delivered as business functionality in V1 |
| not_started | Recognized need with no scaffold yet |

## Related docs

- [PROJECT_SCOPE.md](PROJECT_SCOPE.md)
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- [FEATURE_STATUS.md](FEATURE_STATUS.md)
- [REQUIREMENTS_TRACEABILITY.md](REQUIREMENTS_TRACEABILITY.md)
- [CONTACT_MESSAGES_API.md](CONTACT_MESSAGES_API.md)
- [BOOKINGS_API.md](BOOKINGS_API.md)
- [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md)
- [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md)
- [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md)
- [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md)
- [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md)
- [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md)
- [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md)
- [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md)
- [THEME_STRATEGY.md](THEME_STRATEGY.md)
- [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md)
