<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyChallengeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['code' => ['required', 'regex:/^\d{6}$/'], 'purpose' => ['required', 'in:login,step_up,email_verification,phone_verification,factor_management,sensitive_action'], 'client' => ['nullable', 'in:erp,admin,web']];
    }
}
