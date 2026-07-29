# Database Seeding

## What is seeded

### Service categories (exactly three)

From the client handoff seed data (names/slugs/descriptions).  
Note: the schema-only `PR_Per_Hour_SQL.txt` export does not include `INSERT` statements; the seeder uses the handoff seed values for these three categories:

| Name | Slug |
| --- | --- |
| Strategic Communication | `strategic-communication` |
| Public Relations Campaigns | `public-relations-campaigns` |
| Training & Capacity Building | `training-capacity-building` |

Seeder: `Database\Seeders\ServiceCategorySeeder`  
Behavior: idempotent via `updateOrCreate` on `slug`.

### Admin user

Seeder: `Database\Seeders\AdminUserSeeder`

Environment variables (placeholders in `backend/.env.example`):

- `PR_ADMIN_NAME`
- `PR_ADMIN_EMAIL`
- `PR_ADMIN_PASSWORD`

`DatabaseSeeder` calls the admin seeder only when `PR_ADMIN_PASSWORD` is set.  
Do not commit real passwords. Do not print passwords in logs or docs.

## Intentionally unseeded operational tables

Production seeding does **not** create:

- services
- bookings
- payments
- invoices
- chat conversations
- chat messages
- contact messages

## Commands

Use only after configuring an intentional database. Do **not** run against shared/production casually.

```powershell
cd C:\laragon\www\PR_Per_Hour\backend
# configure .env DB_* and PR_ADMIN_* first
php artisan db:seed --class=ServiceCategorySeeder
# or full DatabaseSeeder when PR_ADMIN_PASSWORD is set
php artisan db:seed
```

Automated tests use isolated SQLite and do not seed the normal local MySQL database.
