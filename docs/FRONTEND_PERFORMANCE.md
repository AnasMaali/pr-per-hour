# Frontend Performance

Performance decisions for the React foundation, public homepage, Services UI, and Auth UI.

Related: [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [PUBLIC_HOMEPAGE.md](PUBLIC_HOMEPAGE.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [PUBLIC_SERVICES_UI.md](PUBLIC_SERVICES_UI.md), [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md)

## Bundle strategy

- No UI component library or chart library
- Animation: **GSAP only on the lazy HomePage path** (manual `gsap-*.js` chunk); shared reveals stay CSS/IO
- One Axios instance and one QueryClient
- Route-level `React.lazy` + `Suspense` for page modules
- lucide-react icons imported per-icon (tree-shakeable)
- Brand assets only:
  - `logo.jpeg` (~13 KB)
  - `logo-banner.jpeg` (~37 KB, lazy-loaded in About)

## Lazy loading

Homepage, Services, Auth (login/register/unauthorized), and other routes load as separate chunks. Feature CSS is code-split with the corresponding modules.

## Homepage-specific decisions

- Services preview limited to 6 public results
- Below-fold banner uses `loading="lazy"`
- Cinematic scroll: CSS 3D `HeroSculpture` + GSAP ScrollTrigger logo draw (homepage-isolated)
- No Framer Motion / Three.js / WebGL; no background video or carousel package
- See [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md)

## Services UI decisions

- No new npm dependencies
- List `per_page` capped at 12
- Categories query cached (`staleTime` 5 minutes)
- Stable TanStack Query keys from normalized API params
- No service images required
- CSS-only card hover; respects `prefers-reduced-motion`

## Auth UI decisions

- No new npm dependencies
- Login/Register/Unauthorized remain lazy route chunks
- Mutations reuse AuthProvider (single token write path)
- No duplicate `/me` fetch on successful login/register (cache hydrated from response)
- CSS-only auth layout; no illustration packages

## Client Bookings UI decisions

- No new npm dependencies; no date-time library
- Client booking pages are lazy route chunks (`ClientDashboardPage`, `ClientBookingsPage`, `CreateBookingPage`, `ClientBookingDetailsPage`)
- List `per_page` fixed at 10; URL-driven filters; stable query keys
- Public services options for the create form: one cached query (`per_page=100`, 5 minute `staleTime`)
- Mutations use `retry: false`; invalidate list/detail only
- Dashboard overview uses a limited recent-bookings preview (first page), not invented totals
- CSS-only transitions; respects `prefers-reduced-motion`

## Client Profile UI decisions

- No new npm dependencies
- Profile page is a lazy route chunk
- Reuses AuthProvider `/me` cache; no duplicate `/me` fetch
- Profile mutation uses existing `authApi.updateProfile` with `retry: false`
- CSS-only initials avatar; no image upload assets

## Admin Dashboard Foundation decisions

- No new npm dependencies; no chart library
- Admin overview is a lazy route chunk; layout shared across admin routes
- Independent TanStack queries so one failure does not blank the page
- Count metrics use `meta.total` or public list length only
- Preview lists capped at `per_page=5`; count-only requests use `per_page=1`
- CSS-only drawer/transitions; respects `prefers-reduced-motion`

## Admin Service Categories UI decisions

- No new npm dependencies; no data-grid or dialog library
- Categories page is a lazy route chunk under `/admin/categories`
- Mutations `retry: false`; list GET may retry once
- Invalidates `queryKeys.admin.categories()` and `queryKeys.categories.all` only
- CSS-only dialogs/skeleton; respects `prefers-reduced-motion`

## Admin Services UI decisions

- No new npm dependencies; no data-grid or dialog library
- Services page is a lazy route chunk under `/admin/services`
- Mutations `retry: false`; list GET may retry once
- Invalidates `['admin','services']` and `queryKeys.services.all`
- Price kept as decimal string (no floating-point storage)
- CSS-only dialogs/skeleton; respects `prefers-reduced-motion`

## Admin Bookings UI decisions

- No new npm dependencies; no calendar or chart library
- List and details are lazy route chunks (`/admin/bookings`, `/admin/bookings/:id`)
- Mutations `retry: false`; list/detail GET may retry once
- Invalidates `['admin','bookings']` and `queryKeys.bookings.all`; detail cache set from mutation response
- Service filter uses first 100 admin services by title (documented compromise)
- Client filter is optional numeric `user_id` (no users directory)
- CSS-only dialogs/skeleton; respects `prefers-reduced-motion`

## Admin Contact Messages UI decisions

- No new npm dependencies; no inbox/email client library
- List and details are lazy route chunks (`/admin/contact-messages`, `/admin/contact-messages/:id`)
- Mutations `retry: false`; list/detail GET may retry once
- Invalidates `['admin','contact-messages']` (lists, overview previews/counts, detail)
- Soft-delete only; restore API not exposed (soft-deleted rows not listable)
- No subject field (backend has none); message excerpt on list, full plain text on details
- CSS-only dialogs/skeleton; respects `prefers-reduced-motion`

## Public Contact Page decisions

- No new npm dependencies; no form/CAPTCHA/map library
- Lazy route chunk under `/contact`
- Mutation `retry: false` (no automatic POST retries)
- No query cache for one-time submit
- Optional empty phone/organization sent as `null`
- No subject/attachments/reply/email claims
- CSS-only layout; respects `prefers-reduced-motion`

## Measured build snapshot (Public Contact Page phase)

Approximate production output after this phase:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~365 KB | ~104 KB |
| ContactPage JS | ~7.6 KB | ~2.5 KB |
| ContactPage CSS | ~2.6 KB | ~0.9 KB |

Contact stays in a lazy chunk. No new npm dependencies. Main shell growth vs prior admin phases is cumulative shared UI/i18n, not a contact-specific global import.

## Measured build snapshot (Public 3D Scroll Redesign)

Authoritative current public-motion snapshot — see [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md).

| Asset | Size | Gzip | Notes |
| --- | --- | --- | --- |
| Main JS | ~363.75 KB | ~104.09 KB | Negligible vs polish baseline |
| `gsap-*.js` | ~111.91 KB | ~44.04 KB | Lazy with HomePage only |
| HomePage JS | ~20.61 KB | ~5.46 KB | Sculpture + logo draw wiring |
| Shared motion chunk | ~3.41 KB | ~1.42 KB | Reveals unchanged |
| Contact / Services page JS | Stable | Stable | CSS-only visual upgrades |

**Before (Final Visual Polish):** main ~363 KB / ~104 KB gzip; HomePage ~16 KB / ~4 KB gzip; no GSAP chunk. **After:** GSAP isolated to homepage; admin/client chunks unchanged; **no WebGL**.

## Measured build snapshot (Advanced Public Experience)

See [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md) and [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md) (historical checkpoints).

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS | ~363 KB | ~104 KB |
| Shared motion chunk | ~3.3 KB | ~1.4 KB |
| HomePage JS | ~16.1 KB | ~4.0 KB |
| HomePage CSS | ~13.2 KB | ~3.0 KB |

Final Visual Polish is primarily CSS; expect near-zero JS gzip delta vs the Advanced Motion checkpoint.
| Global CSS | ~16.4 KB | ~3.9 KB |

**Checkpoint:** no new npm packages, no WebGL. Superseded for public pages by the redesign snapshot above.

## Measured build snapshot (Full Product Review)

Authoritative pre-Motion baseline — see [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md).

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~362 KB | ~103 KB |
| HomePage JS | ~14.5 KB | ~3.7 KB |
| ServicesPage JS | ~13.5 KB | ~4.1 KB |
| ContactPage JS | ~7.6 KB | ~2.5 KB |
| AdminServicesPage JS (largest admin feature chunk) | ~25.4 KB | ~6.9 KB |
| Global CSS | ~13.9 KB | ~3.4 KB |

Stabilization removed unused `pages` i18n namespace and dead placeholder components; main JS slightly smaller than the contact-page checkpoint. No new dependencies. **Do not start Motion/3D until this baseline is accepted.**

## Measured build snapshot (Admin Dashboard Foundation phase)

Approximate production output after Admin Dashboard Foundation work:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~317 KB | ~95 KB |
| AdminOverviewPage JS | ~10.5 KB | ~2.5 KB |
| AdminOverviewPage CSS | ~4.5 KB | ~1.2 KB |
| Global CSS (includes admin layout) | ~13.9 KB | ~3.4 KB |

Main shell grew modestly from the profile checkpoint (~309→~317 KB) from shared admin i18n/layout; overview cost stays in a lazy chunk. No new npm dependencies.

Re-measure after Admin Service Categories UI in the phase verification report (`AdminCategoriesPage` lazy chunk).

## Measured build snapshot (Admin Service Categories UI phase)

Approximate production output after this phase:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~326 KB | ~98 KB |
| AdminCategoriesPage JS | ~18.2 KB | ~5.1 KB |
| AdminCategoriesPage CSS | ~5.5 KB | ~1.3 KB |
| AdminOverviewPage JS | ~10.5 KB | ~2.5 KB |

Categories cost stays in a lazy chunk. No new npm dependencies.

## Measured build snapshot (Admin Services UI phase)

Approximate production output after this phase:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~338 KB | ~100 KB |
| AdminServicesPage JS | ~25.8 KB | ~7.0 KB |
| AdminServicesPage CSS | ~6.3 KB | ~1.4 KB |
| AdminCategoriesPage JS | ~17.7 KB | ~5.0 KB |

Services cost stays in a lazy chunk. Main grew mainly from shared `adminServices` i18n. No new npm dependencies.

## Measured build snapshot (Admin Bookings UI phase)

Approximate production output after this phase:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~351 KB | ~102 KB |
| AdminBookingsPage JS | ~9.7 KB | ~2.7 KB |
| AdminBookingDetailsPage JS | ~14.4 KB | ~3.8 KB |
| admin-bookings CSS | ~6.9 KB | ~1.5 KB |
| AdminServicesPage JS | ~25.4 KB | ~6.9 KB |

Bookings list/details stay in lazy chunks. Main grew mainly from shared `adminBookings` i18n. No new npm dependencies.

## Measured build snapshot (Admin Contact Messages UI phase)

Approximate production output after this phase:

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS (`index-*.js`) | ~361 KB | ~103 KB |
| AdminContactMessagesPage JS | ~9.0 KB | ~2.5 KB |
| AdminContactMessageDetailsPage JS | ~10.8 KB | ~3.2 KB |
| admin-contact-messages CSS | ~6.8 KB | ~1.5 KB |

Contact messages list/details stay in lazy chunks. Main grew mainly from shared `adminContactMessages` i18n. No new npm dependencies.

## Query defaults

- Limited GET retries; no mutation retries
- `staleTime` 60s; `refetchOnWindowFocus` disabled for foundation stability
- Services categories override: 5 minute `staleTime`

## Future work

- Image optimization pipeline (WebP/AVIF, responsive `srcset`)
- Measured Core Web Vitals budgets for public pages
- Optional WebGL hero only if CSS/SVG depth proves insufficient (still lazy + fallbacks)

## Verification

```bash
cd frontend
npm run build
```

Review `dist/assets` chunk sizes after meaningful dependency changes.
