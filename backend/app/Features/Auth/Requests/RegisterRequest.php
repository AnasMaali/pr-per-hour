<?php

declare(strict_types=1);

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

final class RegisterRequest extends FormRequest
{
    use ValidatesTurnstileToken;

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
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'confirmed', Password::min(10)->mixedCase()->letters()->numbers()],
            'turnstile_token' => $this->turnstileTokenRules(),
        ];
    }

    protected function passedValidation(): void
    {
        $this->verifyTurnstileToken();
    }

    protected function turnstileAction(): string
    {
        return 'register';
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => __('auth.attributes.name'),
            'email' => __('auth.attributes.email'),
            'phone' => __('auth.attributes.phone'),
            'password' => __('auth.attributes.password'),
            'password_confirmation' => __('auth.attributes.password_confirmation'),
            'turnstile_token' => __('auth.attributes.turnstile_token'),
        ];
    }
}
