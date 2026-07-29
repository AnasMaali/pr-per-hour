# Localization Strategy

Mandatory Version 1 requirement for the public website and client-facing application.

Related: [PROJECT_SCOPE.md](PROJECT_SCOPE.md), [DECISIONS.md](DECISIONS.md) ADR-014, [THEME_STRATEGY.md](THEME_STRATEGY.md), [PERFORMANCE_STRATEGY.md](PERFORMANCE_STRATEGY.md)

## Supported languages

| Language | Code (planned) | Direction | Scope |
| --- | --- | --- | --- |
| English | `en` | LTR | Public + client-facing (mandatory) |
| Arabic | `ar` | RTL | Public + client-facing (mandatory) |

- English is the **default fallback** language unless later approved otherwise.
- Admin localization is **optional** unless later approved.
- Public and client-facing localization is **mandatory**.

## RTL / LTR behavior

- English uses LTR layout (`dir="ltr"`).
- Arabic uses RTL layout (`dir="rtl"`).
- Layouts, icons, directional arrows, spacing, and animations must work correctly in both directions.
- Prefer CSS logical properties (`inline-start`, `margin-inline`, etc.) over physical left/right where appropriate.
- Never assume LTR-only layout in components or shared styles.

## Translation resource ownership

- All user-facing **static** text must come from translation resources.
- Do **not** hardcode visible text directly across React components.
- Feature-owned copy should live with clear ownership (shared dictionaries vs feature namespaces) once a library is chosen.
- Do **not** choose a translation library in this documentation phase.

## Static text rules

- Buttons, labels, nav, empty states, errors shown in UI, and marketing section copy must be localizable.
- Placeholders and aria-labels that are user-facing must be localizable.
- Developer-only console logs are exempt.

## Dynamic database content options

Dynamic content such as services and categories must have an approved localization strategy before domain UI claims translated catalog content. Candidate approaches (unresolved / **not authorized by current client SQL**):

1. Parallel translated columns (e.g. `title_en`, `title_ar`) — **requires client schema approval**
2. JSON translation columns per field — **requires client schema approval**
3. Separate translation tables keyed by locale — **requires client schema approval; not present in `PR_Per_Hour_SQL.txt`**
4. External CMS/content source with locale variants

**Current approved decision:** bilingual frontend and API messages are supported **without** changing the client-supplied database schema. Service/category rows store the supplied English fields only. Do not claim dynamic service content is translated in the database.

Until a schema change is approved, document any temporary English-only catalog content as matching the client SQL.

## API message localization considerations

- Validation messages and API-facing user messages must be localizable.
- Backend should prepare locale-awareness (Accept-Language / explicit locale header / query) during API foundation without translating every domain feature yet.
- API Resources should be designed so localized fields can be returned without breaking clients.
- Do not leak internal exception text as the only user-facing message.

## Locale persistence

- The user can switch language from the UI.
- The selected language must persist between visits (e.g. local storage / cookie — exact mechanism unresolved).
- The application may initially detect the browser language when no saved preference exists.
- Fallback order: saved preference → browser detection (if used) → English.

## Fallback behavior

- Missing translation keys fall back to English.
- Missing dynamic locale content should fall back to English (or a documented empty/safe state) without crashing the UI.
- Do not silently show raw translation keys in production if avoidable.

## SEO considerations

- SEO metadata must support both languages.
- Arabic and English routes must use **one documented strategy later**.
- Do **not** choose or implement the routing strategy in this documentation phase (options may include locale prefixes, subdomains, or query/state-only with hreflang — unresolved).

## Testing checklist

- [ ] Switch EN ↔ AR from UI
- [ ] Preference persists across reload
- [ ] Browser language detection works when no preference is saved
- [ ] English fallback when a key is missing
- [ ] LTR layout correct for English
- [ ] RTL layout correct for Arabic
- [ ] Icons/arrows/spacing/animations correct in both directions
- [ ] Forms, validation messages, and empty states localized
- [ ] Services/categories follow approved dynamic localization strategy
- [ ] SEO metadata present for both languages (once routing strategy is chosen)
- [ ] Chatbot placeholder supports both languages
- [ ] Client dashboard supports both languages
- [ ] Future payment UI (if ever approved) supports both languages

## Unresolved decisions

- Translation library / toolchain (frontend) — **resolved for foundation:** i18next + react-i18next
- Exact persistence mechanism — **resolved for foundation:** `localStorage` (`prph.locale`)
- Locale routing / URL strategy — still unresolved
- Dynamic content localization schema — still unresolved / not authorized by client SQL
- Whether authenticated users sync locale to the backend profile — unresolved
- Admin panel localization scope — optional unless approved
- Exact BCP-47 locale tags beyond `en` / `ar` (e.g. `en-US`, `ar-SA`) — foundation uses `en` / `ar`

## Backend foundation status

Phase 2 implemented request locale resolution for the API:

- Supported: `en`, `ar`
- Priority: `X-Locale` → `Accept-Language` → fallback `en`
- Response header: `Content-Language`
- Shared API messages: `backend/lang/{en,ar}/api.php`

Phase 3 confirmed the client SQL schema has **no locale/translation columns or tables**. Frontend bilingual support does not authorize schema changes.

See [BACKEND_LOCALIZATION.md](BACKEND_LOCALIZATION.md), [API_STANDARDS.md](API_STANDARDS.md), and [CLIENT_SCHEMA_PARITY.md](CLIENT_SCHEMA_PARITY.md).
