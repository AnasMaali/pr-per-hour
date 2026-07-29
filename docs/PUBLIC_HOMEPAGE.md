# Public Homepage

Public website shell and homepage for PR Per Hour.

Related: [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md), [SERVICES_API.md](SERVICES_API.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- Polished public header and footer
- Homepage narrative sections (hero through final CTA)
- CSS 3D hero sculpture + scroll-scrubbed logo draw
- Services preview against `GET /api/v1/services`
- EN/AR localization, RTL/LTR, light/dark/system
- Lightweight SEO metadata for the homepage

Related (separate feature): full `/services` catalog and service details — see [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md).

Not implemented on the homepage track:

- Contact form submission (lives on `/contact`)
- Booking UI
- Final auth pages (separate Auth UI track)
- Dashboards / admin tables
- Chatbot, payments, invoices
- WebGL / Three.js

## Sections

Narrative order after the cinematic redesign:

1. Sticky public navigation
2. Hero (brand-first + `HeroSculpture`)
3. Logo draw (`BrandMarkDraw` + GSAP ScrollTrigger)
4. About
5. Trust / capability indicators (text-based; no invented partner logos)
6. Why choose us
7. Capability showcase
8. Services preview (API)
9. How we work (process)
10. Final CTA
11. Footer

## Assets

| Asset | Usage |
| --- | --- |
| `frontend/src/assets/brand/logo.jpeg` | Header, footer, mark references |
| `frontend/src/assets/brand/logo-banner.jpeg` | About section brand banner |
| `BrandMarkDraw` SVG | Scroll-scrubbed logo section |

Intentionally unused root sources: `Picture1–5`, root `LOGO.jpeg` / `LOGO2.jpeg` (banner copied once into `assets/brand`). Partner/university/third-party marks are not presented as PR Per Hour clients.

## Services preview API

- Endpoint: `GET /api/v1/services`
- Params: `per_page=6`, `page=1`, `sort=title`, `direction=asc`
- Query key: `queryKeys.services.list(...)`
- States: skeleton loading, empty, error with retry + optional request ID
- Service titles/descriptions are shown as returned by the API (no fabricated Arabic catalog translations)
- An empty `data` array with valid pagination `meta` is a successful response; the homepage empty state is expected until services are inserted. Do not invent seed data for the homepage phase.

## Localization

Namespaces: `home`, `footer` (plus existing `navigation` / `common`).

## Motion

- **GSAP + ScrollTrigger** — homepage hero entrance/parallax scrub and logo stroke draw (registered via `shared/motion/gsap/registerGsap.ts`; pulled only by lazy `HomePage`)
- Shared `Reveal` / `StaggerGroup` for section/card reveals elsewhere
- Pointer parallax on the CSS 3D sculpture (`usePointerParallax`)
- Reduced motion: completed logo mark immediately; no GSAP timelines/pin
- Native document scrolling preserved (desktop logo pin is short, not scroll-jacking)

Canonical detail: [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md).

## SEO

Homepage sets document title, meta description, Open Graph title/description, and theme-color from CSS tokens. Production canonical URL and locale URL strategy remain deferred.

## Performance notes

- Dependency: `gsap@3.13.0` (~112 KB / ~44 KB gzip) in a manual chunk, lazy with HomePage only
- Route remains lazy-loaded; admin/client routes do not load GSAP
- Below-fold banner uses `loading="lazy"`
- Services preview limited to 6 items
- No WebGL / Three.js / Framer Motion / Lenis
