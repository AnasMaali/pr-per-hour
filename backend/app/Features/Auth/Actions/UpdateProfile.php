<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Features\Auth\DTOs\UpdateProfileData;
use App\Features\Users\Models\User;

final class UpdateProfile
{
    public function execute(User $user, UpdateProfileData $data): User
    {
        $attributes = $data->attributes();

        if (array_key_exists('name', $attributes)) {
            $user->name = $attributes['name'];
        }

        if (array_key_exists('phone', $attributes)) {
            $user->phone = $attributes['phone'];
        }

        $user->save();

        return $user->refresh();
    }
}
