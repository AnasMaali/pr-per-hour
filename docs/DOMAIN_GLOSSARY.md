# Domain Glossary

Normalized terms for PR Per Hour. Definitions follow `PR_Per_Hour_Decu.pdf` unless noted.

## guest

- **Definition:** Unauthenticated website visitor.
- **Owning feature:** Public Website / Auth boundary.
- **Database relevance:** No user row required; may appear in chatbot via visitor fields.
- **API relevance:** Public endpoints only.
- **Frontend relevance:** Public pages, contact form, chatbot widget.
- **Possible ambiguity:** “Guest” is a persona, not a stored `role` value.

## client

- **Definition:** Registered user with `role=client` who can book services.
- **Owning feature:** Users / Auth / Bookings.
- **Database relevance:** `users.role = client`.
- **API relevance:** Authenticated booking and profile endpoints.
- **Frontend relevance:** Login/register, booking, client dashboard.
- **Possible ambiguity:** Not a paying customer by default in V1 (no online payment).

## admin

- **Definition:** Staff operator with `role=admin`.
- **Owning feature:** Users / Admin Dashboard.
- **Database relevance:** `users.role = admin`.
- **API relevance:** `/api/admin/*` or Filament panel access.
- **Frontend relevance:** Admin UI (Filament recommended) — not public signup.
- **Possible ambiguity:** Must never be creatable via public registration.

## service category

- **Definition:** Top-level grouping of services (e.g., Strategic Communication).
- **Owning feature:** ServiceCategories.
- **Database relevance:** `service_categories`.
- **API relevance:** Public list/detail; admin CRUD.
- **Frontend relevance:** Expertise section and services browsing.
- **Possible ambiguity:** Homepage “expertise cards” may mirror categories but can start static.

## service

- **Definition:** Bookable consultancy offering belonging to one category.
- **Owning feature:** Services.
- **Database relevance:** `services`.
- **API relevance:** Public list/detail; admin CRUD.
- **Frontend relevance:** Services list/details; booking entry.
- **Possible ambiguity:** Having a `price` does not mean checkout exists in V1.

## consultation

- **Definition:** Business term for advisory session/request; often realized as a bookable service and/or booking record.
- **Owning feature:** Services / Bookings / Chatbot (initial free consultation path).
- **Database relevance:** Typically a `services` row and/or `bookings` row; not a separate table in V1 schema.
- **API relevance:** Booking and service endpoints.
- **Frontend relevance:** “Request a Consultation” CTA and booking page.
- **Possible ambiguity:** Not a distinct DB entity; do not create a `consultations` table unless later approved.

## booking

- **Definition:** Client request to schedule a service at a date/time.
- **Owning feature:** Bookings.
- **Database relevance:** `bookings`.
- **API relevance:** Client and admin booking endpoints.
- **Frontend relevance:** Booking form and client booking view.
- **Possible ambiguity:** “Consultation request” and “booking” are used interchangeably in the PDF flow.

## booking status

- **Definition:** Lifecycle state of a booking.
- **Owning feature:** Bookings.
- **Database relevance:** `bookings.status`.
- **API relevance:** Created as `pending`; admin updates thereafter.
- **Frontend relevance:** Status labels in client/admin views.
- **Possible ambiguity:** V1 values are only `pending`, `confirmed`, `completed`, `cancelled`. Never `paid`.

## contact message

- **Definition:** One-shot form submission from the contact section/page.
- **Owning feature:** ContactMessages.
- **Database relevance:** `contact_messages`.
- **API relevance:** `POST /api/contact` + admin message endpoints.
- **Frontend relevance:** Contact form.
- **Possible ambiguity:** Not a chatbot conversation.

## chatbot conversation

- **Definition:** Interactive chat session for initial free consultation support.
- **Owning feature:** Chatbot.
- **Database relevance:** `chat_conversations`.
- **API relevance:** Conversation create/list (admin) endpoints.
- **Frontend relevance:** Chatbot widget.
- **Possible ambiguity:** May belong to a user or guest visitor fields.

## chatbot message

- **Definition:** Single message inside a chatbot conversation.
- **Owning feature:** Chatbot.
- **Database relevance:** `chat_messages`.
- **API relevance:** Message create endpoints; admin conversation detail.
- **Frontend relevance:** Chat transcript UI.
- **Possible ambiguity:** `sender` may be user/bot/admin/consultant; bot replies do not imply a production AI provider is integrated.

## payment attempt

- **Definition:** Future record of an attempt to pay for a booking.
- **Owning feature:** Payments (future business; schema-only in V1).
- **Database relevance:** `payments` (one booking may have many attempts later).
- **API relevance:** Future only; do not implement V1 payment routes.
- **Frontend relevance:** None in V1.
- **Possible ambiguity:** Presence of table ≠ payment feature enabled.

## invoice

- **Definition:** Future billing document linked to a booking.
- **Owning feature:** Invoices (future business; schema-only in V1).
- **Database relevance:** `invoices` (unique per booking in schema).
- **API relevance:** Future only.
- **Frontend relevance:** None in V1.
- **Possible ambiguity:** Schema readiness is not invoice generation.

## meeting link

- **Definition:** Optional URL for an online meeting associated with a booking.
- **Owning feature:** Bookings.
- **Database relevance:** `bookings.meeting_link`.
- **API relevance:** Set/updated typically by admin.
- **Frontend relevance:** Shown to client when present.
- **Possible ambiguity:** Not calendar sync; just a stored link.

## active service

- **Definition:** Service with `is_active = true`, visible/bookable on the public site.
- **Owning feature:** Services.
- **Database relevance:** `services.is_active`.
- **API relevance:** Public queries filter active records.
- **Frontend relevance:** Appears in listings.
- **Possible ambiguity:** Active does not imply paid or unpaid; payment is separate/future.

## inactive service

- **Definition:** Service with `is_active = false`, hidden from public availability.
- **Owning feature:** Services.
- **Database relevance:** `services.is_active`.
- **API relevance:** Excluded from public list/detail.
- **Frontend relevance:** Not shown publicly; still manageable in admin.
- **Possible ambiguity:** Soft-deleted (`deleted_at`) is different from inactive.
