<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Users\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $name = (string) env('PR_ADMIN_NAME', 'PR Per Hour Admin');
        $email = (string) env('PR_ADMIN_EMAIL', 'admin@example.com');
        $password = (string) env('PR_ADMIN_PASSWORD', '');

        if ($password === '') {
            throw new RuntimeException(
                'PR_ADMIN_PASSWORD must be set in the environment before seeding the admin user.',
            );
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'phone' => null,
                'email_verified_at' => now(),
            ],
        );

        $admin = User::query()->where('email', $email)->firstOrFail();
        $admin->role = UserRole::Admin;
        $admin->status = UserStatus::Active;
        $admin->email_verified_at = $admin->email_verified_at ?? now();
        $admin->save();
    }
}
