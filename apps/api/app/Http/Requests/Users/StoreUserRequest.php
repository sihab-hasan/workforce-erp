<?php

namespace App\Http\Requests\Users;

use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name')),
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'role' => ['required', Rule::in(UserService::USER_ROLES)],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
        ];
    }
}
