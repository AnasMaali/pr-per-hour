<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Policies;

use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\Users\Models\User;

final class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, ContactMessage $contactMessage): bool
    {
        return $user->isAdmin();
    }

    public function updateStatus(User $user, ContactMessage $contactMessage): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, ContactMessage $contactMessage): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, ContactMessage $contactMessage): bool
    {
        return $user->isAdmin();
    }
}
