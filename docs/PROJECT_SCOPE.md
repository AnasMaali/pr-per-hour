# PR Per Hour — Project Scope

Source: `PR_Per_Hour_Decu.pdf` (Version 1.1, July 9, 2026), normalized for development.

Status legend used in this document:

- **Mandatory** — explicit Version 1 decision in the handoff PDF or confirmed project rule
- **Recommended** — suggested approach in the PDF; not a hard lock unless adopted in `DECISIONS.md`
- **Future** — deferred beyond Version 1 business delivery
- **Implementation status** — current codebase state (scaffold / requirements documented / not started)

---

## 1. Business Overview

**What PR Per Hour is**  
PR Per Hour is a strategic communication and public relations consultancy.

**Consultancy type**  
Strategic communication and public relations consultancy serving organizations that need reputation, clarity, and measurable communication outcomes.

**Business focus** (from PDF §3):

- Strategic communication
- Public relations campaigns
- Training and capacity building
- Strategic consulting
- Professional communication support

**Website primary business purpose**  
Present a professional, premium, corporate, trusted consulting identity, and operate as a business system for service presentation, consultation requests, client registration, booking, contact intake, chatbot conversation storage, and admin management — with future-ready payment and invoice schema only.

**Main conversion goal**  
Convert visitors into potential clients. Primary call to action: **Request a Consultation**.

---

## 2. Product Goal

Intended visitor journey (PDF §4):

1. Understand what PR Per Hour does
2. Explore the main areas of expertise
3. Build trust through approach, founder, and partner organizations
4. Request a consultation
5. Use the initial consultation assistant (chatbot foundation / free initial consultation path)
6. Create an account when ready to book
7. Book a consultation or request a service

---

## 3. Version 1 Included Scope

Active Version 1 features from PDF §1 and §7.1. Current implementation status for all items below: **scaffold created; requirements documented; implementation not started**.

### 3.1 Public Website

| Field | Value |
| --- | --- |
| Purpose | Professional company presentation and conversion |
| User type | Guest (primary), Client |
| Access | Public |
| Backend | Content may be mostly static initially; services/contact via API when implemented |
| Frontend | Home and related public pages/sections |
| Admin | Optional content management later; V1 may use static/copy-managed content plus managed services |
| Status | Scaffolded folders only; UI not implemented |

### 3.2 Authentication

| Field | Value |
| --- | --- |
| Purpose | Register/login so clients can book |
| User type | Client; Admin (seeded/manual) |
| Access | Public register/login; protected session endpoints |
| Backend | Register, login, logout, current user (`/api/me`); Sanctum recommended if needed |
| Frontend | Login and Register pages |
| Admin | First admin created manually or by seeder — not via public registration |
| Status | Feature scaffold only; auth not implemented |

### 3.3 Users

| Field | Value |
| --- | --- |
| Purpose | Store admins and clients with simple `role` field |
| User type | Admin, Client |
| Access | Protected (self profile / admin management) |
| Backend | User model fields per schema; admin user management |
| Frontend | Client-facing account context; no public admin signup |
| Admin | Manage users |
| Status | Scaffold only |

### 3.4 Service Categories

| Field | Value |
| --- | --- |
| Purpose | Organize services into browseable categories |
| User type | Guest (read), Admin (manage) |
| Access | Public read; admin write |
| Backend | CRUD for admin; public list/detail by slug |
| Frontend | Expertise/services browsing |
| Admin | Create/update/delete; activate/deactivate |
| Status | Scaffold only |

Initial categories (mandatory seed content from PDF):

1. Strategic Communication
2. Public Relations Campaigns
3. Training & Capacity Building

### 3.5 Services

| Field | Value |
| --- | --- |
| Purpose | Present and book consultancy offerings |
| User type | Guest (read), Client (book), Admin (manage) |
| Access | Public read of active services; admin write |
| Backend | Service CRUD; active filtering; price/currency/duration fields |
| Frontend | Services list, service details, booking entry points |
| Admin | Manage services; activate/deactivate |
| Status | Scaffold only |

**Mandatory clarification:** A `price` field may exist in the database while **online payment remains disabled** in Version 1.

### 3.6 Bookings

| Field | Value |
| --- | --- |
| Purpose | Client consultation/service booking requests |
| User type | Client, Admin |
| Access | Protected |
| Backend | Create/list/update bookings; admin status updates |
| Frontend | Booking form; client booking view |
| Admin | Review bookings; update status; meeting link/notes |
| Status | Scaffold only |

### 3.7 Contact Messages

| Field | Value |
| --- | --- |
| Purpose | Capture inbound contact form submissions |
| User type | Guest (submit), Admin (manage) |
| Access | Public submit; admin read/update |
| Backend | Store messages; status workflow |
| Frontend | Contact section/page form |
| Admin | List, view, update status |
| Status | Scaffold only |

### 3.8 Chatbot Foundation

| Field | Value |
| --- | --- |
| Purpose | Free initial consultation assistant boundary; store conversations/messages |
| User type | Guest, Client, Admin (view) |
| Access | Public widget interaction; admin conversation review |
| Backend | Conversation/message storage; contracts/DTOs; provider interface placeholder |
| Frontend | Placeholder chatbot widget UI (no production AI provider) |
| Admin | View conversations; update conversation status |
| Status | Scaffold only; AI provider **not** implemented |

### 3.9 Admin Dashboard

| Field | Value |
| --- | --- |
| Purpose | Manage active Version 1 modules |
| User type | Admin |
| Access | Protected admin |
| Backend | Admin APIs and/or Filament resources (**Filament recommended, not installed**) |
| Frontend | Only if custom React admin is chosen instead of Filament |
| Admin | Users, categories, services, bookings, chatbot conversations, contact messages |
| Status | Not started (recommendation documented) |

### 3.10 Future-Ready Database Preparation

| Field | Value |
| --- | --- |
| Purpose | Include `payments` and `invoices` tables in schema without business features |
| User type | N/A for V1 product flows |
| Access | No public/admin payment or invoice screens in V1 |
| Backend | Migrations/tables only when domain modeling phase runs |
| Frontend | None for payments/invoices in V1 |
| Admin | No payment/invoice management screens in V1 |
| Status | Planned schema; not migrated yet in this documentation phase |

### 3.11 Client Dashboard

| Field | Value |
| --- | --- |
| Purpose | Basic authenticated client booking view |
| User type | Client |
| Access | Protected |
| Backend | Client booking list/detail endpoints |
| Frontend | Basic client booking view / dashboard |
| Admin | N/A |
| Status | Frontend feature scaffold only |

### 3.12 Localization (English + Arabic)

| Field | Value |
| --- | --- |
| Purpose | Full bilingual public and client-facing experience |
| User type | Guest, Client (Admin optional later) |
| Access | Public + client-facing mandatory |
| Backend | Locale-aware API messages; dynamic content localization strategy |
| Frontend | EN/AR switch, LTR/RTL, translation resources, persistence |
| Admin | Optional unless later approved |
| Status | Requirements documented; not implemented |

See [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md).

### 3.13 Theme system (light / dark / system)

| Field | Value |
| --- | --- |
| Purpose | Accessible light and dark experiences with system preference |
| User type | Guest, Client |
| Access | Public + client-facing |
| Backend | N/A (presentation concern) |
| Frontend | Tokens, persistence, no startup flash |
| Admin | Optional unless later approved |
| Status | Requirements documented; not implemented |

See [THEME_STRATEGY.md](THEME_STRATEGY.md).

### 3.14 Performance and motion performance

| Field | Value |
| --- | --- |
| Purpose | Mandatory performance, loading, and motion rules |
| User type | All visitors |
| Access | Cross-cutting |
| Backend | Pagination, indexes, caching boundaries, queues, rate limits |
| Frontend | Code splitting, asset optimization, reduced-motion, lazy 3D |
| Admin | Paginated lists and efficient queries |
| Status | Requirements documented; not implemented |

See [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md).

---

## 4. Explicit Version 1 Exclusions

The following are **excluded from Version 1 business implementation** (PDF §1, §7.2, §12, §13, §26):

- No online payment
- No payment gateway
- No payment webhooks
- No checkout page
- No payment admin interface
- No payment API routes (listed as future only)
- No invoice generation
- No PDF invoices
- No invoice frontend
- No invoice admin interface
- No taxes
- No discounts
- No refunds
- No accounting system
- No advanced CRM
- No advanced permission system (simple `role` field only)
- No complex calendar synchronization
- No multi-consultant scheduling logic unless later required
- No advanced analytics dashboard
- No advanced AI chatbot implementation (provider training, knowledge base, vector DB, streaming, usage billing, moderation productization)

**Allowed later as schema only:** `payments` and `invoices` tables may be created during migrations without enabling the features above.

---

## 5. User Types

### 5.1 Version 1 roles (mandatory simple role field)

| Type | Description |
| --- | --- |
| **guest** | Unauthenticated visitor |
| **client** | Registered user who can book |
| **admin** | Staff operator of admin modules |

### 5.2 Guest capabilities (PDF §10.1)

- Browse the website
- View services
- Submit the contact form
- Use the chatbot for an initial free consultation (foundation/placeholder path in current project rules)

### 5.3 Client capabilities (PDF §10.2)

- Authenticate
- Book consultations/services
- View own bookings (basic client view)

### 5.4 Admin capabilities (PDF §10.3, §26)

- Manage users, categories, services, bookings, chatbot conversations, contact messages
- Update statuses; activate/deactivate categories and services
- View client booking history

### 5.5 Account creation rules (mandatory)

- Public registration creates **clients only**
- Admin accounts **must not** be created through public registration
- Initial admin is created **manually or by seeder**

### 5.6 Future optional roles (future)

- `consultant`
- `accountant`
- `support`
- `content_manager`

A full roles/permissions system is future-only.

---

## 6. Public Website

Homepage sections (PDF §8). Primary CTA across the site: **Request a Consultation**.

### 6.1 Hero

| Field | Value |
| --- | --- |
| Goal | Brand introduction and primary conversion |
| Required content | Logo; company name **PR Per Hour**; description **Strategic Communication & Public Relations Consultancy**; slogan **Make Every Hour Count** |
| Expected CTA | Button 1: Explore Our Expertise; Button 2: Request a Consultation |
| Dynamic/static | Mostly static brand content |
| Source of data | Static copy / assets (unless later CMS) |

### 6.2 About Us

| Field | Value |
| --- | --- |
| Goal | Explain who PR Per Hour is |
| Required content | Helps organizations build stronger reputations, communicate with clarity, achieve measurable results |
| Expected CTA | Learn More |
| Dynamic/static | Static recommended layout (text + professional visual) |
| Source of data | Static copy / assets |

### 6.3 Our Expertise

| Field | Value |
| --- | --- |
| Goal | Show three main expertise areas |
| Required content | Cards: Strategic Communication; Public Relations Campaigns; Training & Capacity Building — each with number, title, short two-line description |
| Expected CTA | Explore the Service (per card) |
| Dynamic/static | May map to service categories (recommended alignment) |
| Source of data | Static initially and/or `service_categories` API later |

### 6.4 Our Approach

| Field | Value |
| --- | --- |
| Goal | Explain process |
| Required content | Discover → Strategize → Deliver → Measure; icon + short description each |
| Expected CTA | None required beyond section narrative |
| Dynamic/static | Static |
| Source of data | Static copy |

### 6.5 Trusted Organizations

| Field | Value |
| --- | --- |
| Goal | Social proof |
| Required content | Title **Trusted by Leading Organizations**; short paragraph; logo grid; no long per-logo descriptions |
| Expected CTA | None required |
| Dynamic/static | Static assets |
| Source of data | Static logos/copy |

### 6.6 Founder

| Field | Value |
| --- | --- |
| Goal | Build personal/professional trust |
| Required content | Professional image; title **Founder & Principal Consultant**; short bio; key points (PhD in Public Relations & Advertising; Strategic Communication Consultant; Corporate Trainer; Public Relations Specialist) |
| Expected CTA | View Full Profile |
| Dynamic/static | Static (+ dedicated Founder page) |
| Source of data | Static copy / assets |

### 6.7 Why PR Per Hour

| Field | Value |
| --- | --- |
| Goal | Differentiate value |
| Required content | Four cards: Strategic Thinking; Tailored Solutions; Research-Driven Decisions; Measurable Outcomes |
| Expected CTA | None required beyond section |
| Dynamic/static | Static |
| Source of data | Static copy |

### 6.8 Call to Action

| Field | Value |
| --- | --- |
| Goal | Convert |
| Required content | Suggested text: **Make Every Hour Count. Start Building Smarter Communication Today.** |
| Expected CTA | Request a Consultation |
| Dynamic/static | Static |
| Source of data | Static copy |

### 6.9 Contact

| Field | Value |
| --- | --- |
| Goal | Capture leads and provide contact channels |
| Required content | Contact form; email; phone; LinkedIn; optional map |
| Expected CTA | Submit contact form |
| Dynamic/static | Form posts to API; channel details may be static |
| Source of data | `contact_messages` API + static contact details |

### 6.10 Additional public pages (PDF §21)

Home, About, Services, Service details, Request consultation/booking, Login, Register, Contact, Founder profile, Chatbot widget, basic client booking view.

Do **not** build payment/invoice/PDF/payment-history pages in Version 1.

---

## 7. Services

### 7.1 Categories

Initial categories (mandatory seed set):

1. Strategic Communication
2. Public Relations Campaigns
3. Training & Capacity Building

Fields (from schema): `name`, `slug`, `description`, `is_active`, timestamps, soft delete.

### 7.2 Services

Each service belongs to one category.

Possible service types (examples from PDF §9.2 — not all required as seeded products):

- Free consultation
- Paid consultation in the future
- Training program
- PR campaign planning
- Communication audit
- Custom corporate program

### 7.3 Service details and behavior

| Topic | Rule |
| --- | --- |
| Active/inactive | `is_active` controls website availability |
| Duration | `duration_minutes` (nullable if no fixed duration) |
| Price | `price` DECIMAL; may be `0.00` for free consultations |
| Currency | `currency` (default `USD` in schema example) |
| Payment | **Online payment disabled in V1 even if price is set** |

Admin manages categories and services; public sees active records.

---

## 8. Authentication

### 8.1 Version 1 capabilities (mandatory)

Suggested endpoints (PDF §20.1):

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

Boundaries:

- Simple `role` field (`admin` | `client`)
- Public registration → `client` only
- Booking routes require authentication
- Admin routes protected by middleware/policies
- Passwords hashed
- Laravel Sanctum recommended **if needed** (PDF recommendation)

### 8.2 Future Considerations

Not required by the PDF for Version 1 (do not implement unless later approved):

- Password reset
- Email verification
- Social login
- MFA
- Advanced RBAC

---

## 9. Booking System

### 9.1 Prerequisites

- Client account required to book
- If guest clicks Book Consultation → Login / Sign Up, then continue

### 9.2 Booking flow (mandatory)

```
Visitor opens service page
→ Clicks Book Consultation
→ System checks authentication
→ If not logged in → Login / Sign Up
→ If logged in → Continue booking
→ Select/submit preferred date and time
→ Booking saved as pending
→ Admin reviews the booking
```

### 9.3 Fields

- `user_id`
- `service_id`
- `booking_date`
- `start_time`
- `end_time`
- `status`
- `notes` (optional)
- `meeting_link` (optional; Zoom/Meet/etc.)

### 9.4 Statuses (Version 1 supported)

- `pending`
- `confirmed`
- `completed`
- `cancelled`

**Do not use `paid` as a booking status** (payment not implemented).

### 9.5 Responsibilities

| Actor | Responsibilities |
| --- | --- |
| Client | Authenticate; submit booking; view own bookings |
| Admin | Review; update status; optionally set meeting link/notes; view history |

---

## 10. Contact Messages

### 10.1 Form fields

- Full name (required)
- Email (required)
- Phone (nullable)
- Organization (nullable)
- Message (required)
- Status (system-managed)

### 10.2 Storage behavior

Persist every submission in `contact_messages` (separate from chatbot tables).

### 10.3 Admin workflow

- List/search/filter (paginated)
- View message
- Update status

### 10.4 Supported statuses (recommended in PDF; adopted for V1)

- `new`
- `read`
- `replied`
- `closed`

---

## 11. Chatbot Boundary

The chatbot is a **future integration boundary** with Version 1 **foundation preparation only** under current project ownership rules.

### 11.1 Version 1 preparation may include

- Module structure
- Contracts / provider interface
- DTOs
- Database schema (`chat_conversations`, `chat_messages`)
- Placeholder UI widget
- Conversation and message storage foundation
- Admin conversation viewing foundation
- Documentation for future developers

### 11.2 Not completed scope

AI provider integration is **not** completed Version 1 scope.

### 11.3 Explicit exclusions

- OpenAI integration
- Gemini integration
- Claude integration
- Prompt engineering productization
- Knowledge base
- Vector database
- Streaming responses
- Usage billing
- AI moderation implementation
- Production AI response quality guarantees

### 11.4 PDF note vs project rule

The PDF §14.1 describes a simple V1 chatbot that may use predefined or basic AI-generated answers. **This project's current rule** is stricter for delivery ownership: prepare the foundation and storage boundary; do **not** ship a production AI provider integration without an approved provider specification. See [FUTURE_CHATBOT_HANDOFF.md](FUTURE_CHATBOT_HANDOFF.md) and [DECISIONS.md](DECISIONS.md).

---

## 12. Payments and Invoices Boundary

| Topic | Version 1 rule |
| --- | --- |
| Database preparation | May exist (`payments`, `invoices` tables) |
| Business functionality | **Not** part of Version 1 |
| Provider selection | **Not** part of Version 1 |
| Frontend payment/invoice flows | **Must not** exist |
| Admin payment/invoice screens | **Must not** exist |
| Invoice generation / PDF | **Must not** exist |

Future payment statuses (when later implemented): `pending`, `paid`, `failed`, `cancelled`, `refunded`  
Future methods (examples): `card`, `bank_transfer`, `cash`, `wallet`  
Future invoice statuses: `unpaid`, `paid`, `cancelled`

See [FUTURE_PAYMENT_HANDOFF.md](FUTURE_PAYMENT_HANDOFF.md).

---

## 13. Admin Dashboard

### 13.1 Active Version 1 modules

- Users
- Service categories
- Services
- Bookings
- Chatbot conversations (if foundation enabled)
- Contact messages

### 13.2 Admin UX notes (PDF §26.1)

- Paginated lists
- Search and filter
- Status updates
- Activate/deactivate categories and services
- View client booking history

### 13.3 Implementation recommendation

Filament is **recommended** for Version 1 admin speed/cleanliness. Custom React admin is an alternative. Filament is **not installed** in the current foundation.

### 13.4 Excluded admin screens

Payments, invoices, refunds, taxes, discounts.

---

## 14. Non-Functional Requirements

### 14.1 Mandatory requirements

| Area | Requirement |
| --- | --- |
| API boundaries | React communicates only with Laravel REST API; never direct DB access |
| Security | Hash passwords; Form Request validation; protect admin and booking routes; store secrets in env; HTTPS in production |
| Validation | Validate all requests server-side; user-facing validation/API messages must be localizable |
| Logging / ops | Use environment variables for private keys; avoid exposing payment data if added later |
| Maintainability | Clean modular structure; thin controllers; services/actions for business logic; API Resources |
| Responsive behavior | Public site must work as a professional website across devices |
| Localization | English + Arabic; LTR + RTL; persistent language selection; no hardcoded public UI strings |
| Theming | Light + dark + system; persistent selection; no startup theme flash; shared design tokens |
| Performance | Route-level code splitting; optimized responsive images; lazy non-critical assets; reduced-motion; mobile fallbacks; no mandatory WebGL; measure before advanced motion |
| Motion | Hierarchy/interaction first; decorative motion removable; lazy 3D; WebGL fallbacks; skippable intros |

### 14.2 Recommendations (PDF and delivery practice)

| Area | Recommendation |
| --- | --- |
| Performance (FE) | See [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md); prefer CSS for simple interactions |
| Performance (BE) | Indexes; paginated admin lists; safe caching; queues for emails; production caches |
| Security extras | CSRF where applicable; sanitize input; rate limit login, chatbot, and contact |
| Database | MySQL for Version 1 simplicity; 3NF; FKs; indexes; soft deletes where schema defines them |
| Admin | Filament recommended; admin localization optional |
| Auth package | Sanctum if needed |
| Data fetching | React Query or similar; Axios or Fetch |

### 14.3 Future improvements

- PostgreSQL if stronger scalability preferred later
- Advanced roles/permissions
- Consultant availability
- Online payments and invoices (using prepared tables) — must support EN/AR and themes if UI is added
- Blog/CMS, coupons, analytics, advanced chatbot tables
- Calendar integration, PDF invoice service
- Measurable performance budgets and Lighthouse/CWV targets (set later; no invented scores now)

### 14.4 Accessibility

Treat accessible public UI (keyboard use, readable contrast, semantic structure, reduced-motion, theme contrast) as a **mandatory delivery quality bar** for public and client-facing surfaces. Formal WCAG certification level remains unresolved unless later approved.

---

## 15. Acceptance Criteria

Measurable Version 1 criteria for **active** features only. Payment/invoice **business** functionality has no V1 acceptance criteria.

### Public Website

- [ ] Homepage renders all nine required sections with required brand/CTA content
- [ ] Primary CTA “Request a Consultation” is present in Hero and CTA sections
- [ ] Founder and Contact sections include required fields/channels
- [ ] No payment or invoice pages are linked or implemented

### Authentication

- [ ] Guest can register as `client` only
- [ ] Client can login/logout and fetch `/api/me`
- [ ] Public registration cannot create `admin`
- [ ] Initial admin exists via seeder or manual setup
- [ ] Passwords are hashed

### Service Categories & Services

- [ ] Three initial categories can be seeded/managed
- [ ] Public can list active categories/services and open service by slug
- [ ] Inactive services/categories are hidden from public API/UI
- [ ] Service may store price/currency without enabling checkout

### Bookings

- [ ] Unauthenticated book attempt redirects to login/register
- [ ] Authenticated client can create booking linked to user + service with date/time
- [ ] New bookings default to `pending`
- [ ] Status transitions support only `pending|confirmed|completed|cancelled`
- [ ] Optional notes and meeting_link can be stored
- [ ] Client can view own bookings; admin can list and update status

### Contact Messages

- [ ] Public form stores full_name, email, message (phone/organization optional)
- [ ] Default status is `new`
- [ ] Admin can list/view/update status among `new|read|replied|closed`

### Chatbot Foundation

- [ ] Conversation/message tables and module contracts exist when foundation phase is done
- [ ] Placeholder UI can open and accept a message path without a production AI provider
- [ ] Admin can view stored conversations when foundation is enabled
- [ ] No OpenAI/Gemini/Claude production integration is required to pass V1 foundation criteria

### Admin Dashboard

- [ ] Admin can manage users, categories, services, bookings, contact messages
- [ ] Admin can manage chatbot conversations if foundation enabled
- [ ] Lists are paginated and support search/filter/status updates
- [ ] No payment or invoice admin screens exist

### Client Dashboard

- [ ] Authenticated client can open a basic booking view of their bookings

### Localization

- [ ] User can switch English ↔ Arabic from the UI
- [ ] Selected language persists between visits
- [ ] Browser language may be detected on first visit; English is fallback
- [ ] English uses LTR; Arabic uses RTL
- [ ] Public/client static text comes from translation resources (no hardcoded visible strings)
- [ ] Validation and API user messages are localizable
- [ ] Dynamic services/categories follow an approved localization strategy
- [ ] Chatbot placeholder supports both languages
- [ ] SEO metadata supports both languages (routing strategy documented before implementation)

### Theme

- [ ] Light, dark, and system modes are available
- [ ] System preference used on first visit unless a saved preference exists
- [ ] Manual theme selection persists
- [ ] No visible theme flash on startup
- [ ] Shared design tokens cover both themes; features avoid scattered hardcoded theme colors
- [ ] Focus, contrast, forms, overlays, loading, and error states work in both modes
- [ ] Logos/media remain readable in both themes
- [ ] Chatbot placeholder supports both themes

### Performance / motion

- [ ] Route-level code splitting is in place for app routes
- [ ] Non-critical assets/media are lazy-loaded; images use modern formats and explicit dimensions where applicable
- [ ] Heavy animation/3D libraries are not in the initial bundle without justification
- [ ] `prefers-reduced-motion` is respected; mobile may use simplified motion
- [ ] WebGL is not required to access content; fallback exists if used
- [ ] Intro animations are skippable and do not block navigation
- [ ] Backend list endpoints paginate; N+1 avoided; private data not incorrectly cached
- [ ] Performance checks run during UI phases, not only at the end

### Architecture / NFR

- [ ] Frontend never accesses MySQL directly
- [ ] Secrets remain server-side
- [ ] Form Requests validate mutating endpoints
- [ ] API Resources shape JSON responses for implemented endpoints
