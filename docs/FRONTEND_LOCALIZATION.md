# Frontend Localization

English / Arabic foundation for the React app.

Related: [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md), [BACKEND_LOCALIZATION.md](BACKEND_LOCALIZATION.md), [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)

## Languages

| Language | Code | Direction | Default |
| --- | --- | --- | --- |
| English | `en` | LTR | Yes (fallback) |
| Arabic | `ar` | RTL | No |

## Persistence and document attributes

- Storage key: `prph.locale`
- On change: `document.documentElement.lang` and `dir` update
- Initial resolution: saved preference → browser language → `en`
- Inline bootstrap in `index.html` applies lang/dir before React mounts

## Resources

Namespaces under `frontend/src/shared/i18n/locales/{en,ar}/`:

- `common`, `navigation`, `auth`, `errors`
- `home`, `footer`, `services`, `contact`
- `bookings`, `profile`
- `admin`, `adminCategories`, `adminServices`, `adminBookings`, `adminContactMessages`

Rules:

- No hardcoded user-facing strings in components
- Missing keys fall back to English
- Prefer CSS logical properties for layout

## API locale

The Axios client sends `X-Locale` matching the active UI language so Laravel returns localized messages.

## Unresolved (unchanged)

- Locale URL / SEO routing strategy is **not** chosen in this phase
- Dynamic catalog DB translations remain unavailable without schema approval
