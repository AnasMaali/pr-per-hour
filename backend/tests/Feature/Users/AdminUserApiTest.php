<?php

declare(strict_types=1);

namespace Tests\Feature\Users;

use App\Enums\UserStatus;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AdminUserApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_registered_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create([
            'name' => 'Client One',
            'email' => 'client@example.com',
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/admin/users?search=client@example.com')
            ->assertOk()
            ->assertJsonPath('data.0.email', 'client@example.com')
            ->assertJsonPath('meta.total', 1);
    }

    public function test_client_cannot_list_users(): void
    {
        $client = User::factory()->create();
        $token = $client->createToken('client')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_deactivate_client_and_revoke_tokens(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();
        $client->createToken('client');
        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/v1/admin/users/{$client->id}/status", [
                'status' => 'inactive',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $client->refresh();
        $this->assertSame(UserStatus::Inactive, $client->status);
        $this->assertSame(0, $client->tokens()->count());
    }

    public function test_admin_accounts_cannot_be_deactivated_from_v1_user_management(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/v1/admin/users/{$otherAdmin->id}/status", [
                'status' => 'inactive',
            ])
            ->assertForbidden();
    }
}
