# Requirements Traceability Matrix

Source document: `PR_Per_Hour_Decu.pdf` (Version 1.1, July 9, 2026), 50 pages.

Classification:

- **Mandatory** — explicit V1 decision
- **Recommended** — PDF suggestion
- **Future** — deferred
- **Excluded** — must not implement as V1 business functionality

Status values: `documented` (not implemented), `backend implemented`, `excluded / not_started`, and similar split labels when only part of a requirement is delivered.

| Requirement ID | Requirement | Source Section in PDF | Mandatory/Recommended/Future | Version | Feature Owner | Planned Phase | Verification Method | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUS-001 | PR Per Hour is a strategic communication & PR consultancy | §3 | Mandatory | V1 | Public Website | 11 | Content review | documented | Business identity |
| BUS-002 | Website converts visitors; CTA Request a Consultation | §4 | Mandatory | V1 | Public Website | 11 | UI review | documented | Primary conversion |
| BUS-003 | Visitor journey: understand → explore → trust → consult → chatbot → account → book | §4 | Mandatory | V1 | Cross-cutting | 11–16 | Journey QA | documented | Product goal |
| BUS-004 | Build clean MVP; keep DB future-ready | §1, §28 | Mandatory | V1 | Architecture | 1–3 | Architecture review | documented | Core rule |
| PUB-001 | Homepage includes 9 required sections | §8.1 | Mandatory | V1 | Public Website | 11 | UI checklist | homepage shell + cinematic scroll redesign | Narrative order: Hero → Logo draw → About → Trust → Why → Capability → Services → Process → CTA; see PUBLIC_3D_SCROLL_REDESIGN.md |
| PUB-002 | Hero includes logo, name, description, slogan, two buttons | §8.2 | Mandatory | V1 | Public Website | 11 | UI checklist | homepage implemented + redesign | Brand-first hero + CSS 3D sculpture |
| PUB-003 | About Us communicates reputation/clarity/results | §8.3 | Mandatory | V1 | Public Website | 11 | Content review | homepage implemented | Software delivery positioning |
| PUB-004 | Expertise shows 3 service cards with Explore CTA | §8.4 | Mandatory | V1 | Public Website | 11 | UI checklist | homepage services preview implemented | Live API preview; full catalog in PUBLIC_SERVICES_UI |
| PUB-005 | Approach stages Discover→Strategize→Deliver→Measure | §8.5 | Mandatory | V1 | Public Website | 11 | UI checklist | homepage process section implemented | Discovery→Launch & support wording |
| PUB-006 | Trusted Organizations logo grid without long descriptions | §8.6 | Mandatory | V1 | Public Website | 11 | UI checklist | adapted | Text trust indicators used; root partner images not claimed as clients |
| PUB-007 | Founder section with title, bio, key points, View Full Profile | §8.7 | Mandatory | V1 | Public Website | 11 | UI checklist | deferred | Not invented without approved founder content |
| PUB-008 | Why PR Per Hour four value cards | §8.8 | Mandatory | V1 | Public Website | 11 | UI checklist | homepage implemented | Six differentiators |
| PUB-009 | CTA section suggested copy + Request a Consultation | §8.9 | Recommended copy / Mandatory CTA intent | V1 | Public Website | 11 | UI checklist | homepage implemented | Services/contact CTAs |
| PUB-010 | Contact section form + email + phone + LinkedIn + optional map | §8.10 | Mandatory | V1 | Contact Messages | 7, 11 | UI + API test | backend API + public contact form implemented | Map/LinkedIn optional; email send not implemented |
| PUB-011 | Frontend pages: Home, About, Services, Details, Booking, Auth, Contact, Founder, Chat widget, client view | §21 | Mandatory | V1 | Frontend | 11–16 | Route checklist | documented | No payment pages |
| PUB-012 | Do not build payment/invoice/PDF/payment-history pages | §21 | Excluded | V1 | Payments/Invoices | 17 | Grep/UI review | documented | Hard exclusion |
| AUTH-001 | Simple role field on users (admin/client) | §10 | Mandatory | V1 | Auth/Users | 3–4 | Schema + tests | backend implemented | No advanced RBAC |
| AUTH-002 | Public registration creates clients only | §10.3 | Mandatory | V1 | Auth | 4, 12 | API test | backend + register UI implemented | |
| AUTH-003 | Admin created manually or by seeder | §10.3 | Mandatory | V1 | Auth | 4 | Seeder/manual check | backend implemented | |
| AUTH-004 | Auth endpoints register/login/logout/me | §20.1 | Recommended contract | V1 | Auth | 4, 12, 15 | API tests | backend implemented; frontend Login/Register + Client Profile UI implemented | Profile PATCH also added; forgot-password excluded |
| AUTH-005 | Sanctum for auth if needed | §5.2 | Recommended | V1 | Auth | 4 | Package/config review | backend implemented | Token auth live |
| AUTH-006 | Password reset / email verification / social / MFA | — | Future | Future | Auth | — | N/A | excluded / not_started | Not required by PDF V1 |
| SRV-001 | Initial categories: Strategic Communication; PR Campaigns; Training & Capacity Building | §9.1, SQL seed | Mandatory | V1 | Service Categories | 3, 5 | Seed/API test | backend seeder + API ready | |
| SRV-002 | Services manageable and bookable in V1 | §9.2 | Mandatory | V1 | Services/Bookings | 6, 8, 13, 14 | API/UI test | services + bookings backend implemented; public listing/details + client booking UI + admin bookings UI implemented | |
| SRV-003 | Price may exist without online payment | §9.2, §19.3 | Mandatory | V1 | Services | 6 | Schema + no checkout | backend implemented | |
| SRV-004 | Service fields include duration, price, currency, is_active | §19.3 | Mandatory | V1 | Services | 3, 6 | Schema review | backend implemented | |
| SRV-005 | Public/admin service category & service endpoints | §20.2–20.3 | Recommended contract | V1 | Services | 5–6, 13 | API tests | category + services backend implemented; public UI consumes list/detail/categories | |
| BKG-001 | Booking requires authentication | §10.2 | Mandatory | V1 | Bookings | 8, 14 | Auth gate test | backend + client booking UI implemented | |
| BKG-002 | Booking flow ends with pending + admin review | §10.2, §11 | Mandatory | V1 | Bookings | 8, 14 | Flow test | backend + client create UI implemented | create always pending; admin status transitions |
| BKG-003 | Booking fields: user, service, date, start/end, status, notes, meeting_link | §11, §19.4 | Mandatory | V1 | Bookings | 3, 8 | Schema/API | backend implemented | |
| BKG-004 | Statuses pending/confirmed/completed/cancelled; no paid | §11.1 | Mandatory | V1 | Bookings | 8 | Enum/validation tests | backend implemented | PDF says recommended; project adopts as V1 set |
| BKG-005 | Booking API endpoints including admin status update | §20.4 | Recommended contract | V1 | Bookings | 8 | API tests | backend implemented | Also meeting-link + notes; no delete/payment |
| CNT-001 | Contact form stores name, email, phone, organization, message, status | §15, §19.9 | Mandatory | V1 | Contact Messages | 7 | API test | backend + public form implemented | phone/org nullable; status always new on create |
| CNT-002 | Contact statuses new/read/replied/closed | §15 | Recommended | V1 | Contact Messages | 7 | Validation tests | backend implemented | Adopted for V1 |
| CNT-003 | Contact API public POST + admin list/show/status | §20.6 | Recommended contract | V1 | Contact Messages | 7 | API tests | backend + public form + admin UI implemented | Also soft delete + restore; no email/reply; restore UI not exposed |
| CHT-001 | Basic chatbot conversation storage | §1, §14 | Mandatory foundation | V1 prep | Chatbot | 16 | Schema/API | documented | Storage yes; AI provider no under project rule |
| CHT-002 | V1 chatbot may use predefined or basic AI answers | §14.1 | Recommended in PDF / constrained by project rule | V1 prep | Chatbot | 16 | Handoff review | documented | Ambiguity: see DECISIONS |
| CHT-003 | Admin can view conversations | §14.1, §26 | Mandatory if foundation enabled | V1 | Chatbot/Admin | 9, 16 | Admin QA | documented | |
| CHT-004 | Chat API conversation/message + admin endpoints | §20.5 | Recommended contract | V1 prep | Chatbot | 16 | API tests | documented | |
| CHT-005 | Advanced AI, KB, lead scoring, admin takeover | §14.2 | Future | Future | Chatbot | — | N/A | documented | Excluded from advanced V1 AI |
| CHT-006 | No OpenAI/Gemini/Claude production integration without approved spec | Project rule | Excluded until approved | Future | Chatbot | 16 | Grep/deps review | documented | Stricter than PDF wording |
| PAY-001 | Include payments table in V1 schema only | §1, §12, §19.5 | Mandatory schema / Excluded business | V1 schema | Payments | 3, 17 | Migration review | documented | |
| PAY-002 | Do not implement gateway/pages/webhooks/admin payments | §12, §20.7 | Excluded | V1 | Payments | 17 | Grep/route review | documented | |
| PAY-003 | Future payment statuses and methods | §12.1–12.2 | Future | Future | Payments | — | N/A | documented | |
| INV-001 | Include invoices table in V1 schema only | §1, §13, §19.6 | Mandatory schema / Excluded business | V1 schema | Invoices | 3, 17 | Migration review | documented | |
| INV-002 | Do not implement generation/PDF/frontend/admin invoices | §13, §20.8 | Excluded | V1 | Invoices | 17 | Grep/route review | documented | |
| INV-003 | Future invoice statuses and improvements | §13.1–13.2 | Future | Future | Invoices | — | N/A | documented | |
| ADM-001 | Admin manages users, categories, services, bookings, chat, contact | §26 | Mandatory | V1 | Admin Dashboard | 9 | Admin QA | foundation overview + categories/services/bookings/contact UI implemented; users/chat CRUD not_started | No payments/invoices |
| ADM-002 | Filament recommended for admin | §5.4 | Recommended | V1 | Admin Dashboard | 9 | Decision review | documented | Not installed |
| ADM-003 | Paginated lists, search/filter, status updates, activate/deactivate | §26.1 | Mandatory | V1 | Admin Dashboard | 9 | Admin QA | categories + services + bookings + contact messages UI implemented; soft-deleted contact restore UI not exposed | Soft-deleted rows not listable |
| ADM-004 | No payment/invoice/refund/tax/discount admin screens | §26 | Excluded | V1 | Admin Dashboard | 9 | UI review | documented | |
| NFR-001 | React must not connect directly to DB; all via Laravel API | §6 | Mandatory | V1 | Architecture | 2, 10 | Architecture review | documented | |
| NFR-002 | MySQL acceptable for V1 | §5.3 | Recommended | V1 | Database | 3 | Env review | documented | Postgres future option |
| NFR-003 | Frontend performance practices (lazy load, images, cache, pagination) | §22.1 + project update | Mandatory (elevated) | V1 | Frontend | 10, 20 | Perf checklist | documented | See PERFORMANCE_STRATEGY.md |
| NFR-004 | Backend performance practices (indexes, queues, caches) | §22.2–22.3 + project update | Mandatory (elevated) | V1 | Backend | 3, 20 | Perf checklist | documented | See PERFORMANCE_STRATEGY.md |
| NFR-005 | Security: hash passwords, Form Requests, middleware, HTTPS, env secrets, rate limits | §23 | Mandatory core / Recommended rate limits | V1 | Security | 4, 20 | Security checklist | documented | |
| NFR-006 | Keep controllers clean; business logic in services; API Resources; validation | §27 | Recommended / project mandatory style | V1 | Architecture | All coding phases | Code review | documented | Aligns with feature architecture |
| NFR-007 | Future expansion examples without destroying structure | §24 | Future | Future | Architecture | — | N/A | documented | Scalability notes |
| LOC-001 | Full public and client-facing support for English and Arabic | Project update | Mandatory | V1 | Localization | 10–16 | UI checklist EN/AR | frontend foundation implemented | Admin optional |
| LOC-002 | English LTR and Arabic RTL layouts | Project update | Mandatory | V1 | Localization | 10–16 | Direction QA | frontend foundation implemented | Logical CSS preferred |
| LOC-003 | User can switch language from the UI | Project update | Mandatory | V1 | Localization | 10 | UI test | frontend foundation implemented | |
| LOC-004 | Selected language persists between visits | Project update | Mandatory | V1 | Localization | 10 | Reload persistence test | frontend foundation implemented | localStorage `prph.locale` |
| LOC-005 | May detect browser language; English is default fallback | Project update | Mandatory | V1 | Localization | 10 | First-visit test | frontend foundation implemented | |
| LOC-006 | All user-facing static text from translation resources; no hardcoded visible strings | Project update | Mandatory | V1 | Localization | 10–16 | Code review / i18n lint | frontend UI implemented; Full Product Review key parity checked | See FRONTEND_LOCALIZATION.md |
| LOC-007 | Validation and API-facing user messages must be localizable | Project update | Mandatory | V1 | Localization / API | 2, 4–8 | API message review | documented | |
| LOC-008 | Dynamic services/categories require approved localization strategy | Project update | Mandatory | V1 | Services | 3, 6, 13 | Schema + UI review | documented | No DB translation tables without client approval; EN fields only in current SQL |
| LOC-009 | Layouts, icons, arrows, spacing, animations work in RTL and LTR | Project update | Mandatory | V1 | Localization / Motion | 10–18 | Bidirectional QA | documented | |
| LOC-010 | SEO metadata supports both languages; routing strategy documented later | Project update | Mandatory | V1 | Localization / SEO | 10–11, 21 | SEO checklist | documented | Do not choose routing now |
| LOC-011 | Chatbot placeholder supports both languages | Project update | Mandatory | V1 | Chatbot | 16 | Widget QA | documented | |
| LOC-012 | Future payment UI must support both languages if implemented | Project update | Mandatory when UI exists | Future | Payments | 17+ | UI QA | documented | V1 business excluded |
| THM-001 | Support light mode, dark mode, and system preference | Project update | Mandatory | V1 | Theme | 10–16 | Theme QA | frontend foundation implemented | |
| THM-002 | System preference on first visit unless saved preference exists | Project update | Mandatory | V1 | Theme | 10 | First-visit test | frontend foundation implemented | |
| THM-003 | Manual theme selection persists | Project update | Mandatory | V1 | Theme | 10 | Reload persistence test | frontend foundation implemented | localStorage `prph.theme` |
| THM-004 | No visible theme flash during startup | Project update | Mandatory | V1 | Theme | 10 | Cold-start visual check | frontend foundation implemented | Inline bootstrap in `index.html` |
| THM-005 | Design tokens support both themes; no scattered hardcoded theme colors | Project update | Mandatory | V1 | Theme | 10–16 | Code review | frontend foundation implemented | See FRONTEND_APPEARANCE.md |
| THM-006 | Logos/media readable; focus/contrast/forms/overlays/loading/errors work in both modes | Project update | Mandatory | V1 | Theme | 10–19 | A11y + visual QA | frontend foundation implemented | Intentional dark design |
| THM-007 | Theme support must be accessible | Project update | Mandatory | V1 | Theme | 19 | A11y checklist | frontend foundation implemented | |
| THM-008 | Motion/3D remain performant and readable in both themes | Project update | Mandatory | V1 | Theme / Motion | 18–20 | Perf + visual QA | public 3D scroll redesign (no WebGL) | See PUBLIC_3D_SCROLL_REDESIGN.md; tokens include --shadow-depth / --color-volume |
| THM-009 | Chatbot placeholder supports both themes | Project update | Mandatory | V1 | Chatbot | 16 | Widget QA | documented | |
| THM-010 | Future payment UI must support both themes if implemented | Project update | Mandatory when UI exists | Future | Payments | 17+ | UI QA | documented | V1 business excluded |
| PRF-001 | Route-level code splitting | Project update | Mandatory | V1 | Performance | 10–15 | Bundle analysis | frontend foundation implemented | Lazy route modules |
| PRF-002 | Lazy load below-the-fold sections and non-critical media | Project update | Mandatory | V1 | Performance | 11–18 | Network panel review | documented | |
| PRF-003 | Load animation/3D libraries only where required; justify heavy deps | Project update | Mandatory | V1 | Performance | 18 | Bundle + PR justification | GSAP homepage-only (~112 KB / ~44 KB gzip) | No WebGL; see PUBLIC_3D_SCROLL_REDESIGN.md, FRONTEND_PERFORMANCE.md |
| PRF-004 | Prefer CSS for simple interactions | Project update | Mandatory | V1 | Performance | 11–18 | Code review | documented | |
| PRF-005 | Optimized responsive images (WebP/AVIF), explicit dimensions, lazy non-critical | Project update | Mandatory | V1 | Performance | 11, 20 | Image weight review | documented | |
| PRF-006 | Preload only critical fonts/assets; reduce font variants | Project update | Mandatory | V1 | Performance | 10–11 | Network review | documented | |
| PRF-007 | Respect prefers-reduced-motion; pause offscreen animations; mobile simplified motion | Project update | Mandatory | V1 | Performance / Motion | 18–19 | Reduced-motion QA | public motion + redesign (CSS 3D + homepage GSAP; no WebGL) | See PUBLIC_3D_SCROLL_REDESIGN.md, ADVANCED_PUBLIC_EXPERIENCE.md, FINAL_VISUAL_POLISH.md |
| PRF-008 | No mandatory WebGL; lazy init 3D; static/lightweight fallback | Project update | Mandatory | V1 | Performance / Motion | 18 | Fallback QA | **no WebGL used**; CSS/SVG depth + reduced-motion static mark | See PUBLIC_3D_SCROLL_REDESIGN.md |
| PRF-009 | Decorative motion removable; skippable intros; never block navigation | Project update | Mandatory | V1 | Motion | 18 | Interaction QA | documented | |
| PRF-010 | Prefer transforms/opacity; avoid layout thrashing; clean up on unmount; limit concurrent animations | Project update | Mandatory | V1 | Motion | 18 | Code review | documented | |
| PRF-011 | Backend: pagination, prevent N+1, selective columns, indexes, safe caching, queues, rate limits, API Resources | Project update | Mandatory | V1 | Performance / API | 2–9, 20 | API/perf review | documented | Elevates prior PDF recommendations |
| PRF-012 | Never cache private user data incorrectly; production caches when applicable | Project update | Mandatory | V1 | Performance / Security | 20–21 | Cache boundary review | documented | |
| PRF-013 | Measure before/after heavy motion; functional stability before advanced animation | Project update | Mandatory | V1 | Performance | 18, 20 | Before/after notes | redesign before/after recorded | See PUBLIC_3D_SCROLL_REDESIGN.md, FRONTEND_PERFORMANCE.md |
| PRF-014 | Future verification: CWV, Lighthouse, JS bundle, image weight, network/CPU throttle, RTL/LTR, themes, reduced-motion | Project update | Mandatory process | V1 | Performance | 11–20 | Perf test plan | documented | Budgets set later |
| PRF-015 | Visual ambition must not make site unusable on average devices; a11y/perf fallbacks mandatory | Project update | Mandatory | V1 | Performance | 18–20 | Mobile + throttle QA | documented | |

## Requirement counts by category

| Prefix | Count |
| --- | --- |
| BUS | 4 |
| PUB | 12 |
| AUTH | 6 |
| SRV | 5 |
| BKG | 5 |
| CNT | 3 |
| CHT | 6 |
| PAY | 3 |
| INV | 3 |
| ADM | 4 |
| NFR | 7 |
| LOC | 12 |
| THM | 10 |
| PRF | 15 |
| **Total** | **95** |
