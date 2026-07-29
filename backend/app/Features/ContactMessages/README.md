# ContactMessages

## Feature purpose

Receive and manage contact form submissions from prospective clients and visitors.

## Current status

Backend API implemented (Phase 7). Frontend contact UI not started. Email sending not implemented. Filament not installed.

## Responsibilities

- Public contact message submission (`POST /api/v1/contact-messages`)
- Admin list, details, status update, soft delete, and restore
- English and Arabic API messages
- Validation, authorization, and `throttle:contact` rate limiting

## Explicit non-responsibilities

- Email sending / notifications
- Reply composition or outbound mail
- Chatbot conversations (belongs to Chatbot)
- Bookings or payments
- Attachment uploads, subject field, spam scoring
- Frontend contact page design
- Filament admin UI
- Direct database access from the React frontend
- Schema / migration changes

## Backend components

- Controllers: `PublicContactMessageController`, `AdminContactMessageController`
- Form Requests: store, admin index, update status
- Actions: create, update status, delete, restore
- DTO: `CreateContactMessageData`
- Resources: `ContactMessageReceiptResource`, `ContactMessageResource`
- Policy: `ContactMessagePolicy`
- Model: `ContactMessage` (existing client schema)
- Routes: `routes/api.php`

## Frontend relationship

Consumed later by `frontend/src/features/contact` through REST API calls only.

## Notes for future developers

- Message max length `5000` is an application validation limit on a `TEXT` column.
- Do not auto-mark messages as `read` on GET details.
- Do not store request IP or user agent.
- See [docs/CONTACT_MESSAGES_API.md](../../../../docs/CONTACT_MESSAGES_API.md) and [docs/CONTACT_MESSAGES_SECURITY.md](../../../../docs/CONTACT_MESSAGES_SECURITY.md).
