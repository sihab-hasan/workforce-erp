# Access Control and Authorization Architecture

Workforce ERP implements a fine-grained, multi-tenant authorization architecture combining **Role-Based Access Control (RBAC)**, **Capability/Permission Gates**, and **Data Scopes**.

```text
Identity (User)
  └── Organization Membership (Tenant Context: X-Tenant-Key)
        ├── Assigned Roles (owner, admin, manager, hr, employee)
        │     └── Permissions / Capabilities (e.g. employee.view, timesheet.edit)
        ├── Data Scopes (OWN, DEPARTMENT, COMPANY, ORGANIZATION)
        └── Policies & Constraints (SoD Rules, Maker-Checker, Step-Up MFA)
```

## Authorization Model

Access decisions are evaluated using three distinct dimensions:

$$\text{Decision} = \text{Active Membership} \land \text{Permission} \land \text{Scope Match} \land \text{Resource Policy} \land \text{SoD/Step-Up}$$

1. **Role**: A named collection of permissions assigned to an organization member or platform operator.
2. **Capability / Permission**: A discrete, named action key (e.g., `user.manage`, `employee.view`, `timesheet.approve`, `leave.request`).
3. **Scope**: The organizational boundary constraining where a permission applies (`OWN`, `DEPARTMENT`, `COMPANY`, `ORGANIZATION`, `GLOBAL`).

---

## Tenant Organization Roles

Within a tenant organization, users hold active membership role assignments:

| Role                               | Default Capabilities & Scope                                                                                                                 | Typical Responsibilities                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Organization Owner** (`owner`)   | Full tenant governance (`ORGANIZATION` scope). Can manage billing, tenant settings, service accounts, and assign all roles.                  | Business owner, chief executive, primary account holder |
| **Organization Admin** (`admin`)   | Full operational management across all companies and departments (`ORGANIZATION` scope). Cannot delete the organization or modify ownership. | IT administrator, operations director                   |
| **HR Admin / Specialist** (`hr`)   | Employee directory, profile management, onboarding, document compliance, and leave management (`ORGANIZATION` or `COMPANY` scope).           | HR manager, people operations                           |
| **Department Manager** (`manager`) | Timesheet approval, manual attendance corrections, leave request reviews, and department employee visibility (`DEPARTMENT` scope).           | Team lead, department head                              |
| **Employee** (`employee`)          | Personal profile self-service, server-authoritative clock-in/out, personal timesheet history, leave submissions (`OWN` / `self` scope).      | Individual contributor, staff member                    |

---

## Platform Administration Roles

Platform administration is strictly decoupled from tenant organization roles. An organization owner is **never** automatically a platform administrator. Platform administration requests target the `/api/v1/platform/*` API namespace:

| Platform Role                                           | Scope & Permissions                                                                                            | Purpose                                      |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Platform Super Admin** (`platform_super_admin`)       | Full platform access, organization inspection, audit logs, break-glass initiation, time-bounded impersonation. | Platform operations and emergency recovery   |
| **Platform Security Admin** (`platform_security_admin`) | Security monitoring, audit log review, break-glass review, session revocation.                                 | Security governance and compliance           |
| **Platform Support** (`platform_support`)               | Read-only tenant discovery, time-limited support session impersonation.                                        | Customer support and troubleshooting         |
| **Platform Auditor** (`platform_auditor`)               | Read-only platform and tenant audit inspection.                                                                | External compliance and compliance reporting |

---

## Data Scopes

Permissions are bounded by explicit data scopes:

- **`OWN` / `self`**: Access is restricted strictly to resources owned by or linked to the authenticated user's employee profile.
- **`DEPARTMENT` / `department`**: Access covers resources within the employee's assigned department(s).
- **`COMPANY` / `company`**: Access covers resources within the currently selected subsidiary company.
- **`ORGANIZATION` / `organization`**: Access covers all companies and departments across the entire tenant organization.
- **`GLOBAL`**: Platform-wide scope (applicable only to platform administrator roles).

---

## Enforcement Pipeline

### 1. Authoritative Backend (Laravel API)

All authorization decisions are authoritatively validated on the backend:

1. **Sanctum Authentication (`auth:sanctum`)**: Validates the authenticated session or bearer token.
2. **Tenant Context Resolution (`X-Tenant-Key`)**: Resolves the tenant organization from the header.
3. **Active Membership Verification**: Ensures the user has an active, non-suspended membership in the requested organization.
4. **Effective Role & Permission Derivation**: Resolves effective permissions from `membership_role_assignments -> roles -> role_permissions`.
5. **Data Scope & Eloquent Policies**: Applies query scopes and Eloquent Resource Policies to constrain record-level mutations.
6. **Separation of Duties (SoD) & Step-Up MFA**: Evaluates conflicting action rules and challenges privileged sensitive actions.

### 2. Frontend UX Gating (`@workforce-erp/authorization` & `@workforce-erp/auth`)

Frontend packages provide declarative components and hooks to adapt UI visibility:

```tsx
import { CapabilityGate, useAuthorization } from "@workforce-erp/authorization";
import { RequireAuth } from "@workforce-erp/auth";

// Declarative component gating
<CapabilityGate capability="employee.create">
  <CreateEmployeeButton />
</CapabilityGate>;

// Hook-based imperative checks
const { hasCapability, hasScope } = useAuthorization();
if (hasCapability("timesheet.approve")) {
  // Show approval actions
}
```

> **Note**: Frontend gates improve user experience by hiding unavailable actions. Backend middleware remains strictly authoritative for security enforcement.

---

## Separation of Duties (SoD) & Maker-Checker Controls

- **Preventive SoD Rules**: Predefined conflicting permission pairs (e.g. creating invoices vs. approving payouts) cannot be simultaneously executed without an approved mitigation override.
- **Maker-Checker Workflow**: Actions requiring secondary review (such as timesheet manual corrections or leave reviews) reject self-approval by the creator/maker.
- **Step-Up Verification**: Privileged administrative mutations (e.g., rotating service account keys, security policy changes) require recent step-up authentication.

---

## Machine & Service Accounts

Automated background workers and server-to-server integrations utilize dedicated service accounts rather than user credentials:

- Dedicated tenant-bound client credentials exchanged via `POST /api/v1/auth/service-token`.
- Machine endpoints enforce `service.account`, `service.permission:*`, and `service.scope:*` middleware.
- Tokens are short-lived, audience-bound (`workforce-api`), and never grant unconstrained wildcard permissions.
