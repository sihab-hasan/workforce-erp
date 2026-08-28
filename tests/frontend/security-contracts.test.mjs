import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("ERP exposes canonical public authentication routes", () => {
  const paths = read("apps/erp/src/routes/paths.ts");
  for (const route of [
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/verify-sign-in",
    "/verify-phone",
    "/forgot-password",
    "/reset-password",
    "/accept-invitation/:token",
    "/sso/callback/:provider",
    "/select-tenant",
  ])
    assert.match(paths, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(
    paths,
    /["'`]\/auth\/(?:sign-in|sign-up|login|register|forgot-password)["'`]/,
  );
});

test("registration owner is routed through MFA before onboarding", () => {
  const page = read("apps/erp/src/features/authentication/pages/VerifyEmailPage.tsx");
  assert.match(page, /response\.status === "verification_required"/);
  assert.match(page, /AUTH_PATHS\.verifySignIn/);
  assert.match(page, /response\.challenge\.available_methods\.join/);
  const branch = page.indexOf('response.status === "verification_required"');
  const signIn = page.indexOf("signIn(toAuthSession(response))");
  assert.ok(
    branch >= 0 && signIn > branch,
    "session establishment must happen after the MFA branch",
  );
});

test("shared cookie client handles step-up with a one-retry guard", () => {
  const client = read("packages/api-client/src/compat.ts");
  assert.match(client, /STEP_UP_REQUIRED/);
  assert.match(client, /stepUpRetryCount/);
  assert.match(client, /\(requestOptions\.stepUpRetryCount \?\? 0\) < 1/);
  assert.match(client, /await options\.onStepUpRequired\(error\)/);
});

test("ERP and platform admin both register the centralized step-up dialog", () => {
  const erp = read("apps/erp/src/features/authentication/AppAuthProvider.tsx");
  const admin = read("apps/admin/src/features/authentication/AdminAuthProvider.tsx");
  assert.match(erp, /registerStepUpHandler/);
  assert.match(erp, /StepUpVerificationDialog/);
  assert.match(admin, /registerAdminStepUpHandler/);
  assert.match(admin, /StepUpVerificationDialog/);
});

test("step-up verification input supports six-digit OTP paste/autocomplete semantics", () => {
  const dialog = read("packages/ui-patterns/src/security/step-up-verification-dialog.tsx");
  assert.match(dialog, /autoComplete="one-time-code"/);
  assert.match(dialog, /inputMode="numeric"/);
  assert.match(dialog, /maxLength=\{6\}/);
  assert.match(dialog, /replace\(\/\\D\/g, ""\)\.slice\(0, 6\)/);
});

test("browser auth package does not persist credentials in localStorage", () => {
  const storage = read("packages/auth/src/storage/token-storage.ts");
  assert.doesNotMatch(storage, /localStorage\.(?:setItem|getItem|removeItem)/);
  assert.match(storage, /HttpOnly cookies/);
});

test("platform administration context uses the dedicated platform API", () => {
  const admin = read("apps/admin/src/lib/api.ts");
  assert.match(admin, /\/api\/v1\/platform\/context/);
  assert.doesNotMatch(admin, /platformContext:[\s\S]{0,200}["'`]\/api\/v1\/users["'`]/);
});

test("static frontend role capability maps are not authorization authorities", () => {
  assert.doesNotMatch(read("apps/erp/src/access/role-capabilities.ts"), /ROLE_CAPABILITIES/);
  assert.doesNotMatch(
    read("apps/admin/src/access/role-capabilities.ts"),
    /PLATFORM_ROLE_CAPABILITIES/,
  );
});
