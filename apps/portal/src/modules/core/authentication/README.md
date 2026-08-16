# Authentication

Workforce ERP uses a real Laravel API authentication flow. The portal does not expose public self-registration; user access begins with an organization invitation created by an owner/admin.

## Browser routes

- `/auth/login` — password login for an active organization membership.
- `/auth/mfa` — email one-time-code sign-in for active users and invited users; a valid code activates invited memberships.
- `/auth/forgot-password` — requests Laravel's password-reset broker notification using a generic public response.
- `/auth/reset-password?token=...&email=...` — validates the password broker token, changes the password, and revokes existing API tokens.
- `/auth/callback/:provider` — Google/Microsoft OAuth authorization-code + PKCE callback for an existing active or invited Workforce account.

## Authenticated security routes

- `/profile/security` — changes the password after verifying the current password; all API tokens are revoked.
- `/profile/sessions` — lists Sanctum personal-access-token sessions and allows revocation.

## Session lifecycle

The browser uses Laravel Sanctum stateful SPA authentication. The server owns the session in an HttpOnly cookie; JavaScript stores no credential. Portal bootstrap validates the cookie-backed session through `/api/v1/auth/me`, and authenticated API `401` responses sign the UI out.

Google/Microsoft OAuth and email delivery require real provider/SMTP credentials in `apps/api/.env`. The UI does not simulate provider callbacks or password-reset delivery.

## Required external configuration

Authentication screens do not simulate delivery/provider callbacks. Configure the API with a working SMTP transport (`MAIL_MAILER=smtp` plus host/port/credentials) for invitations, OTP, and password-reset email. Configure Google/Microsoft OAuth client credentials and exact redirect URIs before enabling those SSO buttons in an environment.
