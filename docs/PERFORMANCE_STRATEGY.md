# Performance Strategy

Performance is a **mandatory** non-functional requirement for PR Per Hour.

Related: [PROJECT_SCOPE.md](PROJECT_SCOPE.md), [DECISIONS.md](DECISIONS.md) ADR-016, [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [THEME_STRATEGY.md](THEME_STRATEGY.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## Guiding principles

- Functional stability comes before advanced animation.
- Visual ambition must not make the website unusable on average devices.
- Accessibility and performance fallbacks are mandatory.
- Measure before and after adding heavy motion.
- Establish measurable performance budgets later — do **not** invent guaranteed scores now.
- Test mobile performance, not only desktop.
- Verify performance in RTL and LTR, and in light and dark themes.

## Frontend performance principles

- Use route-level code splitting.
- Lazy load below-the-fold sections where appropriate.
- Load animation and 3D libraries only on pages that require them.
- Do not include heavy libraries in the initial bundle without justification.
- Prefer CSS for simple interactions.
- Use GSAP, Framer Motion, or Three.js only when they provide clear value.
- Avoid loading both overlapping animation systems for the same responsibility.
- Optimize images using modern formats such as WebP or AVIF.
- Provide responsive image sizes.
- Set explicit image dimensions to avoid layout shift.
- Lazy load non-critical media.
- Preload only critical fonts and assets.
- Reduce font weights and variants.
- Avoid autoplaying large videos on mobile.
- Provide lower-cost mobile motion alternatives.
- Respect `prefers-reduced-motion`.
- Pause offscreen or hidden animations.
- Avoid unnecessary React re-renders.
- Cache API data appropriately.
- Use skeletons only when they improve perceived performance.
- Do not hide slow operations behind excessive animation.

## Backend performance principles

- Use pagination for list endpoints.
- Prevent N+1 queries.
- Select only required columns where useful.
- Use database indexes based on real query paths.
- Use caching only after identifying safe cache boundaries.
- Use queues for email and heavy external tasks.
- Add rate limiting.
- Avoid unnecessary API payload fields.
- Use API Resources.
- Configure production route, config, event, and view caching when applicable.
- Never cache private user data incorrectly.

## Animation and WebGL performance rules

- Motion must communicate hierarchy or interaction.
- Decorative motion must be removable without breaking usability.
- 3D content must use lazy initialization.
- WebGL must not be required to access content.
- Provide static or lightweight fallback if WebGL fails.
- Limit simultaneous active animations.
- Clean up animation listeners and contexts when components unmount.
- Scroll animations must avoid layout thrashing.
- Prefer transforms and opacity for animation.
- Mobile experiences may use simplified animations.
- Never block navigation while waiting for an intro animation.
- Intro animations should be skippable and should not replay unnecessarily.
- Motion work occurs only after functional pages pass performance checks.

## Asset optimization

- Prefer modern image formats (WebP/AVIF) with sensible fallbacks when needed.
- Responsive `srcset` / sizes (or equivalent) for large visuals.
- Explicit width/height (or aspect-ratio) to reduce CLS.
- Lazy-load non-critical images and media.
- Keep font families/weights minimal; preload only critical faces.

## Caching boundaries

- Cache public, non-personalized responses only when safe.
- Do not cache authenticated private booking/user payloads in shared public caches.
- Invalidate or version caches when content changes.
- Frontend API caching must respect auth and locale where relevant.

## Loading-state guidance

- Prefer honest loading indicators for slow network work.
- Skeletons are allowed when they improve perceived performance.
- Do not use long decorative animations to mask poor API performance.
- Errors must remain readable in both themes and both languages.

## Performance testing plan (future verification targets)

Do not invent guaranteed scores at this stage. When implementation advances, review:

- Core Web Vitals
- Lighthouse for representative public pages
- Initial JavaScript bundle size
- Image weight
- Network throttling tests
- CPU throttling tests
- RTL and LTR performance checks
- Light and dark theme checks
- Reduced-motion checks
- Mobile device/emulation checks

## Future performance budgets

Budgets will be set later with measured baselines. Until then:

- Justify every heavy frontend dependency in the PR/report
- Report bundle and performance impact when adding major dependencies
- Avoid unrelated performance refactoring without measurements

## Rules for dependency approval

- Prefer zero new heavy dependency when CSS or lighter APIs suffice
- One library per responsibility (do not stack overlapping animation systems)
- Lazy-load 3D and heavy motion code
- Provide reduced-motion and WebGL fallbacks when those technologies are used
- Localization and theme foundations must not require shipping unused animation stacks

## Backend API foundation notes (Phase 2)

The Laravel API foundation intentionally avoids:

- Third-party modular packages
- External localization packages beyond Laravel translations
- Database work in locale/request-id middleware
- Caching without a concrete use case
- Unnecessary service container bindings

Future production commands (document only until deployment):

```text
php artisan config:cache
php artisan route:cache
php artisan event:cache
```
