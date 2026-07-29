<?php

declare(strict_types=1);

namespace App\Features\Auth\Services;

use App\Features\Auth\Exceptions\HumanVerificationFailedException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Verifies Cloudflare Turnstile tokens via Siteverify.
 * Fail-closed when Turnstile is enabled.
 */
final class TurnstileVerifier
{
    /**
     * Official Cloudflare always-pass test secret.
     *
     * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
     */
    private const OFFICIAL_ALWAYS_PASS_SECRET = '1x0000000000000000000000000000000AA';

    /**
     * Official Cloudflare always-fail / token-spent test secrets.
     *
     * @var list<string>
     */
    private const OFFICIAL_TEST_SECRETS = [
        self::OFFICIAL_ALWAYS_PASS_SECRET,
        '2x0000000000000000000000000000000AA',
        '3x0000000000000000000000000000000AA',
    ];

    /**
     * Widget actions this API expects from the frontend.
     *
     * @var list<string>
     */
    private const EXPECTED_WIDGET_ACTIONS = [
        'register',
        'resend_verification',
        'forgot_password',
    ];

    /**
     * @throws HumanVerificationFailedException
     */
    public function verify(?string $token, string $expectedAction, ?string $remoteIp = null): void
    {
        if (! (bool) config('turnstile.enabled')) {
            return;
        }

        $secret = trim((string) config('turnstile.secret_key'));
        if ($secret === '') {
            Log::error('Turnstile is enabled but TURNSTILE_SECRET_KEY is missing.');
            throw $this->failed();
        }

        $token = is_string($token) ? trim($token) : '';
        if ($token === '') {
            throw $this->failed();
        }

        $idempotencyKey = (string) Str::uuid();
        $timeout = (int) config('turnstile.timeout_seconds', 8);
        $url = (string) config('turnstile.siteverify_url');

        try {
            $payload = [
                'secret' => $secret,
                'response' => $token,
                'idempotency_key' => $idempotencyKey,
            ];

            if (is_string($remoteIp) && $remoteIp !== '') {
                $payload['remoteip'] = $remoteIp;
            }

            $response = Http::asForm()
                ->acceptJson()
                ->timeout($timeout)
                ->connectTimeout(min(5, $timeout))
                ->post($url, $payload);
        } catch (ConnectionException $exception) {
            Log::error('Turnstile Siteverify network failure.', [
                'exception' => $exception::class,
            ]);

            throw $this->failed();
        } catch (Throwable $exception) {
            Log::error('Turnstile Siteverify unexpected failure.', [
                'exception' => $exception::class,
            ]);

            throw $this->failed();
        }

        if (! $response->successful()) {
            Log::warning('Turnstile Siteverify returned a non-success HTTP status.', [
                'status' => $response->status(),
            ]);

            throw $this->failed();
        }

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];

        if (($body['success'] ?? false) !== true) {
            Log::notice('Turnstile Siteverify rejected the token.', [
                'error_codes_present' => array_key_exists('error-codes', $body),
            ]);

            throw $this->failed();
        }

        $action = $body['action'] ?? null;
        if (! $this->actionMatchesExpected($action, $expectedAction, $secret)) {
            Log::notice('Turnstile action mismatch.', [
                'expected_action' => $expectedAction,
            ]);

            throw $this->failed();
        }

        /** @var list<string> $allowedHosts */
        $allowedHosts = config('turnstile.expected_hostnames', []);
        if ($allowedHosts !== []) {
            $hostname = $body['hostname'] ?? null;
            if (! is_string($hostname) || ! in_array(strtolower($hostname), $allowedHosts, true)) {
                Log::notice('Turnstile hostname not allowed.', [
                    'hostname_present' => is_string($hostname),
                ]);

                throw $this->failed();
            }
        }

        /** @var list<mixed> $errorCodes */
        $errorCodes = is_array($body['error-codes'] ?? null) ? $body['error-codes'] : [];
        foreach ($errorCodes as $code) {
            if (! is_string($code)) {
                continue;
            }
            if (in_array($code, ['timeout-or-duplicate', 'invalid-input-response', 'expired-input-response'], true)) {
                throw $this->failed();
            }
        }
    }

    /**
     * Official Cloudflare dummy Siteverify responses use action "test".
     * Allow that only for local/testing + an official test secret.
     * Never active when APP_ENV=production.
     */
    private function isOfficialTestConfiguration(string $secret, mixed $returnedAction): bool
    {
        if (app()->environment('production')) {
            return false;
        }

        if (! app()->environment(['local', 'testing'])) {
            return false;
        }

        if (! in_array($secret, self::OFFICIAL_TEST_SECRETS, true)) {
            return false;
        }

        return is_string($returnedAction) && $returnedAction === 'test';
    }

    private function actionMatchesExpected(mixed $action, string $expectedAction, string $secret): bool
    {
        if (is_string($action) && $action === $expectedAction) {
            return true;
        }

        if (
            $this->isOfficialTestConfiguration($secret, $action)
            && in_array($expectedAction, self::EXPECTED_WIDGET_ACTIONS, true)
        ) {
            return true;
        }

        return false;
    }

    private function failed(): HumanVerificationFailedException
    {
        return new HumanVerificationFailedException(__('auth.human_verification_failed'));
    }
}
