# PR Per Hour Frontend

React 19 + Vite + TypeScript app for the public site, authentication, client dashboard, and admin shells.

## Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Default API base URL: `http://127.0.0.1:8000/api/v1` (override with `VITE_API_BASE_URL`).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript project build check |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview production build |

## Status

Implemented:

- Frontend foundation (routing, guards, layouts, API client, auth infrastructure, i18n, themes)
- Public homepage shell with services preview
- Public Services listing and Service Details UI (`/services`, `/services/:slug`)
- Public Contact Page (`/contact` — form submit; no reply/email)
- Final Login / Register / Unauthorized UI
- Client Booking UI (`/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/new`, `/dashboard/bookings/:id`)
- Client Profile UI (`/dashboard/profile` — name/phone update; email read-only)
- Admin Dashboard Foundation (`/admin` overview + layout)
- Admin Service Categories UI (`/admin/categories`)
- Admin Services UI (`/admin/services`)
- Admin Bookings UI (`/admin/bookings`, `/admin/bookings/:id`)
- Admin Contact Messages UI (`/admin/contact-messages`, `/admin/contact-messages/:id`)
- Full Product Review / stabilization (see `docs/FULL_PRODUCT_REVIEW.md`)
- Advanced public visual experience checkpoint (CSS 3D + shared motion; no WebGL — see `docs/ADVANCED_PUBLIC_EXPERIENCE.md`)
- Final visual polish checkpoint (see `docs/FINAL_VISUAL_POLISH.md`)
- Public 3D Scroll Redesign (CSS 3D sculpture + GSAP logo draw, homepage-only; no WebGL — see `docs/PUBLIC_3D_SCROLL_REDESIGN.md`)

Not implemented:

- Forgot password / email verification / social login
- Password change / email change / avatar / account deletion
- Admin user management / contact message restore UI
- Chatbot / payments / invoices
- Reschedule / calendar
- WebGL / Three.js scenes

## Docs

See `docs/FRONTEND_ARCHITECTURE.md`, `docs/FULL_PRODUCT_REVIEW.md`, `docs/PUBLIC_3D_SCROLL_REDESIGN.md`, `docs/ADVANCED_PUBLIC_EXPERIENCE.md`, `docs/PUBLIC_HOMEPAGE.md`, `docs/PUBLIC_SERVICES_UI.md`, `docs/PUBLIC_CONTACT_PAGE.md`, `docs/FRONTEND_AUTH_UI.md`, `docs/CLIENT_BOOKINGS_UI.md`, `docs/ADMIN_BOOKINGS_UI.md`, `docs/ADMIN_CONTACT_MESSAGES_UI.md`, and related frontend docs in `/docs`.

Public motion: GSAP is isolated to the lazy HomePage chunk; shared reveals stay CSS/IO-based.
