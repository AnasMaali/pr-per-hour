# Public homepage

Cinematic scroll-narrative homepage for PR Per Hour.

See [docs/PUBLIC_3D_SCROLL_REDESIGN.md](../../../../docs/PUBLIC_3D_SCROLL_REDESIGN.md), [docs/ADVANCED_PUBLIC_EXPERIENCE.md](../../../../docs/ADVANCED_PUBLIC_EXPERIENCE.md), and [docs/PUBLIC_HOMEPAGE.md](../../../../docs/PUBLIC_HOMEPAGE.md).

## Narrative flow

1. Hero impact (`HeroChamber` floating mark + word fill)
2. Brand logo stroke draw (`LogoDrawSection` + GSAP ScrollTrigger pin/scrub)
3. About → Expertise → Approach → Trusted → Founder → Why
4. Final CTA → Contact

## Motion

- Hero: entrance timeline + desktop pin/scrub
- Logo draw: SVG mask stroke reveal scrubbed to scroll (desktop pin)
- Content sections: scroll-scrubbed reveals via `useHomeSectionScrub`
- Reduced motion: completed mark, no pin/scrub timelines

## Notes

- Logo draw uses SVG stroke reveal scrubbed to scroll
- GSAP is isolated to homepage scroll experiences
- Content order follows PDF §8.1 with logo-draw inserted after hero
- EN/AR localization, RTL/LTR, light/dark/system
