# Auth

## Feature purpose

Handle authentication and token lifecycle for platform users (clients and staff) via the Laravel REST API.

## Current status

**Backend:** Phase 4 auth (register, login, logout, me, profile) plus Phase 7A one-time email codes (verification + password reset APIs).  
**Frontend:** Phase 7A does not change React. Registration/login still issue tokens as before; verification gating lands in Phase 7B.

## Responsibilities

- Client registration (always `role=client`, `status=active`)
- Login for active client and admin users (shared endpoint)
- Logout (revoke current Sanctum token only)
- Current authenticated user (`/me`)
- Profile update for `name` and `phone` only
- Email verification code issue/consume (`email_verified_at`)
- Password reset via six-digit email codes (revokes all Sanctum tokens)
- English and Arabic auth API + mail copy
- Dedicated OTP rate limiters and resend cooldown

## Explicit non-responsibilities

- Social login, MFA
- Admin public registration
- Password change while authenticated (separate from reset)
- Frontend verify/reset screens (Phase 7B)
- Changing register/login responses in Phase 7A
- User admin management
- Direct database access from the React frontend

## Backend components

- Controllers (thin, invokable)
- Form Requests
- Actions (`RegisterClient`, `AuthenticateUser`, `LogoutUser`, `UpdateProfile`, OTP actions)
- `OneTimeCodeService` (HMAC storage, issue/consume, transactions + row locks)
- Notifications: `VerifyEmailCodeNotification`, `PasswordResetCodeNotification`
- Feature routes: `app/Features/Auth/routes/api.php`
- Cleanup: `php artisan otp:prune` (scheduled daily)

## Notes for future developers

- Eloquent model: `App\Features\Users\Models\User` (`HasApiTokens`, `SoftDeletes`, nullable `email_verified_at`)
- Table `one_time_codes` stores keyed HMAC digests only — never plain codes
- Docs: [AUTHENTICATION_API.md](../../../../docs/AUTHENTICATION_API.md), [AUTHENTICATION_SECURITY.md](../../../../docs/AUTHENTICATION_SECURITY.md), [PRODUCTION_CONFIGURATION.md](../../../../docs/PRODUCTION_CONFIGURATION.md)
