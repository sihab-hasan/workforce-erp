<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    private const LEGACY_ROLES = ['owner', 'admin', 'manager', 'staff', 'readonly'];

    private const ROLE_COMPAT = [
        'organization_owner' => 'owner',
        'organization_admin' => 'admin',
        'manager' => 'manager',
        'employee' => 'staff',
        'auditor' => 'readonly',
    ];

    public function toArray(Request $request): array
    {
        // Services load only the organizations the current actor is allowed to manage.
        // Avoid querying authorization state inside each resource to prevent N+1 queries.
        $organizations = $this->relationLoaded('organizations')
            ? $this->organizations
            : collect();

        $requestedOrganizationId = $request->integer('organization_id') ?: null;
        $organization = $requestedOrganizationId
            ? $organizations->firstWhere('id', $requestedOrganizationId)
            : $organizations->first();

        $employees = $this->relationLoaded('employees')
            ? $this->employees
            : collect();
        $employee = $organization
            ? $employees->firstWhere('organization_id', $organization->id)
            : $employees->first();

        $employeeLink = $employee ? [
            'employee_id' => (string) $employee->id,
            'employee_name' => trim("{$employee->first_name} {$employee->last_name}"),
            'department' => $employee->department?->name,
            'designation' => $employee->designation?->name,
        ] : null;

        $organizationLink = $organization ? [
            'id' => (string) $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
        ] : null;

        $role = (string) ($organization?->pivot?->role ?? 'staff');
        if (! in_array($role, self::LEGACY_ROLES, true)) {
            $membership = $this->relationLoaded('memberships') && $organization
                ? $this->memberships->firstWhere('organization_id', $organization->id)
                : null;
            $canonicalRole = $membership?->roleAssignments?->first()?->role?->name;
            $role = self::ROLE_COMPAT[$canonicalRole] ?? 'staff';
        }

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role,
            'status' => $organization?->pivot?->status ?? 'inactive',
            'organization' => $organizationLink,
            'employee' => $employeeLink,
            'organization_id' => $organizationLink['id'] ?? null,
            'organization_name' => $organizationLink['name'] ?? '',
            'employee_id' => $employeeLink['employee_id'] ?? null,
            'employee_name' => $employeeLink['employee_name'] ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'invitation_delivered' => $this->getAttribute('invitation_delivered'),
        ];
    }
}
