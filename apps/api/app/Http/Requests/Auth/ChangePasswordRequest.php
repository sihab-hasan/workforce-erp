<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'max:4096'],
            'password' => [
                'required',
                'string',
                'max:4096',
                'different:current_password',
                'confirmed',
                Password::min(10)->mixedCase()->numbers()->symbols(),
            ],
        ];
    }
}
