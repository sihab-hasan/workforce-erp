<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use App\Services\AuthorizationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $c = [];
        if ($this->has('name')) {
            $c['name'] = trim((string) $this->input('name'));
        }if ($this->has('email')) {
            $c['email'] = Str::lower(trim((string) $this->input('email')));
        }if ($c !== []) {
            $this->merge($c);
        }
    }

    public function rules(): array
    {
        $u = $this->route('user');
        $id = $u instanceof User ? $u->id : $u;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:255'], 'email' => ['sometimes', 'required', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'role' => ['sometimes', 'nullable', 'string', 'max:100'], 'roles' => ['sometimes', 'array', 'min:1', 'max:12'], 'roles.*' => ['string', 'max:100', 'distinct'],
            'organization_id' => ['sometimes', 'nullable', 'integer', 'exists:organizations,id'], 'employee_id' => ['sometimes', 'nullable', 'integer', 'exists:employees,id'],
            'data_scope' => ['sometimes', Rule::in(AuthorizationService::SCOPES)], 'scope_data' => ['sometimes', 'nullable', 'array'], 'expires_at' => ['sometimes', 'nullable', 'date', 'after:now'],
        ];
    }
}
