# Chatbot

## Feature purpose

Future conversational assistant for visitor and client support on the PR Per Hour platform.

## Current status

`scaffolded` — directory and documentation only. Chatbot is **not implemented**.

## Responsibilities (future)

- Accept chatbot messages via backend API
- Orchestrate responses through an isolated provider interface
- Persist conversation metadata as required by product rules

## Explicit non-responsibilities (current and near-term)

- No AI provider integration (no OpenAI, Gemini, Claude, or other vendors)
- No prompt engineering, usage limits, or streaming responses
- No chatbot business logic in this scaffold
- No secrets or API keys in the React frontend
- No frontend chatbot UI implementation in this phase

## Planned backend components

- Controllers (thin)
- Form Requests
- Actions / Services
- Provider interface (future isolation boundary)
- API Resources
- Policies / rate limiting (future)
- Models (as needed)

## Planned frontend relationship

Consumed later by `frontend/src/features/chatbot` through REST API calls only. The frontend must never call AI providers directly.

## Notes for future developers

See `docs/FUTURE_CHATBOT_HANDOFF.md`. Any AI provider must sit behind an interface on the backend. API secrets must never be exposed to React. Prompts, privacy, logging, error handling, and rate limiting remain future work.
