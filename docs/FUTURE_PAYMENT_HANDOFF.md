# Future Payment Handoff

## Current state

Payment is **not implemented**. Invoice generation is **not implemented**.

No payment provider has been selected.

Present today:

- Exact client SQL tables/models for `payments` and `invoices` (schema/foundation only)
- Scaffold directories under `backend/app/Features/Payments/` and `backend/app/Features/Invoices/`
- Requirements and decision records documenting V1 exclusions

See [CLIENT_SCHEMA_PARITY.md](CLIENT_SCHEMA_PARITY.md).

## Version 1 boundary (mandatory)

From `PR_Per_Hour_Decu.pdf` §1, §12, §13:

- Payment and invoice **database preparation may exist** later (tables only)
- Business functionality is **not** part of Version 1
- Provider selection is **not** part of Version 1
- No frontend or admin payment flow
- No invoice generation, PDF invoices, invoice frontend, or invoice admin screens
- No taxes, discounts, refunds, or accounting features

Booking statuses must not use `paid` in Version 1.

## Rules for future payment implementation

- Isolate gateway code behind a backend interface
- Webhook verification is **mandatory** when webhooks are implemented
- Payment states must **not** be trusted from frontend redirects
- Secrets stay on the backend
- React may only call Laravel REST endpoints

## Future payment reference (not V1)

Statuses: `pending`, `paid`, `failed`, `cancelled`, `refunded`  
Methods (examples): `card`, `bank_transfer`, `cash`, `wallet`

Do **not** implement these endpoints in Version 1 (PDF §20.7):

- `POST /api/payments`
- `GET /api/payments/{id}`
- `POST /api/payments/webhook`
- `GET /api/admin/payments`

## Future invoice reference (not V1)

Statuses: `unpaid`, `paid`, `cancelled`  
Future improvements may include PDF generation, taxes, discounts, invoice items, automatic email.

Do **not** implement these endpoints in Version 1 (PDF §20.8):

- `GET /api/invoices`
- `GET /api/invoices/{id}`
- `POST /api/admin/invoices`
- `GET /api/invoices/{id}/pdf`

## Suggested isolation shape (guidance only)

- `PaymentGateway` interface
- Provider adapters
- Server-side webhook verification before state transitions
- Explicit Actions for initiate/confirm/fail/refund

See also: [FUTURE_CHATBOT_HANDOFF.md](FUTURE_CHATBOT_HANDOFF.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) Phase 17.

## Presentation requirements if UI is later approved

Any future payment or invoice **UI** must support English, Arabic, LTR, RTL, light, and dark themes per [LOCALIZATION_STRATEGY.md](LOCALIZATION_STRATEGY.md) and [THEME_STRATEGY.md](THEME_STRATEGY.md). This does not authorize implementing payment/invoice business features in Version 1.
