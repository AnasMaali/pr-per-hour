<?php

declare(strict_types=1);

namespace App\Features\Users\Policies;

use App\Enums\UserRole;
use App\Features\Users\Models\User;

final class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $target): bool
    {
        return $user->isAdmin();
    }

    public function updateStatus(User $user, User $target): bool
    {
        return $user->isAdmin()
            && $target->role === UserRole::Client
            && $user->isNot($target);
    }
}
