<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $fullName = trim("{$this->first_name} {$this->last_name}");
        $manager = $this->manager;
        $managerName = $manager ? trim("{$manager->first_name} {$manager->last_name}") : '';

        return [
            'id' => (string) $this->id,
            'employee_id' => $this->employee_id,
            'user_id' => $this->user_id ? (string) $this->user_id : null,
            'organization_id' => (string) $this->organization_id,
            'branch_id' => $this->branch_id ? (string) $this->branch_id : null,
            'department_id' => $this->department_id ? (string) $this->department_id : null,
            'designation_id' => $this->designation_id ? (string) $this->designation_id : null,
            'manager_id' => $this->manager_id ? (string) $this->manager_id : null,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $fullName,
            'initials' => $this->getInitials($fullName),
            'title' => $this->designation?->name ?? '',
            'designation' => $this->designation ? ['id' => (string) $this->designation->id, 'name' => $this->designation->name] : null,
            'department' => $this->department?->name ?? '',
            'department_record' => $this->department ? ['id' => (string) $this->department->id, 'name' => $this->department->name, 'code' => $this->department->code] : null,
            'employmentType' => $this->employment_type,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'manager' => $managerName,
            'manager_record' => $manager ? ['id' => (string) $manager->id, 'name' => $managerName, 'employee_id' => $manager->employee_id] : null,
            'location' => $this->branch?->name ?? '',
            'branch' => $this->branch ? ['id' => (string) $this->branch->id, 'name' => $this->branch->name, 'code' => $this->branch->code] : null,
            'hireDate' => $this->hire_date?->toDateString(),
            'hire_date' => $this->hire_date?->toDateString(),
            'termination_date' => $this->termination_date?->toDateString(),
            'email' => $this->email,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'address' => $this->address,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get 2-letter initials from name.
     */
    private function getInitials(string $name): string
    {
        $words = preg_split('/\s+/', $name);
        $initials = '';
        foreach ($words as $word) {
            if (! empty($word)) {
                $initials .= mb_substr($word, 0, 1);
            }
        }

        return mb_strtoupper(mb_substr($initials, 0, 2));
    }
}
