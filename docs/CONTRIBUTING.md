# Contributing

## Principles

- Keep changes scoped to the requested feature or fix.
- No unrelated modifications.
- No broad refactoring without justification.
- Every implementation must include verification (tests and/or build checks as appropriate).

## How to add a new backend feature

1. Create `backend/app/Features/YourFeature/`.
2. Add a `README.md` covering purpose, status, responsibilities, non-responsibilities, planned components, frontend relationship, and notes.
3. Implement Controllers, Form Requests, Actions/Services, API Resources, Policies, and Models only when needed.
4. Keep controllers thin; put validation in Form Requests and business logic in Actions/Services.
5. Update `docs/FEATURE_STATUS.md`.
6. Add or update API routes under the Laravel routing conventions used by the project.
7. Verify with `php artisan test` (and any feature-specific checks).

## How to add a new frontend feature

1. Create `frontend/src/features/your-feature/` (kebab-case folder name).
2. Add `README.md` and `index.ts` (public exports).
3. Place feature components, hooks, and API clients inside that feature folder.
4. Use `frontend/src/shared` only for truly cross-feature utilities and UI primitives.
5. Call Laravel REST endpoints only; never access the database from React.
6. Update `docs/FEATURE_STATUS.md`.
7. Verify with `npm run build`.

## Required documentation

- Feature `README.md` for every new feature folder
- Status update in `docs/FEATURE_STATUS.md`
- Architecture or handoff doc updates when boundaries change

## Code review expectations

- Change is scoped and justified
- Naming follows `docs/NAMING_CONVENTIONS.md`
- No secrets committed
- No feature-specific logic dumped into `shared/`
- Controllers remain thin on the backend
- Verification evidence is included (test/build output or clear manual checklist)

## Out of scope reminders

Do not implement Chatbot AI providers, payment gateways, or invoice generation unless that work is explicitly requested and documented.
