# Chatbot (frontend)

## Feature responsibility

Future UI for conversational support. All AI provider calls must go through the Laravel backend.

## Foundation status

- Feature boundary retained
- Chatbot UI and AI provider SDKs are **not** implemented

## Expected API integration

Call Laravel Chatbot REST endpoints only. Never call AI providers from the browser.

See `docs/FUTURE_CHATBOT_HANDOFF.md`.
