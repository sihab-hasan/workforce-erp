<?php

namespace App\Http\Requests\Users;

use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'organization_id' => ['nullable', 'integer', 'min:1'],
            'role' => ['nullable', Rule::in(array_merge(['all'], UserService::USER_ROLES))],
            'status' => ['nullable', Rule::in(array_merge(['all'], UserService::USER_STATUSES))],
            'sort_by' => ['nullable', Rule::in(UserService::SORTABLE_FIELDS)],
            'sort_direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
