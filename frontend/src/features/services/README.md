# Services (frontend)

Public catalog listing and service details.

## Status

Implemented:

- `/services` listing (filters, sort, pagination, URL state)
- `/services/:slug` details
- Auth-aware booking CTA links (no booking mutation)
- EN/AR `services` namespace

Not implemented:

- Booking form / `POST /bookings`
- Admin catalog UI
- Payments

## Structure

```
features/services/
├── api/
├── components/
├── pages/
├── queries/
├── types/
├── utils/
├── styles/
├── index.ts
└── README.md
```

## Docs

See [docs/PUBLIC_SERVICES_UI.md](../../../../docs/PUBLIC_SERVICES_UI.md).
