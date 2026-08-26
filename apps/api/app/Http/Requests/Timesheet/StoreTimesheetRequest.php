<?php

namespace App\Http\Requests\Timesheet;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimesheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'date' => ['nullable', 'date'],
            'clock_in' => ['required', 'date'],
            'clock_out' => ['nullable', 'date', 'after:clock_in'],
            'total_hours' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:present,absent,on-leave,half-day,pending,approved,rejected'],
        ];
    }
}
