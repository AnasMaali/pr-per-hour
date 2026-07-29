# Final Visual Polish

Launch-readiness visual QA and restrained polish for the public/auth surfaces of PR Per Hour.

> **Historical checkpoint.** A subsequent redesign lives in [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md). This document remains the prior polish/QA record and is not the current public visual source of truth.

Related: [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md), [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md), [FRONTEND_ACCESSIBILITY.md](FRONTEND_ACCESSIBILITY.md), [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md)

## Scope

Visual consistency only. No new features, sections, dependencies, WebGL/Canvas/Three.js, backend/API/schema/data changes, or admin/client workflow redesigns.

## QA setup

- Frontend: Vite `http://127.0.0.1:5173`
- Backend: Laravel `http://127.0.0.1:8000` (public catalog empty: `total: 0`)
- Tooling: headless Microsoft Edge via puppeteer-core **outside** project dependencies
- Screenshots: `frontend/.qa-screenshots/` (local only; not committed)

## Routes reviewed

| Route | Reviewed |
| --- | --- |
| `/` | Yes |
| `/services` | Yes (empty catalog) |
| `/services/:slug` | **No live data** — code/static review only |
| `/contact` | Yes (no valid submission) |
| `/login` | Yes |
| `/register` | Yes |
| `/unauthorized` | Yes |
| `/does-not-exist` | Yes |

## Viewports reviewed

320×568, 375×812, 430×932, 768×1024, 1024×768, 1280×800, 1440×900

## Locale / theme combinations reviewed

| Combination | Coverage |
| --- | --- |
| English Light | Full route matrix at 1440; mobile/tablet samples |
| English Dark | Home, services, contact at 1440; reduced-motion home |
| Arabic Light | Home, services, contact at 1440 |
| Arabic Dark | Home, contact at 1440; home/services/contact at 375 |
| System | Home at 1440 (resolved to dark in headless Edge) |
| `prefers-reduced-motion: reduce` | Home EN dark — reveals immediate, hero static |

## Screenshots captured

Stored under `frontend/.qa-screenshots/` (gitignored):

- `desktop-en-light-home-hero.png`
- `desktop-en-light-home-mid.png`
- `desktop-en-light-services.png`
- `desktop-en-light-contact.png`
- `desktop-en-dark-home.png`
- `desktop-en-dark-reduced-motion-home.png`
- `desktop-ar-light-home.png`
- `mobile-en-light-home-hero.png`
- `mobile-en-light-nav-open.png`
- `mobile-en-light-services.png`
- `mobile-en-light-contact.png`

## Audit results

### Typography

- Serif display + sans UI hierarchy remains coherent EN/AR.
- **Fixed:** Arabic eyebrows/footer headings no longer force `text-transform: uppercase` / letter-spacing.
- Arabic display headings use slightly taller line-height (`1.2`).
- Mobile logo name uses `nowrap` + slightly smaller header type to avoid awkward multi-line wrap.

### Spacing

- Section rhythm retained; mobile hero padding tightened slightly.
- Hero CTAs stack full-width below 40rem for practical touch targets.
- Contact/auth form panels use consistent elevated padding.

### Color / contrast

- Light muted text darkened `#5b677a` → `#4f5b6e` (~5.3:1 → stronger on `#f5f7fb`).
- Glass/glow restrained on contact + auth cards (elevated surface + `shadow-md`).
- Focus uses shared `--focus-ring` (removed invalid `--color-focus`).

### Hero

- CSS 3D composition retained; glow opacity reduced on small screens.
- No fake metrics; decorative `aria-hidden` unchanged.
- Reduced-motion static state remains premium.

### Header / footer

- No horizontal overflow after polish.
- Active gold underline readable Light/Dark.
- Footer: real links only; Arabic section titles no longer uppercased.

### Homepage sections / cards / filters

- Card depth consistent (elevated + light shadow; no per-card blur).
- Services filters use elevated surface (no backdrop-filter).
- Empty services state readable and on-brand.

### Service detail

- Live QA limited: public API returned zero services.
- Category uppercase disabled for Arabic in CSS; layout reviewed statically.

### Contact / auth

- Five fields preserved; no submission during QA.
- Form/auth cards aligned to elevated surface language.
- Field hover/focus border cues added without changing validation logic.

### Buttons / forms / surfaces

- Shared button heights/radii unchanged; lift hover remains reduced-motion safe.
- Shared `.field__control` gains subtle hover/focus border (spot-checked on public + auth).
- Surface hierarchy: elevated for interactive panels; glass reserved for header chrome.

### Motion timing

- Reveal duration token `--transition-reveal`: 520ms → 440ms.
- Stagger step 70ms → 55ms; travel distance reduced.
- Route transition no longer rests at `opacity: 0` (prevents blank captures / flash).

### RTL / mobile / a11y

- RTL composition balanced; Arabic uppercase defect fixed.
- 320/375 overflow: 0 after polish.
- Skip link, decorative hero, reduced motion verified.
- One H1 per inspected page when route chunk loaded.

## Runtime / console

- No React/motion exceptions on successful loads.
- No WebGL/Canvas warnings.
- Transient `ERR_INSUFFICIENT_RESOURCES` under heavy headless navigation stress only.
- No contact POST performed.

## Performance

Baseline (post Advanced Motion, `693704b`):

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS | 363.14 KB | 103.85 KB |
| Motion chunk | 3.33 KB | 1.39 KB |
| HomePage JS | 16.10 KB | 3.97 KB |

After Final Visual Polish (`npm run build`):

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS | 363.14 KB | 103.85 KB |
| Motion chunk | 3.41 KB | 1.42 KB |
| HomePage JS | 16.10 KB | 3.97 KB |
| HomePage CSS | 13.71 KB | 3.06 KB |
| Global CSS | 17.21 KB | 4.02 KB |

Main gzip unchanged. Motion +0.03 KB gzip (route-transition safety). No new dependency chunks. No WebGL.

## Defects fixed

1. Arabic forced uppercase / letter-spacing on eyebrows and footer headings.
2. Invalid `--color-focus` on contact error summary.
3. Route transition resting `opacity: 0` (blank services screenshot / flash risk).
4. Mobile logo name wrapping to multiple lines.
5. Contact/auth/services filter over-glass / heavy glow.
6. Light muted text contrast strengthened.
7. Motion slightly slow / heavy travel distance.
8. Mobile hero CTAs cramped side-by-side.

## Unresolved limitations

- No live `/services/:slug` visual pass (empty catalog).
- Not every theme×locale×viewport cell inspected by a human in DevTools.
- No physical device touch lab.
- Client/admin intentionally not redesigned (shared field focus only).

## Launch-readiness decision

**Public and auth visual surfaces are launch-ready** for V1 presentation quality, subject to populating real services for detail-page confirmation and optional human pixel pass on remaining viewport cells.

## Confirmations

- No WebGL / Canvas / Three.js / R3F / GSAP / Framer / new npm dependencies
- No backend / migration / API / schema / database mutation
- No fake business content
- No Payments / Invoices / Users admin / Chatbot / Calendar / Email / SMS / Attachments
- Screenshots not committed
