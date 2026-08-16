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
            'name' => $fullName,
            'initials' => $this->getInitials($fullName),
            'title' => $this->designation?->name ?? '',
            'department' => $this->department?->name ?? '',
            'employmentType' => $this->employment_type,
            'status' => $this->status,
            'manager' => $managerName,
            'location' => $this->branch?->name ?? '',
            'hireDate' => $this->hire_date instanceof \DateTime ? $this->hire_date->toDateString() : (is_string($this->hire_date) ? $this->hire_date : null),
            'email' => $this->email,
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
