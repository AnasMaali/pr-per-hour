# Chatbot (frontend)

## Feature responsibility

Anas — PR Per Hour's AI assistant. All AI provider calls happen on the
Laravel backend; this feature only ever talks to the PR Per Hour REST API
(`/api/v1/chatbot/...`).

## Status

Implemented behind `VITE_FEATURE_CHATBOT_ENABLED`. Mounted once at the
public layout boundary and the client dashboard layout boundary — never
per-page, never in Admin.

## Structure

- `api/` — thin wrapper over the three Chatbot REST endpoints.
- `types/` — wire types matching the backend contract exactly (no database
  IDs, no provider metadata).
- `state/` — the conversation reducer (`chatReducer`) and the
  identity-aware, sessionStorage-only conversation token store
  (`chatSessionStorage`). A stored token is only reused while the current
  visitor's identity (guest vs a specific signed-in user) still matches.
- `hooks/` — `useChatSession` (the whole conversation lifecycle) and
  `useSmartScroll` (auto-scroll only when already near the bottom).
- `components/` — `AnasChatWidget` (mount point) → `AnasLauncher` (always
  cheap, CSS-only motion) and a lazily-loaded `AnasPanel` (GSAP entrance/
  exit, conversation UI). `AnasHourglass` is the shared signature mark,
  reused in the launcher, the panel header, and the typing indicator.
- `utils/linkify.tsx` — plain-text-first message rendering with safe
  `http(s)` link detection; Anas's replies are never rendered as HTML.

## Notes for future developers

- The frontend must never call an AI provider directly — only the Laravel
  API. Do not add a provider SDK here.
- Quick-action suggestions for service categories are generated from the
  live `usePublicCategoriesQuery` result, not a hardcoded list, so they
  never drift from what Admin has published.
- An authenticated client's conversation and a guest's conversation are
  never allowed to mix: `useChatSession` drops the stored token the
  instant the resolved identity changes.
