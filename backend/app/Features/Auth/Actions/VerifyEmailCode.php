<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Exceptions\CodeAttemptsExceededException;
use App\Features\Auth\Exceptions\InvalidOrExpiredCodeException;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\DB;

final class VerifyEmailCode
{
    public function __construct(
        private readonly OneTimeCodeService $codes,
    ) {}

    /**
     * Always validates/consumes the submitted code. Do not short-circuit on
     * email_verified_at — replay of a used code must fail with INVALID_OR_EXPIRED_CODE.
     *
     * @throws InvalidOrExpiredCodeException
     * @throws CodeAttemptsExceededException
     */
    public function execute(string $email, string $code): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            throw new InvalidOrExpiredCodeException(__('auth.invalid_or_expired_code'));
        }

        // Commit attempt increments / used_at before marking the user verified.
        $this->codes->consume($user, OneTimeCodePurpose::VerifyEmail, $code);

        return DB::transaction(function () use ($user): User {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();

            if ($locked->email_verified_at === null) {
                $locked->forceFill([
                    'email_verified_at' => now(),
                ])->save();

                event(new Verified($locked));
            }

            return $locked->fresh() ?? $locked;
        });
    }
}
