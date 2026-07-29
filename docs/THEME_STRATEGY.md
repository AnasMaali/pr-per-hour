# Theme Strategy

Mandatory Version 1 requirement for the public website and client-facing application.

Related: [PROJECT_SCOPE.md](PROJECT_SCOPE.md), [DECISIONS.md](DECISIONS.md) ADR-015, [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md)

## Supported modes

| Mode | Behavior |
| --- | --- |
| Light | Explicit light theme |
| Dark | Explicit dark theme (intentionally designed, not simple inversion) |
| System | Follows `prefers-color-scheme` |

## Persistence behavior

- On first visit, use **system preference** unless a saved preference exists.
- Manual user selection (light or dark) must persist between visits.
- Exact persistence mechanism is unresolved (localStorage / cookie / profile sync).
- Theme support must remain available alongside language switching (EN/AR, LTR/RTL).

## Design-token requirements

- All design tokens must support both themes.
- Components must **not** use scattered hardcoded theme colors.
- Use shared tokens for surfaces, text, borders, focus, success/error/warning, overlays, and elevation.
- Feature components consume tokens; they do not invent one-off hex values for themeable UI.

## Startup flash prevention

- No visible theme flash should occur during application startup.
- Theme must be resolvable before first paint where practical (e.g. early inline script / class on `html` — implementation unresolved).
- Do not choose a theme library in this documentation phase.

## Accessibility and contrast

- Theme support must be accessible.
- Focus states, contrast, forms, cards, overlays, loading states, and error states must work in both modes.
- Dark mode must meet intentional contrast targets; do not rely on CSS `filter` inversion of the whole page.

## Media and logo handling

- Logo variants and media assets must remain readable in both themes.
- Provide light/dark logo variants or a single logo proven readable on both backgrounds.
- Motion and 3D backgrounds must remain performant and readable in both themes.
- Decorative media must not reduce text contrast below usable levels.

## Testing checklist

- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly
- [ ] System mode follows OS preference on first visit
- [ ] Manual selection persists across reload
- [ ] No theme flash on cold start
- [ ] Focus, forms, cards, overlays, loading, and error states work in both modes
- [ ] Logos/media readable in both modes
- [ ] Tokens cover both themes; no scattered hardcoded theme colors in features
- [ ] Works with English LTR and Arabic RTL
- [ ] Chatbot placeholder supports both themes
- [ ] Client dashboard supports both themes
- [ ] Future payment UI (if ever approved) supports both themes
- [ ] Motion/3D (when added) remains readable and performant in both themes

## Unresolved implementation decisions

- Theme library vs custom token system — **resolved for foundation:** custom CSS tokens (`data-theme`)
- Persistence mechanism — **resolved for foundation:** `localStorage` (`prph.theme`); cross-device sync still unresolved
- Exact token naming and file structure — **resolved for foundation:** `frontend/src/shared/styles/tokens.css`
- Strategy for early theme bootstrap — **resolved for foundation:** inline script in `index.html`
- Whether system mode remains selectable after a manual override (restore-system control) — yes via ThemeSwitcher
- Asset pipeline for dual-theme logos/illustrations — deferred; single logo mark used for now
