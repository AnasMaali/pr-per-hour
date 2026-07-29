# Local Backend Setup

## Requirements

- PHP **8.3.30** (Laragon recommended for this workspace)
- Composer 2.x
- Working directory must be `backend/` when running Artisan

## Laragon PHP path

```text
C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64
```

Temporary PowerShell PATH for the current session:

```powershell
$env:PATH = "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;$env:PATH"
php -v
```

Do not change global machine PHP settings unless you intentionally manage Laragon/XAMPP yourself.

## First-time setup

```powershell
cd C:\laragon\www\PR_Per_Hour\backend
composer install
copy .env.example .env
php artisan key:generate
```

Do **not** invent real secrets in documentation. Keep `.env` local and uncommitted.

## Common error

```text
Could not open input file: artisan
```

Cause: Artisan was run outside `backend/`.

Correct:

```powershell
cd C:\laragon\www\PR_Per_Hour\backend
php artisan serve
```

## Useful commands

```powershell
cd C:\laragon\www\PR_Per_Hour\backend
php artisan about
php artisan route:list --path=api
php artisan test
php artisan config:clear
php artisan route:clear
```

## Health endpoint

With the API server running locally:

```text
GET http://127.0.0.1:8000/api/v1/health
```

## Environment notes

See `backend/.env.example` for:

- `CORS_ALLOWED_ORIGINS`
- `SANCTUM_STATEFUL_DOMAINS`
- `API_LOCALE_HEADER`
- `RATE_LIMIT_*`

## Production optimization (do not run casually in local foundation work)

Documented for later deployment:

```text
php artisan config:cache
php artisan route:cache
php artisan event:cache
```

## Sanctum

Sanctum is installed as infrastructure only. No login/register/token endpoints are implemented in the foundation phase. Do not run migrations until the database phase begins.
