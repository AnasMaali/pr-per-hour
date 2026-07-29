# Advanced Public Experience

Premium public-site visual system, motion architecture, and CSS 3D depth for PR Per Hour.

> **Superseded for public pages by** [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md) — cinematic scroll, CSS 3D sculpture, scroll-scrubbed logo draw, and GSAP on the homepage only. This document remains the earlier CSS-only motion checkpoint. **WebGL is still not used.**

Related: [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md), [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md), [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md), [FRONTEND_ACCESSIBILITY.md](FRONTEND_ACCESSIBILITY.md), [FRONTEND_APPEARANCE.md](FRONTEND_APPEARANCE.md)

## Design direction

- Deep navy + gold brand language
- Glass-like elevated surfaces with restrained glow
- Editorial typography hierarchy (`--font-display` for key titles)
- Layered depth without gaming/crypto neon aesthetics
- Equally usable light and dark themes

## Routes enhanced

| Route | Enhancement |
| --- | --- |
| `/` | Cinematic hero (CSS 3D system), section reveals, staggered cards |
| `/services` | Intro reveal, glass filters, staggered service cards, focus/hover depth |
| `/services/:slug` | Stronger hero typography, glass meta panel |
| `/contact` | Elevated glass form, reveal intro/success |
| Public header/footer | Scrolled glass header, active underline, footer depth |
| `/login`, `/register` | Light visual alignment (glass auth card) |

Client/admin business UIs intentionally restrained (unchanged workflows).

## Asset audit

| Asset | Size | Dimensions | Decision |
| --- | --- | --- | --- |
| `LOGO.jpeg` | ~13 KB | 500×500 | **Used** (existing brand mark already in `frontend/src/assets/brand/logo.jpeg`) |
| `LOGO2.jpeg` | ~37 KB | 1600×624 | **Used** (existing banner already in `frontend/src/assets/brand/logo-banner.jpeg`) |
| `Picture1.png` | ~26 KB | 120×117 | **Rejected** — Al-Quds Open University seal; wrong brand; low res |
| `Picture2.jpg` | ~9 KB | 233×233 | **Rejected** — “KOTON” mark; unrelated; low quality |
| `Picture3.png` | ~2 KB | 92×92 | **Rejected** — “K” equalizer mark; unrelated; tiny |
| `Picture4.jpg` | ~7 KB | 227×227 | **Rejected** — unrelated orange oval; low quality |
| `Picture5.png` | ~11 KB | 161×50 | **Rejected** — “RWDS” wordmark; unrelated; low res |

Root originals remain untracked and untouched. No new image derivatives were required because rejected assets are unsuitable and brand logos already exist as optimized frontend copies.

## Motion architecture

Location: `frontend/src/shared/motion/`

| Piece | Role |
| --- | --- |
| `useReducedMotion` | Tracks `prefers-reduced-motion` |
| `useInView` | IntersectionObserver reveals |
| `usePointerParallax` | rAF pointer parallax (fine pointer only) |
| `useScrollProgress` | Document scroll progress via rAF |
| `Reveal` / `StaggerGroup` | Section and card reveals |
| `RouteTransition` | Restrained public route enter fade |
| `motion.css` | Transform/opacity only |

**Checkpoint:** no animation library. **Later redesign:** GSAP + ScrollTrigger added for homepage scroll/logo draw only — see [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md). Shared `Reveal` / `StaggerGroup` remain CSS/IO-based.

## Reduced-motion behavior

When `prefers-reduced-motion: reduce`:

- Reveals appear immediately
- Parallax / pointer tracking disabled
- Continuous float disabled
- Route transitions instant
- Content never delayed

## 3D strategy

**Checkpoint:** CSS 3D transforms + layered DOM (`HeroSystemVisual`).

- Perspective stage with floating interface cards, grid plane, orbit ring
- Pointer parallax via CSS custom properties
- Decorative only (`aria-hidden`)

**Redesign:** `HeroSystemVisual` replaced by `HeroSculpture` + `BrandMarkDraw` (still CSS 3D + SVG; no WebGL) — see [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md).

## WebGL decision

**WebGL was not used** (checkpoint or redesign).

CSS/SVG depth achieved the cinematic target without Three.js / R3F. No WebGL chunk, no context-loss handling required.

## Added dependencies

**Checkpoint:** none. **Redesign:** `gsap@3.13.0` (homepage lazy chunk only).

## Scroll behavior

- Section reveals via IntersectionObserver
- Staggered cards
- Header scrolled state via rAF
- Native scrolling preserved (no scroll-jacking / forced snap)

## Accessibility

- Semantic headings/landmarks preserved
- Decorative hero system `aria-hidden`
- Focus-visible parity with hover lifts (`:focus-within` on cards)
- Skip link / menu Escape / form a11y unchanged
- Reduced-motion path fully usable

## RTL / LTR

- Logical CSS properties retained
- Parallax uses geometric offsets (not reading-direction arrows)
- Nav active underline uses logical inset

## Theme

New semantic tokens: `--color-glass`, `--color-glow`, `--color-depth`, `--shadow-glow` (light + dark).

## Performance budgets

Pre-Motion baseline (Full Product Review): main ~362 KB / ~103 KB gzip.

Checkpoint build after QA fixes (`npm run build`):

| Asset | Size | Gzip | Notes |
| --- | --- | --- | --- |
| Main JS | ~363.1 KB | ~103.9 KB | +~0.9 KB / +~0.4 KB gzip (theme icon switcher) |
| `motion-*.js` | ~3.3 KB | ~1.4 KB | Shared motion chunk (under 8 KB) |
| HomePage JS | ~16.1 KB | ~4.0 KB | Stable |
| ServicesPage JS | ~13.6 KB | ~4.1 KB | Negligible |
| ContactPage JS | ~7.8 KB | ~2.6 KB | Negligible |
| Global CSS | ~16.7 KB | ~3.9 KB | Token + layout polish |
| HomePage CSS | ~13.2 KB | ~3.0 KB | Hero system styles |

Budgets met **without WebGL**. Checkpoint had no new npm packages. Brand images unchanged (~13 KB + ~37 KB). No Three.js / R3F / Framer at this checkpoint; GSAP added later in the redesign (homepage-only chunk).

## Fallbacks

- Reduced motion → static layered hero, immediate content
- Coarse pointer → no parallax
- Missing IntersectionObserver → treat as in view
- No WebGL failure path needed

## Runtime visual QA (checkpoint)

See also [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md) for the subsequent launch polish pass (routes, viewports, screenshots, defects fixed).

Automated headless Edge (puppeteer-core, **outside** project dependencies) against Vite `http://127.0.0.1:5173` with Laravel API on `:8000`.

### Routes actually inspected

`/`, `/services`, `/contact`, `/login`, `/register`, `/does-not-exist` (404).

**Service detail (`/services/:slug`):** not live-inspected — local API returned `total: 0` public services. Detail UI reviewed via code/static CSS only.

### Viewports actually inspected

320×568, 375×812, 768×1024, 1024×768, 1440×900 (English light matrix). Arabic dark sampled at 375×812 and 1440×900. Additional samples: English dark home, Arabic light home, system-preference home (resolved to dark in headless Edge).

### Combinations verified

| Check | Result |
| --- | --- |
| Horizontal overflow (EN light all listed viewports/routes) | **0** after header compact fix |
| Arabic RTL dir/lang + H1 on home/services/contact | Pass (when route chunk loaded) |
| Light / dark / system theme attributes | Pass |
| `prefers-reduced-motion: reduce` | Reveal opacity `1`, hero `hero-system--static`, no canvas |
| Keyboard first Tab | Skip link (`#main-content`) |
| Mobile menu open (375) | Opens; nav links present |
| Contact five fields | `full_name`, `email`, `phone`, `organization`, `message` present |
| Hero decorative a11y | `aria-hidden="true"`, no focusable children, no `<canvas>` |
| Console | No React/motion exceptions; no WebGL warnings. Transient `ERR_INSUFFICIENT_RESOURCES` under heavy headless navigation stress (not a product defect). CORS errors only when preview `:4173` was used (not in allowed origins) — retested on `:5173`. |

### Defects corrected during checkpoint QA

1. **Reveal blank flash** — `useInView` kept content visible until observer ready; above-fold marked visible immediately.
2. **Per-card backdrop-filter cost** — service cards use elevated surface + shadow instead of blur.
3. **Hero blur layers** — glass blur limited to front card.
4. **RouteTransition remount blank** — removed `key={pathname}`; animate same wrapper.
5. **Mobile horizontal overflow (~116px @320)** — theme switcher text labels overflowed header; switched to icon buttons with `aria-label` + tighter public header gaps.

### Remaining visual limitations

- No interactive human DevTools pixel review of every theme×locale×viewport cell
- No live service-detail page (empty catalog)
- No valid contact POST during QA
- Touch/coarse-pointer parallax verified by code + media-query path; not a physical device lab
- Headless system theme follows Edge OS preference (dark in this environment)

## Security

- No `dangerouslySetInnerHTML`
- No third-party trackers/CDN scripts
- No analytics
- Canvas/WebGL not used
- Guards/API/forms untouched

## Limitations

- Hero depth is CSS 3D, not photoreal 3D
- Picture* root assets unused (wrong brand / quality)
- Client/admin intentionally not redesigned
- Authenticated visual QA not expanded beyond public alignment
- Empty local services catalog limited live detail QA

## Deferred

Heavier WebGL / Three.js scenes and additional marketing pages remain out of scope. Scroll-scrubbed logo storytelling shipped in [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md) (CSS/SVG + GSAP; still no WebGL).
