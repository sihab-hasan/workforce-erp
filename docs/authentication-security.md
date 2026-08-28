# Authentication and Security Architecture

## Browser routes

Customer-facing browser authentication uses canonical URLs: `/sign-in`, `/sign-up`, `/verify-email`, `/verify-sign-in`, `/verify-phone`, `/forgot-password`, `/reset-password`, `/accept-invitation/:token`, `/sso/callback/:provider`, `/select-tenant`, and `/onboarding/*`. Platform administration uses its own `/sign-in` on the admin application. The `/api/v1/auth/*` URLs are API endpoints, not browser navigation routes.

## Identity and sign-in

Password authentication uses Argon2id and supports long passphrases without arbitrary composition rules. Google and Microsoft SSO use authorization code flow with PKCE/state validation and store provider subject, issuer, and provider tenant identity data. Email alone is not the durable SSO identity key.

A password or SSO primary authentication does not create the final application session when MFA is required. Instead it creates a purpose-bound verification challenge. The only active verification methods are TOTP Authenticator App, Email Code, and SMS Code. Codes are six digits, hashed at rest, short-lived, single-use, attempt limited, and resend limited. A `login` challenge cannot be reused as a `step_up` challenge.

## Sessions

First-party browser sessions are server-side database sessions using HttpOnly/Secure/SameSite cookies and CSRF protection. Production examples enable session encryption, secure cookies, and JSON session serialization. Session metadata binds authentication and authorization versions, primary/final authentication method, MFA level, recent verification, absolute expiry, client/audience, and risk flags. Password/factor/identity/authorization changes invalidate relevant sessions.

## Tenant and authorization pipeline

Business endpoints require explicit `X-Tenant-Key`. A tenant header requests context; it never grants access. The backend resolves the organization and requires an active membership before evaluating effective multiple roles, permissions, data scope, resource policy, SoD/business rules, subscription/module state where applicable, and step-up requirements.

The legacy `organization_members.role` column remains only as upgrade/display compatibility data. Authorization is derived from `membership_role_assignments -> roles -> role_permissions -> permissions` plus data scopes and policies. Platform administration uses separate `platform_role_assignments` and platform permissions; an organization owner is never a platform administrator.

## Registration and invitation

Public `/sign-up` creates a new tenant only after a single-use email registration challenge. Tenant provisioning is transactional: identity, organization, owner membership/role, defaults, trial state, onboarding state, and audit are committed together or rolled back.

Existing-organization users join through an exact hashed invitation token. Acceptance binds token, email, organization, membership, roles, and data scope and activates only that membership. Privileged invitation acceptance enters the same MFA-before-session flow as other privileged sign-ins.

## Sensitive operations

Step-up verification is reusable for sensitive actions. Security auditing is append-only at the application layer and records actor/subject, tenant, session, IP/user-agent, authentication method, resource, before/after state, correlation ID, result, and failure reason. SoD and maker-checker controls prevent self-approval for configured conflicting permissions. Service accounts have separate credentials/scopes and do not default to wildcard permissions. Break-glass and impersonation are time-limited and audited.

## Removed authentication features

Passkeys/WebAuthn and recovery-code authentication are not active features. The legacy generic OTP table is retired by the forward security migration; all active verification uses purpose-bound challenges.

## Release validation

`scripts/security-source-check.py` is dependency-free and checks forbidden feature references, canonical browser routes, token storage, password policy, Laravel target, route/controller methods, permission catalog consistency, and production example invariants. `scripts/security-release-check.sh` / `.ps1` adds the full Composer/Laravel/PHPUnit, pnpm, audit/build, migration/route, and Docker gates. A production deployment must not proceed unless the complete gate succeeds in the deployment environment.
