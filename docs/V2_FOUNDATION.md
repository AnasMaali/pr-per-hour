# PR Per Hour — Version 2 Foundation

## Purpose

Version 2 extends the existing stable Version 1 system.

V2 must build on top of the current architecture instead of rebuilding or replacing working V1 functionality.

The V2 branch is:

develop-v2

The stable Version 1 baseline is tagged as:

v1-stable-baseline

---

## Core Rules

1. Existing V1 functionality must remain backward-compatible.

2. Do not modify stable V1 behavior unless a V2 requirement explicitly requires it.

3. New V2 features must be added as isolated modules whenever possible.

4. Do not create database tables for speculative features.

5. A future feature must be discussed and approved before implementation begins.

6. Existing database foundations should be reused before creating replacements.

7. Existing Payments and Invoices tables and models must be extended, not recreated.

8. Database changes must always be introduced through new migrations.

9. Never edit an already deployed V1 migration to implement a V2 feature.

10. Every V2 module must include appropriate automated tests.

11. New features should be disabled or unreachable until their implementation is complete.

12. Production deployment must not happen directly from develop-v2.

---

## Current Stable V1 Modules

- Authentication
- Email verification and password recovery
- Users
- Service Categories
- Services
- Bookings
- Contact Messages
- Admin Dashboard
- Basic Chatbot data structure
- Payments database foundation
- Invoices database foundation

---

## Existing Future-Ready Foundations

### Payments

Current state:

- Database table exists
- Model exists
- Booking relationship exists
- No active payment business flow yet

### Invoices

Current state:

- Database table exists
- Model exists
- Booking relationship exists
- No active invoice business flow yet

These foundations must be reused if the modules are activated in V2.

---

## Possible V2 Modules

The following modules are possibilities only.

They are NOT automatically part of Version 2.

- Payments
- Invoices
- Consultants
- Advanced Scheduling
- Roles and Permissions
- CRM
- Leads
- Coupons and Discounts
- Advanced Chatbot
- Knowledge Base
- Analytics
- CMS
- Blog
- Notifications
- Other future business modules

Each module must be discussed before implementation.

---

## Module Lifecycle

Every new V2 module should move through these stages:

PROPOSED
→ APPROVED
→ FOUNDATION
→ DEVELOPMENT
→ TESTING
→ READY
→ RELEASED

A proposed module should not modify production behavior.

---

## Development Workflow

Stable production branch:

main

Version 2 development branch:

develop-v2

For larger V2 modules, create a dedicated branch from develop-v2.

Example:

develop-v2
└── feature/v2-payments

After implementation and testing:

feature/v2-payments
→ develop-v2

Only after V2 is approved for release:

develop-v2
→ main

---

## Testing Baseline

Before V2 development started:

Backend:
153 tests passed
1222 assertions

Frontend:
TypeScript typecheck passed
Production build passed

Any V2 change should preserve the existing baseline unless the related behavior is intentionally changed.

---

## Database Rule

Do not modify existing V1 migrations for V2 changes.

Example:

Wrong:

Editing:

2026_07_10_120002_create_bookings_table.php

Correct:

Create a new migration such as:

2026_xx_xx_xxxxxx_add_consultant_id_to_bookings_table.php

This keeps upgrades and deployments safe.

---

## V2 Principle

Build only what the business needs.

Prepare the architecture for growth, but do not implement unnecessary complexity before a feature is approved.

---

## Scalability First

All Version 2 architecture must be designed for future change.

A current business rule must not be hard-coded as a permanent architectural limitation.

For example:

Current:
- One shared booking calendar

Possible future:
- Multiple consultants
- Multiple calendars
- Consultant-specific availability
- Service-specific resources
- External calendar integrations

The initial implementation should remain simple while keeping clear extension points for future requirements.

---

## Database Completeness Rule

During V2 development, the existing database schema must be reviewed continuously.

If a missing table, relationship, column, index, or domain entity is discovered:

1. Explain why it is needed.
2. Explain what problem it solves.
3. Explain how it relates to the existing schema.
4. Consider future scalability.
5. Obtain approval before adding it.
6. Implement the change through a new migration.

Do not avoid a necessary database improvement simply to preserve the original V1 schema.

At the same time, do not add speculative database structures without a real requirement.

The goal is:

Simple now.
Correct now.
Expandable later.
