<?php

declare(strict_types=1);

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ForgotPasswordRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255'],
            'turnstile_token' => $this->turnstileTokenRules(),
            'role' => ['prohibited'],
            'status' => ['prohibited'],
            'password' => ['prohibited'],
        ];
    }

    protected function passedValidation(): void
    {
        $this->verifyTurnstileToken();
    }

    protected function turnstileAction(): string
    {
        return 'forgot_password';
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => __('auth.attributes.email'),
            'turnstile_token' => __('auth.attributes.turnstile_token'),
        ];
    }
}
