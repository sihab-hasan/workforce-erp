<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $orgIds = $user ? $user->organizations()->pluck('organizations.id')->toArray() : [];

        // Find the first organization this user belongs to, scoped to user's orgs
        $org = $this->organizations
            ->when(! empty($orgIds), function ($collection) use ($orgIds) {
                return $collection->whereIn('id', $orgIds);
            })
            ->first();

        // Get the employee linked to this user and organization
        $employee = $this->employees
            ->when($org, function ($collection) use ($org) {
                return $collection->where('organization_id', $org->id);
            })
            ->first();

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $org?->pivot?->role ?? 'staff',
            'status' => $org?->pivot?->status ?? 'active',
            'organization_id' => $org ? (string) $org->id : null,
            'organization_name' => $org?->name ?? '',
            'employee_id' => $employee ? (string) $employee->id : null,
            'employee_name' => $employee ? trim("{$employee->first_name} {$employee->last_name}") : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'last_login_at' => null,
        ];
    }
}
