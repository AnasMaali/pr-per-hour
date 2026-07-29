# Frontend Appearance

Light / dark / system theme foundation.

Related: [THEME_STRATEGY.md](THEME_STRATEGY.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md)

## Modes

| Preference | Behavior |
| --- | --- |
| `light` | Force light tokens |
| `dark` | Force dark tokens |
| `system` | Follow `prefers-color-scheme` (default on first visit) |

## Persistence and flash prevention

- Storage key: `prph.theme`
- Inline script in `index.html` sets `data-theme` and `data-theme-preference` before paint
- `ThemeProvider` keeps preference in sync and listens for system changes when preference is `system`

## Tokens

Defined in `frontend/src/shared/styles/tokens.css`.

Brand direction from `LOGO.jpeg` / `LOGO2.jpeg`:

| Token role | Approximate source |
| --- | --- |
| Primary (light) | Navy `#001F5C` |
| Accent / gold | `#C59112` |
| Dark primary | Soft gold on deep navy surfaces |

Semantic variables cover background, surface, elevated surface, text, muted text, border, primary, accent, success, warning, danger, focus ring, spacing, radius, shadow, typography, content widths, and transitions.

Public cinematic redesign also uses:

| Token | Role |
| --- | --- |
| `--shadow-depth` | Layered depth shadows |
| `--color-volume` | Volumetric / atmospheric surface tint |
| `--ease-cinematic` | Scroll/entrance easing curve |

See [PUBLIC_3D_SCROLL_REDESIGN.md](PUBLIC_3D_SCROLL_REDESIGN.md). Earlier glass/glow tokens (`--color-glass`, `--color-glow`, `--color-depth`, `--shadow-glow`) remain from the advanced public experience checkpoint.

Components must consume semantic tokens — not raw brand hex values.

## Control

`ThemeSwitcher` is keyboard accessible and localized.
