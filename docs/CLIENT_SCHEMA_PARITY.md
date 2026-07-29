# Client Schema Parity

## Authoritative source

**`PR_Per_Hour_SQL.txt` is authoritative.**

The Laravel database structure must match that file exactly.

## Hard rules

- The schema must not be changed without written client approval.
- No translation tables were added.
- No framework-convenience columns were added to client tables (`email_verified_at`, `remember_token`, locale columns, metadata, etc.).
- New business requirements requiring schema changes need a separate approved change request.
- Frontend bilingual support does **not** automatically authorize database changes.

## Approved localization decision

Bilingual frontend and API messages will be supported without changing the client-supplied database schema at this stage.

Dynamic service/category content is **not** translated in the database. English content is stored in the supplied columns (`name`, `title`, `description`, etc.).

## Parity coverage

Automated tests in `tests/Feature/Database/ClientSchemaParityTest.php` verify:

- Exact nine domain tables
- Exact column-name sets per table
- Absence of unauthorized tables/columns
- Unique constraints for email, slugs, invoice number, invoice booking_id
- Foreign-key relationships and chat message cascade on hard delete
- SoftDeletes only where `deleted_at` exists
- Category seeder idempotency (three categories)

## Timestamp note (MySQL vs SQLite)

Client SQL uses:

- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP`

Laravel migrations use `useCurrent()` and `useCurrentOnUpdate()` to preserve MySQL semantics.

SQLite automated tests may not fully mirror MySQL `ON UPDATE CURRENT_TIMESTAMP` behavior. The intended production target remains MySQL.

## Duplicate index note

The client SQL defines both `UNIQUE` and a named `INDEX` on some columns (for example category/service/invoice slugs and invoice numbers). Migrations reproduce both. MySQL allows the redundant secondary index; uniqueness is enforced by the unique key.
