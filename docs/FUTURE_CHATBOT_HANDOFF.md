# Future Chatbot Handoff

## Current state

The Chatbot feature is **not implemented** as an AI product.

Present today:

- Scaffold directories and conversation/message **models/migrations** matching `PR_Per_Hour_SQL.txt`
- Requirements documented in project docs
- Decision record: [DECISIONS.md](DECISIONS.md) ADR-011

No AI provider is integrated. No production chatbot responses are guaranteed.

## Version 1 preparation (allowed later)

When the chatbot foundation phase runs, it may include:

- Module structure
- Provider contracts / interface
- DTOs
- Database schema (`chat_conversations`, `chat_messages`)
- Placeholder UI widget
- Conversation and message storage foundation
- Admin conversation viewing foundation
- Developer handoff documentation

## PDF vs project ownership

`PR_Per_Hour_Decu.pdf` §14.1 describes a simple V1 chatbot that may use predefined or basic AI-generated answers.

**Current project rule (mandatory for agents):** do not implement OpenAI, Gemini, Claude, or any production AI provider without an approved provider specification. Treat AI integration as future work behind an isolated backend interface.

## Rules for future provider implementation

- Isolate provider integration behind a backend interface
- API secrets must **never** be exposed to React
- React may talk only to the Laravel REST API
- Do not call AI vendors directly from the browser

## Explicitly deferred / excluded from current delivery

- OpenAI / Gemini / Claude integrations
- Prompt engineering productization
- Knowledge base / vector database
- Streaming responses
- Usage billing
- AI moderation implementation
- Production AI response quality guarantees
- Lead scoring, admin takeover, advanced training (PDF §14.2 future list)

## Suggested isolation shape (guidance only)

- `ChatbotProvider` interface
- One concrete adapter per vendor
- Actions/Services depend on the interface, not the vendor SDK

See also: [FUTURE_PAYMENT_HANDOFF.md](FUTURE_PAYMENT_HANDOFF.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) Phase 16.

## Presentation requirements for the placeholder

The chatbot placeholder (when built) must support English and Arabic, LTR and RTL, and light and dark themes. AI provider integration remains out of scope until approved.
