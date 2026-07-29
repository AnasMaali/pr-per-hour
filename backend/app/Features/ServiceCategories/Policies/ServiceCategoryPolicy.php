<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Policies;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Users\Models\User;

final class ServiceCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, ServiceCategory $serviceCategory): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, ServiceCategory $serviceCategory): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, ServiceCategory $serviceCategory): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, ServiceCategory $serviceCategory): bool
    {
        return $user->isAdmin();
    }
}
