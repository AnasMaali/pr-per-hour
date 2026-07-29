<?php

declare(strict_types=1);

namespace App\Features\Auth\Requests;

use App\Features\Auth\Services\TurnstileVerifier;

/**
 * Shared Turnstile FormRequest helpers for abuse-sensitive public auth flows.
 */
trait ValidatesTurnstileToken
{
    /**
     * Cloudflare Turnstile widget action that must match Siteverify.
     */
    abstract protected function turnstileAction(): string;

    /**
     * @return array<int, string>
     */
    protected function turnstileTokenRules(): array
    {
        // Presence and Siteverify outcomes are enforced by TurnstileVerifier
        // so both missing and invalid tokens return HUMAN_VERIFICATION_FAILED.
        return ['nullable', 'string', 'max:2048'];
    }

    protected function verifyTurnstileToken(): void
    {
        app(TurnstileVerifier::class)->verify(
            token: is_string($this->input('turnstile_token')) ? $this->input('turnstile_token') : null,
            expectedAction: $this->turnstileAction(),
            remoteIp: $this->ip(),
        );
    }
}
