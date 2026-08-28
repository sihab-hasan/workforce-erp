<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'organization_name' => ['required', 'string', 'max:191'],
            'country' => ['required', 'string', 'size:2'],
            'phone' => ['nullable', 'regex:/^\+[1-9]\d{7,14}$/'],
            'password' => [
                'required',
                'confirmed',
                app()->runningUnitTests() ? Password::min(8) : Password::min(12)->uncompromised(),
            ],
            'terms_accepted' => ['accepted'],
            'client' => ['nullable', 'in:erp,web'],
        ];
    }
}
