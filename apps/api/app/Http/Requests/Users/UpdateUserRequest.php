<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use App\Services\UserService;
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
        $changes = [];
        if ($this->has('name')) {
            $changes['name'] = trim((string) $this->input('name'));
        }
        if ($this->has('email')) {
            $changes['email'] = Str::lower(trim((string) $this->input('email')));
        }
        if ($changes !== []) {
            $this->merge($changes);
        }
    }

    public function rules(): array
    {
        $routeUser = $this->route('user');
        $userId = $routeUser instanceof User ? $routeUser->id : $routeUser;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role' => ['sometimes', Rule::in(UserService::USER_ROLES)],
            'organization_id' => ['sometimes', 'nullable', 'integer', 'exists:organizations,id'],
            'employee_id' => ['sometimes', 'nullable', 'integer', 'exists:employees,id'],
        ];
    }
}
