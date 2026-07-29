<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Exceptions\EmailAlreadyVerifiedException;
use App\Features\Auth\Exceptions\MailDeliveryFailedException;
use App\Features\Auth\Exceptions\OtpResendCooldownException;
use App\Features\Auth\Notifications\VerifyEmailCodeNotification;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

final class SendEmailVerificationCode
{
    public function __construct(
        private readonly OneTimeCodeService $codes,
    ) {}

    /**
     * @return array{sent: bool}
     *
     * @throws EmailAlreadyVerifiedException
     * @throws OtpResendCooldownException
     * @throws MailDeliveryFailedException
     */
    public function execute(string $email): array
    {
        $this->assertResendAllowed($email);

        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $this->hitResendCooldown($email);

            return ['sent' => false];
        }

        if ($user->email_verified_at !== null) {
            throw new EmailAlreadyVerifiedException(__('auth.email_already_verified'));
        }

        $plainCode = $this->codes->issue($user, OneTimeCodePurpose::VerifyEmail);

        try {
            $user->notify(
                (new VerifyEmailCodeNotification(
                    $plainCode,
                    $this->codes->expiresMinutes(),
                ))->locale(app()->getLocale()),
            );
        } catch (Throwable $exception) {
            Log::warning('Email verification code delivery failed.', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $email),
                'exception' => $exception::class,
            ]);

            throw new MailDeliveryFailedException(__('auth.mail_delivery_failed'));
        }

        $this->hitResendCooldown($email);

        return ['sent' => true];
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
        return 'otp-resend:verify_email:'.hash('sha256', $email);
    }
}
