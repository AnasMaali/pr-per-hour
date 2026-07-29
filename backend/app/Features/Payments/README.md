# Payments

## Feature purpose

Future payment processing for booked consultancy services.

## Current status

`scaffolded` — directory and documentation only. Payments are **not implemented**. No provider has been selected.

## Responsibilities (future)

- Initiate payment intents / checkout sessions via a gateway interface
- Verify webhooks and update payment state on the backend
- Expose payment status to authorized clients through the API

## Explicit non-responsibilities (current and near-term)

- No payment gateway SDK or checkout flow
- No webhook endpoints or signature verification yet
- No payment API implementation
- No trust of payment success from frontend redirects
- No refunds, taxes, discounts, or accounting logic
- No secrets in the React frontend

## Planned backend components

- Controllers (thin)
- Form Requests
- Actions / Services
- Gateway interface (future isolation boundary)
- Webhook handlers (future)
- API Resources
- Policies
- Models (as needed)

## Planned frontend relationship

Frontend may later trigger payment start and display status via REST API only. Gateway secrets and webhook verification stay on the backend.

## Notes for future developers

See `docs/FUTURE_PAYMENT_HANDOFF.md`. Isolate gateway code behind an interface. Never trust frontend redirects for payment state. Webhook verification is mandatory when implemented.
