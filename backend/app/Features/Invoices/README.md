# Invoices

## Feature purpose

Future invoice generation and delivery for completed or payable bookings.

## Current status

`scaffolded` — directory and documentation only. Invoices are **not implemented**.

## Responsibilities (future)

- Generate invoice records linked to bookings/payments
- Expose invoice metadata to authorized users via API
- Support downloadable invoice artifacts when product requires them

## Explicit non-responsibilities (current and near-term)

- No invoice generation
- No PDF generation
- No invoice API
- No accounting system integration
- No tax calculation engine
- No frontend invoice UI in this phase

## Planned backend components

- Controllers (thin)
- Form Requests
- Actions / Services
- API Resources
- Policies
- Models (as needed)
- Optional PDF/export adapters (future)

## Planned frontend relationship

Consumed later by client-dashboard (and staff tools) through REST API calls only.

## Notes for future developers

Keep invoice generation separate from payment gateway code. Do not implement PDF or accounting features until requirements are defined. Prefer explicit Actions for create/issue/void flows.
