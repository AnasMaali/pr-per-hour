<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\OneTimeCodePurpose;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Auth\DTOs\RegisterClientData;
use App\Features\Auth\Notifications\VerifyEmailCodeNotification;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

final class RegisterClient
{
    public function __construct(
        private readonly OneTimeCodeService $codes,
    ) {}

    /**
     * Create an unverified client and attempt to send a verification code.
     * Does not issue a Sanctum token (Phase 7B).
     *
     * @return array{user: User, verification_sent: bool}
     */
    public function execute(RegisterClientData $data): array
    {
        $user = new User;
        $user->name = $data->name;
        $user->email = $data->email;
        $user->phone = $data->phone;
        $user->password = $data->password;
        $user->role = UserRole::Client;
        $user->status = UserStatus::Active;
        $user->email_verified_at = null;
        $user->save();

        $verificationSent = false;

        try {
            $plainCode = $this->codes->issue($user, OneTimeCodePurpose::VerifyEmail);
            $user->notify(
                (new VerifyEmailCodeNotification(
                    $plainCode,
                    $this->codes->expiresMinutes(),
                ))->locale(app()->getLocale()),
            );
            RateLimiter::hit(
                'otp-resend:verify_email:'.hash('sha256', $user->email),
                $this->codes->resendSeconds(),
            );
            $verificationSent = true;
        } catch (Throwable $exception) {
            // Keep the account; the verify-email page can resend.
            Log::warning('Registration verification email delivery failed.', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
                'exception' => $exception::class,
            ]);
            $verificationSent = false;
        }

        return [
            'user' => $user,
            'verification_sent' => $verificationSent,
        ];
    }
}
