# Shared Motion

Public-facing motion primitives for PR Per Hour.

## Principles

- Transform and opacity only for reveals
- Respect `prefers-reduced-motion`
- Native scrolling — no scroll-jacking
- GSAP + ScrollTrigger only for homepage scroll choreography / logo draw
- Admin and client dashboards must not depend on GSAP

## Exports

| Export | Role |
| --- | --- |
| `useReducedMotion` | Tracks reduced-motion preference |
| `useInView` | IntersectionObserver reveals |
| `usePointerParallax` | Pointer → `--parallax-x/y` |
| `useScrollProgress` | Document scroll 0–1 |
| `useSectionProgress` | Element-relative scroll 0–1 |
| `Reveal` / `StaggerGroup` | Section/card reveals |
| `RouteTransition` | Public route enter |

## GSAP isolation

`shared/motion/gsap/registerGsap.ts` registers ScrollTrigger once.

Import GSAP only from public homepage scroll experiences so the `gsap` chunk stays out of admin/client routes unless they share that graph (they should not).

## Reduced motion

- Reveals appear immediately
- Parallax disabled
- Logo draw shows the completed mark
- GSAP timelines are not created
