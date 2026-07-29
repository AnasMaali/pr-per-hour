<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Auth\DTOs\LoginData;
use App\Features\Auth\Exceptions\EmailVerificationRequiredException;
use App\Features\Auth\Exceptions\InactiveAccountException;
use App\Features\Users\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\NewAccessToken;

final class AuthenticateUser
{
    public const TOKEN_NAME = 'client-access-token';

    /**
     * @return array{user: User, token: NewAccessToken}
     */
    public function execute(LoginData $data): array
    {
        $user = User::query()->where('email', $data->email)->first();

        if ($user === null || ! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.invalid_credentials')],
            ]);
        }

        if ($user->status !== UserStatus::Active) {
            throw new InactiveAccountException(__('auth.inactive_account'));
        }

        if ($user->role === UserRole::Client && $user->email_verified_at === null) {
            throw new EmailVerificationRequiredException(__('auth.email_verification_required'));
        }

        // V1 allows one active browser session per account. Revoke stale tokens
        // before issuing a fresh, time-limited Sanctum token.
        $user->tokens()->delete();
        $token = $user->createToken(self::TOKEN_NAME);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
