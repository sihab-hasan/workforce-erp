<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimesheetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'organization_id' => (string) $this->organization_id,
            'employee_id' => (string) $this->employee_id,
            'employee' => $this->employee ? [
                'id' => (string) $this->employee->id,
                'name' => trim("{$this->employee->first_name} {$this->employee->last_name}"),
            ] : null,
            'date' => $this->date instanceof \DateTime ? $this->date->toDateString() : (is_string($this->date) ? $this->date : null),
            'clock_in' => $this->clock_in?->toIso8601String(),
            'clock_out' => $this->clock_out?->toIso8601String(),
            'total_hours' => (float) $this->total_hours,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
