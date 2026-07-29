# Version 1 Security Release Checklist

- [ ] `.env` is not in Git or the deployment archive.
- [ ] All exposed passwords/keys from local testing have been rotated.
- [ ] `APP_ENV=production`.
- [ ] `APP_DEBUG=false`.
- [ ] `APP_URL` and `VITE_API_BASE_URL` use HTTPS production URLs.
- [ ] `CORS_ALLOWED_ORIGINS` contains only the production frontend origin.
- [ ] `SANCTUM_TOKEN_EXPIRATION` is set to an approved duration.
- [ ] Admin account password is unique and strong.
- [ ] MySQL user is not a broadly privileged shared root account in production.
- [ ] Contact, auth, and API rate limits are reviewed.
- [ ] Bookings, chatbot, payment, and invoice flags remain disabled.
- [ ] Laravel migrations and seeders run successfully on a staging database.
- [ ] `php artisan test` passes in the deployment environment.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass after a clean `npm install`.
- [ ] Web server sends HTTPS/HSTS and static frontend security headers.
- [ ] Database backups and restore procedure are tested.
