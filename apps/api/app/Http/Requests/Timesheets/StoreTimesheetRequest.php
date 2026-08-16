<?php

namespace App\Http\Requests\Timesheets;

use App\Services\TimesheetService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'date' => ['required', 'date'],
            'clock_in' => ['nullable', 'date'],
            'clock_out' => ['nullable', 'date', 'after_or_equal:clock_in'],
            'total_hours' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::in(TimesheetService::STATUSES)],
        ];
    }
}
