<?php

namespace App\Http\Requests\Timesheets;

use App\Services\TimesheetService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTimesheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'integer', 'exists:employees,id'],
            'date' => ['sometimes', 'date'],
            'clock_in' => ['sometimes', 'nullable', 'date'],
            'clock_out' => ['sometimes', 'nullable', 'date'],
            'total_hours' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'nullable', Rule::in(TimesheetService::STATUSES)],
        ];
    }
}
