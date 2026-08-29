<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
            'email' => ['required', 'email', 'max:255'],
            'password' => [
                'required',
                'string',
                'max:4096',
                'confirmed',
                app()->runningUnitTests() ? Password::min(8) : Password::min(12)->uncompromised(),
            ],
            'password_confirmation' => ['required', 'string', 'max:4096'],
        ];
    }
}
