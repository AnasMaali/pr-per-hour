<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Exceptions\OtpResendCooldownException;
use App\Features\Auth\Notifications\PasswordResetCodeNotification;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

final class SendPasswordResetCode
{
    public function __construct(
        private readonly OneTimeCodeService $codes,
    ) {}

    /**
     * Always returns without revealing whether the account exists.
     *
     * @throws OtpResendCooldownException
     */
    public function execute(string $email): void
    {
        $this->assertResendAllowed($email);

        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $this->hitResendCooldown($email);

            return;
        }

        $plainCode = $this->codes->issue($user, OneTimeCodePurpose::PasswordReset);

        try {
            $user->notify(
                (new PasswordResetCodeNotification(
                    $plainCode,
                    $this->codes->expiresMinutes(),
                ))->locale(app()->getLocale()),
            );
        } catch (Throwable $exception) {
            // Keep the external response generic; never expose provider errors.
            Log::warning('Password reset code delivery failed.', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $email),
                'exception' => $exception::class,
            ]);
        }

        $this->hitResendCooldown($email);
    }

    private function assertResendAllowed(string $email): void
    {
        $key = $this->resendKey($email);
        $seconds = $this->codes->resendSeconds();

        if (RateLimiter::tooManyAttempts($key, 1)) {
            throw new OtpResendCooldownException(
                retryAfterSeconds: RateLimiter::availableIn($key),
                message: __('auth.otp_resend_cooldown', ['seconds' => $seconds]),
            );
        }
    }

    private function hitResendCooldown(string $email): void
    {
        RateLimiter::hit($this->resendKey($email), $this->codes->resendSeconds());
    }

    private function resendKey(string $email): string
    {
        return 'otp-resend:password_reset:'.hash('sha256', $email);
    }
}
