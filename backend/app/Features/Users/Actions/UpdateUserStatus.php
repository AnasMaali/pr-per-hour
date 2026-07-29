<?php

declare(strict_types=1);

namespace App\Features\Users\Actions;

use App\Enums\UserStatus;
use App\Features\Users\Models\User;

final class UpdateUserStatus
{
    public function execute(User $user, UserStatus $status): User
    {
        $user->status = $status;
        $user->save();

        if ($status === UserStatus::Inactive) {
            $user->tokens()->delete();
        }

        return $user->refresh();
    }
}
