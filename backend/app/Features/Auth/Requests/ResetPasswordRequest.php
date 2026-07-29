<?php

declare(strict_types=1);

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

final class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->input('email'))) {
            $this->merge([
                'email' => strtolower(trim($this->input('email'))),
            ]);
        }

        if ($this->has('code') && is_string($this->input('code'))) {
            $this->merge([
                'code' => trim($this->input('code')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $length = max(4, min(12, (int) config('otp.length', 6)));

        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'code' => ['required', 'string', 'size:'.$length, 'regex:/^\d{'.$length.'}$/'],
            'password' => ['required', 'confirmed', Password::min(10)->mixedCase()->letters()->numbers()],
            'role' => ['prohibited'],
            'status' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => __('auth.attributes.email'),
            'code' => __('auth.attributes.code'),
            'password' => __('auth.attributes.password'),
            'password_confirmation' => __('auth.attributes.password_confirmation'),
        ];
    }
}
