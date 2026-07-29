# Public Services UI

Public services listing and service details for PR Per Hour.

Related: [SERVICES_API.md](SERVICES_API.md), [SERVICE_CATEGORIES_API.md](SERVICE_CATEGORIES_API.md), [PUBLIC_HOMEPAGE.md](PUBLIC_HOMEPAGE.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [FEATURE_STATUS.md](FEATURE_STATUS.md)

## Scope

Implemented:

- `/services` listing with filters, sorting, pagination
- `/services/:slug` details page
- Category filter via public categories API
- URL query-parameter state
- Loading, empty, and error states
- Auth-aware booking CTA (links only; no booking mutation)
- EN/AR localization, RTL/LTR, light/dark/system
- Accessibility and lightweight SEO metadata

Visual framing for list/detail heroes, filters, cards, and CTAs was upgraded in the [public 3D scroll redesign](PUBLIC_3D_SCROLL_REDESIGN.md) without API or behavior changes.

Not implemented:

- Booking form / `POST /bookings`
- Checkout / payments / invoices
- Contact form submission
- Client or admin dashboards
- Chatbot
- Fabricated service content or automatic seeding

## Routes

| Path | Module | Notes |
| --- | --- | --- |
| `/services` | `features/services/pages/ServicesPage.tsx` | Lazy-loaded; PublicLayout |
| `/services/:slug` | `features/services/pages/ServiceDetailsPage.tsx` | Lazy-loaded; 404-style state for missing/inactive |

## API integration

### Services list

- `GET /api/v1/services`
- Default UI params: `page=1`, `per_page=12`, `sort=id`, `direction=asc`
- Optional: `search`, `category` (slug), `duration_minutes`, `currency`, `min_price`, `max_price`
- TanStack Query key: `queryKeys.services.list(...)`
- AbortSignal supported via shared Axios client

### Service details

- `GET /api/v1/services/{slug}`
- Query key: `queryKeys.services.detail(slug)`
- HTTP 404 → translated not-found state with link back to `/services`

### Categories

- `GET /api/v1/service-categories` (non-paginated active list)
- Cached (`staleTime` 5 minutes)
- Failure shows a restrained warning; listing remains usable without category options

## URL query parameters

Frontend URL keys:

| URL key | Backend param | Notes |
| --- | --- | --- |
| `search` | `search` | Applied on explicit submit |
| `category` | `category` | Category slug |
| `duration` | `duration_minutes` | Non-negative integer |
| `currency` | `currency` | Uppercased |
| `min_price` | `min_price` | Decimal-safe string |
| `max_price` | `max_price` | Decimal-safe string |
| `sort` | `sort` | `id` \| `title` \| `price` \| `duration_minutes` \| `created_at` |
| `direction` | `direction` | `asc` \| `desc` |
| `page` | `page` | Positive integer; resets to 1 when core filters apply |

Refresh, share, and browser back/forward preserve filters. Search uses an explicit Apply action (no debounce library).

## Filters and validation

Client-side checks (backend remains authoritative):

- duration ≥ 0 integer
- min/max price ≥ 0
- min_price ≤ max_price
- allowed sort/direction
- page ≥ 1

Invalid values are normalized when parsing the URL or blocked before Apply with translated inline errors. API 422 surfaces a page-level message via normalized errors.

## Service card

Shows category (if present), title, description excerpt, duration, price + currency, and a real “View details” link. The card is not a clickable `div`. Null description/duration are handled safely. Price is displayed as the API’s fixed-decimal string with uppercase currency.

## Pagination

Uses API `meta`: `current_page`, `per_page`, `total`, `last_page`. Previous/Next with disabled states; page indicator; filters preserved. If the current page exceeds `last_page` after a filter change, the URL is clamped.

## Loading / empty / error

- Loading: skeleton grid (`aria-busy`)
- Empty catalog: polished empty state + contact CTA
- Empty filtered results: empty state + reset filters
- Error: `ErrorState` with retry and optional request ID
- Categories failure: warning only

## Service details page

Shows breadcrumb, category, H1 title, description (or translated fallback), duration, price/currency, summary meta, back link, and booking CTA. Does not invent deliverables, reviews, availability, or payment claims. Does not show `is_active` or internal timestamps to the public.

## Auth-aware CTA

| Audience | Action |
| --- | --- |
| Guest | Login / register with `state.from` = `/dashboard/bookings/new?service=<slug>` |
| Authenticated client | Link to `/dashboard/bookings/new?service=<slug>` (no POST from details) |
| Authenticated admin | Neutral back-to-services |
| All | Contact link |

Copy states that booking requests are reviewed and that this step does not process payment. See [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md).

## Localization

Namespace: `services` (EN + AR). API service titles/descriptions remain as stored; UI chrome is translated. No fabricated Arabic catalog content.

## Themes and direction

Reuses homepage navy/gold tokens, PublicLayout/Footer, and logical CSS. Verified for light/dark/system and LTR/RTL via the shared appearance and locale foundations.

## Accessibility

- One H1 per page
- Labeled breadcrumb nav
- Labeled filter controls with inline errors
- Keyboard-operable filters and pagination
- Focusable results heading after page changes
- Reduced-motion respected for card hover

## SEO

Listing and details set document title, meta description, and Open Graph title/description via `useDocumentMeta`. Details title/description derive from the loaded service (with fallbacks). No production canonical URL, social image, or structured data package.

## Performance

- No new npm dependencies
- Routes remain lazy-loaded
- `per_page` capped at 12 in the UI
- Categories cached; list queries keyed by stable params
- No service images, animation libraries, or 3D/WebGL

## Empty database limitation

A successful empty list (`data: []` with valid pagination meta) is expected until services exist locally. Do not seed from the frontend. Populated-state visual QA requires approved local sample data later. Unknown slugs return HTTP 404 and the not-found UI.

## Deferred

Payment, contact form, admin CRUD, chatbot. Client booking UI is documented in [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md).
