# Frontend Accessibility

Foundation accessibility conventions for PR Per Hour.

Related: [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md), [FRONTEND_APPEARANCE.md](FRONTEND_APPEARANCE.md), [FRONTEND_LOCALIZATION.md](FRONTEND_LOCALIZATION.md)

## Conventions

- Semantic landmarks: `header`, `nav`, `main`, `footer`, `aside`
- Skip-to-content link on every layout shell
- Visible `:focus-visible` styles via `--focus-ring`
- Buttons for actions; links for navigation
- Form controls require visible labels (`Input`, `Textarea`, `Select`)
- `lang` and `dir` always reflect the active locale
- Respect `prefers-reduced-motion` (token transitions + skeleton animation)
- No autoplay motion; no focus traps in foundation shells
- Language and theme switchers expose `role="group"` and `aria-pressed`

## Auth forms

Login/register pages (see [FRONTEND_AUTH_UI.md](FRONTEND_AUTH_UI.md)):

- One H1 per page
- Field errors use `aria-invalid` and `aria-describedby`
- Password visibility toggle has a translated `aria-label`
- Form-level errors use `role="alert"`
- Failed submit focuses the first invalid field or error summary
- Submit is truly disabled while pending

## Client bookings

Booking create/list/details (see [CLIENT_BOOKINGS_UI.md](CLIENT_BOOKINGS_UI.md)):

- Status badges always include visible text
- Cancellation uses an accessible dialog with Escape and focus restore
- Meeting links use descriptive labels and `rel="noopener noreferrer"`
- Pagination and filters are keyboard operable

## Client profile

Profile page (see [CLIENT_PROFILE_UI.md](CLIENT_PROFILE_UI.md)):

- One H1; form fields have explicit labels
- Read-only email uses `readOnly` / `aria-readonly` with a translated hint
- Field errors use `aria-invalid` and `aria-describedby`
- Success feedback uses `aria-live="polite"`
- Save is truly disabled when unchanged or pending

## Admin dashboard

Admin layout/overview (see [ADMIN_DASHBOARD_FOUNDATION.md](ADMIN_DASHBOARD_FOUNDATION.md)):

- Labeled sidebar navigation with `aria-current` on active items
- Mobile drawer uses `aria-expanded`, `aria-controls`, Escape, backdrop, focus restore
- Metric and status text always present (not color-only)
- Section-level error retries are keyboard operable

Admin categories (see [ADMIN_SERVICE_CATEGORIES_UI.md](ADMIN_SERVICE_CATEGORIES_UI.md)):

- One page `h1`; table headers on desktop; card list on small screens
- Create/edit/delete dialogs use `role="dialog"`, `aria-modal`, Escape, backdrop, focus restore
- Form fields use labels, `aria-invalid`, and `aria-describedby`
- Status badges include text (not color-only)
- Success feedback uses `aria-live="polite"`

Admin services (see [ADMIN_SERVICES_UI.md](ADMIN_SERVICES_UI.md)):

- Same dialog and status patterns as categories
- Filters and pagination are keyboard operable
- Price displayed as fixed-decimal text; duration null-safe
- Category select errors are retryable and block submit when required

Admin bookings (see [ADMIN_BOOKINGS_UI.md](ADMIN_BOOKINGS_UI.md)):

- List + details pages each have one `h1`
- Desktop table with headers; mobile cards with labeled fields
- Status / meeting-link / notes dialogs use `role="dialog"`, `aria-modal`, Escape, focus restore
- Status badges always include translated text (not color-only)
- Meeting links open with `rel="noopener noreferrer"`
- Success feedback uses `aria-live="polite"`

Admin contact messages (see [ADMIN_CONTACT_MESSAGES_UI.md](ADMIN_CONTACT_MESSAGES_UI.md)):

- List + details pages each have one `h1`
- Desktop table with headers; mobile cards with labeled fields
- Status / delete dialogs use `role="dialog"`, `aria-modal`, Escape, focus restore
- Message body rendered as plain text (`pre-wrap`); no HTML
- Status badges always include translated text
- Success feedback uses `aria-live="polite"`

Public contact page (see [PUBLIC_CONTACT_PAGE.md](PUBLIC_CONTACT_PAGE.md)):

- One page `h1`; labeled form fields with `aria-invalid` / `aria-describedby`
- Error summary is focusable; first invalid field receives focus after client validation
- Success region uses `role="status"` / `aria-live` and receives focus
- Pending submit disables the button to prevent duplicates

Not-found page:

- Localized title/description via `useDocumentMeta`
- `robots: noindex, nofollow`

Full product review notes: [FULL_PRODUCT_REVIEW.md](FULL_PRODUCT_REVIEW.md).

Advanced public motion notes: [ADVANCED_PUBLIC_EXPERIENCE.md](ADVANCED_PUBLIC_EXPERIENCE.md) — decorative CSS 3D is `aria-hidden`; reduced-motion disables parallax/float/delayed reveals.

Final polish notes: [FINAL_VISUAL_POLISH.md](FINAL_VISUAL_POLISH.md) — Arabic no longer forced to uppercase on eyebrows/footer labels; contact focus uses `--focus-ring`; route transition no longer rests at opacity 0.

## Contrast

- Light and dark semantic tokens target readable body/UI contrast
- Logo mark remains readable on both themes (navy/gold mark on light and dark surfaces)

## Manual checklist for UI changes

- [ ] Keyboard reachability for interactive controls
- [ ] Focus visible
- [ ] EN + AR copy
- [ ] LTR + RTL layout
- [ ] Light + dark themes
- [ ] Reduced motion does not break usability
