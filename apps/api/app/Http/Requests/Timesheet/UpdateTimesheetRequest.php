<?php

namespace App\Http\Requests\Timesheet;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimesheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'date' => ['nullable', 'date'],
            'clock_in' => ['nullable', 'date'],
            'clock_out' => ['nullable', 'date'],
            'total_hours' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:present,absent,on-leave,half-day,pending,approved,rejected'],
        ];
    }
}
