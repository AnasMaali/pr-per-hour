<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Exceptions\CodeAttemptsExceededException;
use App\Features\Auth\Exceptions\InvalidOrExpiredCodeException;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;

final class ResetPasswordWithCode
{
    public function __construct(
        private readonly OneTimeCodeService $codes,
    ) {}

    /**
     * Consume the reset code first (so failed-attempt increments commit), then
     * update the password and revoke tokens in a separate transaction.
     *
     * @throws InvalidOrExpiredCodeException
     * @throws CodeAttemptsExceededException
     */
    public function execute(string $email, string $code, string $password): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            throw new InvalidOrExpiredCodeException(__('auth.reset_code_invalid'));
        }

        try {
            $this->codes->consume($user, OneTimeCodePurpose::PasswordReset, $code);
        } catch (InvalidOrExpiredCodeException) {
            throw new InvalidOrExpiredCodeException(__('auth.reset_code_invalid'));
        }

        return DB::transaction(function () use ($user, $password): User {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();

            // Hashed cast on User hashes the plain password once.
            $locked->password = $password;
            $locked->save();
            $locked->tokens()->delete();

            event(new PasswordReset($locked));

            return $locked->fresh() ?? $locked;
        });
    }
}
