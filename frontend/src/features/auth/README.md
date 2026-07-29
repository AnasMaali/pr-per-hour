# Auth (frontend)

Client authentication UI and session integration.

## Status

Implemented:

- Auth API client (`login`, `register`, `me`, `logout`, `updateProfile`, email verify, password forgot/reset)
- Token storage + AuthProvider + role helpers
- Polished `/login` and `/register` pages
- `/verify-email`, `/forgot-password`, `/reset-password` (Phase 7B OTP flows)
- Temporary email state in `sessionStorage` (never OTP/password)
- `/unauthorized` page with auth-aware actions
- Safe post-auth redirects
- EN/AR auth namespace

Client profile page UI lives in `features/profile` (uses `authApi.updateProfile` + AuthProvider `/me` cache).

Not implemented (deferred):

- Social login / phone login / MFA
- Resend provider / Cloudflare Turnstile (Phase 7C+)

## Structure

```
features/auth/
├── api/
├── components/
├── hooks/
├── pages/
├── types/
├── utils/
├── styles/
├── AuthProvider.tsx
├── index.ts
└── README.md
```

## Docs

See [docs/FRONTEND_AUTH_UI.md](../../../../docs/FRONTEND_AUTH_UI.md) and [docs/AUTHENTICATION_API.md](../../../../docs/AUTHENTICATION_API.md).
