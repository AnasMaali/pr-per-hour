<?php

declare(strict_types=1);

namespace App\Features\Services\Policies;

use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;

final class ServicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Service $service): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Service $service): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Service $service): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Service $service): bool
    {
        return $user->isAdmin();
    }
}
