# Public 3D Scroll Redesign

Major redesign of the public marketing experience for PR Per Hour: cinematic hero, CSS 3D sculpture, scroll-scrubbed logo draw, and stronger public/auth visual system.

Related: [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md), [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md), [FRONTEND_PERFORMANCE.md](FRONTEND_PERFORMANCE.md), [FRONTEND_ACCESSIBILITY.md](FRONTEND_ACCESSIBILITY.md)

## Creative direction

**Positioning:** technical creative studio / premium software partner — motion-first, dimensional, disciplined.

**Visual language:**

- Richer navy + gold volumetric lighting
- Layered depth planes, orbit rings, glass modules
- Editorial display typography for hero/section titles
- Scroll narrative instead of repetitive fade-up cards only
- No fake stats, clients, testimonials, or contact details

## 3D strategy

**CSS 3D + SVG (no WebGL / Three.js / R3F).**

| Piece | Technique |
| --- | --- |
| `HeroSculpture` | Perspective stage, depth planes, orbit rings, brand core, floating modules, pointer parallax |
| `BrandMarkDraw` | SVG letterform strokes + gold hourglass chambers |
| Logo section | Scroll-scrubbed stroke reveal with short desktop pin |
| Surfaces | Glass / glow / depth / volume tokens |

**Why not WebGL:** CSS/SVG depth met the cinematic target with a smaller, more predictable cost, progressive enhancement, and no context-loss path. Future Blender-exported hero assets can replace `HeroSculpture` internals behind the same section API.

## Logo draw strategy

1. Recreate the PR + hourglass mark as strokeable SVG (`BrandMarkDraw`)
2. On homepage `#brand` section, GSAP ScrollTrigger scrubs `stroke-dashoffset`
3. Gold chambers and copy fade in as the draw completes
4. Desktop: short pin (`+=120%`) — intentional, not scroll-jacking
5. Mobile: scrub without pin
6. Reduced motion: completed mark immediately; no timeline

## Motion strategy

| Layer | Tool |
| --- | --- |
| Homepage hero entrance + parallax scrub | GSAP + ScrollTrigger |
| Logo stroke draw | GSAP + ScrollTrigger |
| Section/card reveals elsewhere | Existing `Reveal` / `StaggerGroup` |
| Pointer depth | `usePointerParallax` |
| Route enter | `RouteTransition` |

Native document scrolling is preserved. GSAP is registered only via `shared/motion/gsap/registerGsap.ts` and imported from homepage experiences so admin/client routes do not load the `gsap` chunk.

## Dependencies added

| Package | Why | Isolation |
| --- | --- | --- |
| `gsap@3.13.0` | High-quality scroll choreography + logo stroke scrub | Manual chunk `gsap-*.js`; pulled by lazy `HomePage` only |

**Not added:** Three.js, R3F, Framer Motion, Lenis, UI kits.

## Routes redesigned (visual only)

| Route | Changes |
| --- | --- |
| `/` | New hero sculpture, logo draw section, narrative reorder, stronger section depth |
| `/services` | Stronger hero atmosphere, filters, cards, CTA panel |
| `/services/:slug` | Stronger detail hero atmosphere (live data still empty locally) |
| `/contact` | Depth background, elevated form framing |
| `/login`, `/register` | Deeper auth atmosphere, elevated cards/benefits |
| Public header/footer | Stronger scrolled chrome, footer volume, mobile menu enter |

**Unchanged:** APIs, auth logic, booking logic, admin/client workflows, backend, schema, data.

## Responsive / RTL / theme

- EN + AR copy updated for hero + logo section
- Logical CSS retained; process hover uses mirrored translate in RTL
- Light / dark / system tokens extended (`--shadow-depth`, `--color-volume`, `--ease-cinematic`)
- Mobile: no logo pin; stacked hero; full-width CTAs

## Accessibility

- One H1 per page preserved
- Decorative sculpture / mark `aria-hidden`
- Focus-visible parity on interactive cards
- Reduced-motion path skips GSAP timelines and pin
- Skip link, mobile menu Escape, forms unchanged
- Content never blocked by motion layers

## Performance

### Before (Final Visual Polish baseline)

| Asset | Size | Gzip |
| --- | --- | --- |
| Main JS | 363.14 KB | 103.85 KB |
| Motion chunk | 3.41 KB | 1.42 KB |
| HomePage JS | 16.10 KB | 3.97 KB |

### After (`npm run build`)

| Asset | Size | Gzip | Notes |
| --- | --- | --- | --- |
| Main JS | ~363.75 KB | ~104.09 KB | Negligible |
| `gsap-*.js` | ~111.91 KB | ~44.04 KB | Lazy with HomePage only |
| HomePage JS | ~20.61 KB | ~5.46 KB | Sculpture + logo draw wiring |
| Motion chunk | ~3.41 KB | ~1.42 KB | Shared reveals unchanged |
| Contact / Services page JS | Stable | Stable | CSS-only visual upgrades |

Admin/client route JS sizes unchanged. No WebGL chunk.

## Live QA

- Frontend: Vite `http://127.0.0.1:5173`
- Backend: Laravel `http://127.0.0.1:8000` (public catalog empty)
- Tooling: headless Edge via puppeteer-core **outside** project dependencies
- Screenshots: `frontend/.qa-screenshots/` (gitignored)

### Routes reviewed

`/`, `/services`, `/contact`, `/login`, `/register`, `/does-not-exist`

`/services/:slug` — no live data (`total: 0`)

### Viewports

320, 375, 430, 768, 1024, 1440

### Modes

EN light, EN dark, AR light, AR dark, reduced-motion

### Overflow

`overflow@320 = 0`

### Screenshots captured (local only)

- `desktop-en-light-home-hero.png`
- `desktop-en-light-home-logo-draw.png`
- `desktop-en-light-home-mid.png`
- `desktop-en-light-services.png`
- `desktop-en-light-contact.png`
- `desktop-en-light-login.png`
- `desktop-en-light-register.png`
- `desktop-en-light-404.png`
- `desktop-en-dark-home.png`
- `desktop-en-dark-reduced-motion-home.png`
- `desktop-ar-light-home.png`
- `desktop-ar-dark-home.png`
- `viewport-320/375/430/768/1024-en-light-home.png`
- `mobile-en-light-nav-open.png`
- `mobile-en-light-services.png`
- `mobile-en-light-contact.png`
- `mobile-ar-dark-home.png`

### Defects found / fixed during redesign

1. SVG gradient ID collisions when multiple marks mount — fixed with `useId`
2. Accidental `puppeteer-core` install into frontend — uninstalled; GSAP retained
3. Logo pin too aggressive on mobile — pin desktop-only via `matchMedia`
4. Missing `.home-hero__actions` flex rule after style edit — restored
5. Brand mark path fidelity improved after first QA pass

## Future Figma / Blender plug-in points

| Design source | Code mapping |
| --- | --- |
| Figma hero frame | `HeroSection` + `home-hero*` tokens |
| Figma section rhythm | `home-section` + narrative order in `HomePage` |
| Blender hero render / GLB | Swap `HeroSculpture` internals; keep `aria-hidden` + reduced-motion static |
| Blender logo turntable | Optional beside `BrandMarkDraw`; keep SVG draw as progressive baseline |
| Figma auth/services frames | `auth-pages.css`, `services-page.css`, `contact.css` |

## Limitations

- Logo SVG is a geometric recreation, not a traced vector export from brand files
- Local services catalog empty — detail page not live-inspected
- CSS 3D is not photoreal WebGL
- Headless screenshots can capture mid-entrance animation if waits are short
- Client/admin intentionally not redesigned

## Verdict

**Public marketing experience upgraded** to a scroll-interactive, CSS-3D, logo-draw narrative with GSAP isolated to the homepage. Presentation requirements (EN/AR, LTR/RTL, light/dark/system, reduced motion, a11y) retained. Backend/schema/data untouched.
