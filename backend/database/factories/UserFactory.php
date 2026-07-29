<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Users\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => null,
            'phone' => fake()->optional()->numerify('##########'),
            'password' => static::$password ??= Hash::make('password'),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => now(),
        ]);
    }

    public function configure(): static
    {
        return $this->afterMaking(function (User $user): void {
            if ($user->role === null) {
                $user->role = UserRole::Client;
            }

            if ($user->status === null) {
                $user->status = UserStatus::Active;
            }
        });
    }

    public function admin(): static
    {
        return $this->afterMaking(function (User $user): void {
            $user->role = UserRole::Admin;
        });
    }

    public function inactive(): static
    {
        return $this->afterMaking(function (User $user): void {
            $user->status = UserStatus::Inactive;
        });
    }

    public function client(): static
    {
        return $this->afterMaking(function (User $user): void {
            $user->role = UserRole::Client;
        });
    }
}
