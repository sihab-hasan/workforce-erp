<?php

namespace App\Http\Requests\Users;

use App\Services\AuthorizationService;
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
        $this->merge(['name' => trim((string) $this->input('name')), 'email' => Str::lower(trim((string) $this->input('email')))]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'], 'email' => ['required', 'email:rfc', 'max:255'],
            'role' => ['nullable', 'string', 'max:100'], 'roles' => ['nullable', 'array', 'min:1', 'max:12'], 'roles.*' => ['string', 'max:100', 'distinct'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'], 'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'data_scope' => ['nullable', Rule::in(AuthorizationService::SCOPES)], 'scope_data' => ['nullable', 'array'], 'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (! $this->filled('role') && ! is_array($this->input('roles'))) {
                $v->errors()->add('roles', 'At least one role is required.');
            }
        });
    }
}
