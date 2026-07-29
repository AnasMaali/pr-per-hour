<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Auth\Notifications\VerifyEmailCodeNotification;
use App\Features\Users\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

final class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_register_with_valid_data(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', $this->validRegistration());

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Account created. Please verify your email with the code we sent.')
            ->assertJsonPath('data.email', 'client@example.com')
            ->assertJsonPath('data.email_verification_required', true)
            ->assertJsonPath('data.verification_sent', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'email',
                    'email_verification_required',
                    'verification_sent',
                ],
            ])
            ->assertJsonMissingPath('data.token')
            ->assertJsonMissingPath('data.user');

        $this->assertDatabaseHas('users', [
            'email' => 'client@example.com',
            'role' => 'client',
            'status' => 'active',
        ]);

        $user = User::query()->where('email', 'client@example.com')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        $this->assertSame(0, $user->tokens()->count());
        Notification::assertSentTo($user, VerifyEmailCodeNotification::class);
    }

    public function test_registration_ignores_malicious_role_and_status_input(): void
    {
        Notification::fake();

        $payload = $this->validRegistration([
            'role' => 'admin',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.email_verification_required', true)
            ->assertJsonMissingPath('data.user');

        $user = User::query()->where('email', 'client@example.com')->firstOrFail();
        $this->assertSame(UserRole::Client, $user->role);
        $this->assertSame(UserStatus::Active, $user->status);
    }

    public function test_registration_hashes_password_and_does_not_store_confirmation(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'password' => 'SecretPass1',
            'password_confirmation' => 'SecretPass1',
        ]))->assertCreated();

        $user = User::query()->where('email', 'client@example.com')->firstOrFail();

        $this->assertNotSame('SecretPass1', $user->password);
        $this->assertTrue(Hash::check('SecretPass1', $user->password));
        $this->assertArrayNotHasKey('password_confirmation', $user->getAttributes());
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'client@example.com']);

        $response = $this->postJson('/api/v1/auth/register', $this->validRegistration());

        $response->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('error_code', 'VALIDATION_FAILED')
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_normalizes_email(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'email' => '  Client@Example.COM ',
        ]))->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'client@example.com']);
    }

    public function test_registration_allows_null_phone(): void
    {
        Notification::fake();

        $payload = $this->validRegistration();
        unset($payload['phone']);

        $this->postJson('/api/v1/auth/register', $payload)
            ->assertCreated()
            ->assertJsonPath('data.email', 'client@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'client@example.com',
            'phone' => null,
        ]);
    }

    public function test_registration_rejects_invalid_name_email_and_weak_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $payload = $this->validRegistration();
        unset($payload['password_confirmation']);

        $this->postJson('/api/v1/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_registration_returns_arabic_success_message(): void
    {
        Notification::fake();

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertCreated()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath(
                'message',
                'تم إنشاء الحساب. يُرجى التحقق من بريدك الإلكتروني باستخدام الرمز الذي أرسلناه.',
            );
    }

    public function test_registration_returns_english_success_message(): void
    {
        Notification::fake();

        $this->withHeader('X-Locale', 'en')
            ->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertCreated()
            ->assertHeader('Content-Language', 'en')
            ->assertJsonPath(
                'message',
                'Account created. Please verify your email with the code we sent.',
            );
    }

    public function test_active_verified_client_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'client@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login successful.')
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_unverified_client_login_requires_email_verification(): void
    {
        User::factory()->create([
            'email' => 'unverified@example.com',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'unverified@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('error_code', 'EMAIL_VERIFICATION_REQUIRED')
            ->assertJsonMissingPath('data.token');
    }

    public function test_active_admin_can_login(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_seeded_admin_is_verified_and_can_login(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'AdminPass123',
            'email_verified_at' => null,
        ]);

        // Mirror AdminUserSeeder: seeded admins must be marked verified.
        $admin->forceFill(['email_verified_at' => now()])->save();

        $this->assertNotNull($admin->fresh()?->email_verified_at);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'AdminPass123',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonPath('data.token_type', 'Bearer');
    }

    public function test_admin_user_seeder_marks_admin_verified(): void
    {
        putenv('PR_ADMIN_PASSWORD=AdminPass123');
        $_ENV['PR_ADMIN_PASSWORD'] = 'AdminPass123';
        $_SERVER['PR_ADMIN_PASSWORD'] = 'AdminPass123';

        $this->seed(AdminUserSeeder::class);

        $admin = User::query()->where('email', env('PR_ADMIN_EMAIL', 'admin@example.com'))->firstOrFail();
        $this->assertNotNull($admin->email_verified_at);
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertSame(UserStatus::Active, $admin->status);
    }

    public function test_wrong_password_and_unknown_email_share_generic_message(): void
    {
        User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $wrongPassword = $this->postJson('/api/v1/auth/login', [
            'email' => 'client@example.com',
            'password' => 'wrong-password',
        ]);

        $unknownEmail = $this->postJson('/api/v1/auth/login', [
            'email' => 'missing@example.com',
            'password' => 'password123',
        ]);

        $wrongPassword->assertUnprocessable();
        $unknownEmail->assertUnprocessable();

        $this->assertSame(
            $wrongPassword->json('errors.email.0'),
            $unknownEmail->json('errors.email.0'),
        );
        $this->assertSame(
            'These credentials do not match our records.',
            $wrongPassword->json('errors.email.0'),
        );
    }

    public function test_inactive_user_login_returns_403(): void
    {
        User::factory()->inactive()->create([
            'email' => 'inactive@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('error_code', 'INACTIVE_ACCOUNT')
            ->assertJsonPath('message', 'This account is inactive. Please contact support.');
    }

    public function test_login_revokes_existing_tokens_before_creating_new_token(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $existing = $user->createToken('existing-token');

        $this->postJson('/api/v1/auth/login', [
            'email' => 'client@example.com',
            'password' => 'password123',
        ])->assertOk();

        $this->assertNull(PersonalAccessToken::query()->find($existing->accessToken->id));
        $this->assertSame(1, $user->tokens()->count());
    }

    public function test_login_route_uses_auth_rate_limiter(): void
    {
        $route = Route::getRoutes()->getByName('api.v1.auth.login');

        $this->assertNotNull($route);
        $this->assertTrue(collect($route->gatherMiddleware())->contains('throttle:auth'));
        $this->assertNotNull(RateLimiter::limiter('auth'));
    }

    public function test_login_normalizes_email(): void
    {
        User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => '  Client@Example.COM ',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_unauthenticated_me_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('error_code', 'UNAUTHENTICATED')
            ->assertHeader('X-Request-ID');
    }

    public function test_authenticated_me_returns_expected_fields_without_secrets(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('client-access-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', 'client@example.com')
            ->assertJsonPath('message', 'Authenticated user retrieved successfully.')
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('X-Request-ID');

        $json = json_encode($response->json()) ?: '';
        $this->assertStringNotContainsString('password', strtolower($json));
        $this->assertStringNotContainsString('tokenable', strtolower($json));
        $this->assertArrayNotHasKey('token', $response->json('data') ?? []);
    }

    public function test_me_supports_arabic_locale(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('client-access-token')->plainTextToken;

        $this->withToken($token)
            ->withHeader('X-Locale', 'ar')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'تم استرجاع بيانات المستخدم المصادق عليه بنجاح.');
    }

    public function test_profile_can_update_name_and_phone_including_null_phone(): void
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'phone' => '1234567890',
        ]);
        $token = $user->createToken('client-access-token')->plainTextToken;

        $this->withToken($token)
            ->patchJson('/api/v1/auth/profile', [
                'name' => 'New Name',
                'phone' => null,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.phone', null)
            ->assertJsonPath('message', 'Profile updated successfully.');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'phone' => null,
        ]);
    }

    public function test_profile_rejects_protected_fields_and_empty_payload(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password123',
        ]);
        $token = $user->createToken('client-access-token')->plainTextToken;

        $this->withToken($token)
            ->patchJson('/api/v1/auth/profile', [
                'email' => 'hacker@example.com',
                'role' => 'admin',
                'status' => 'inactive',
                'password' => 'NewPassword1',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'role', 'status', 'password']);

        $this->withToken($token)
            ->patchJson('/api/v1/auth/profile', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['profile']);

        $user->refresh();
        $this->assertSame('client@example.com', $user->email);
        $this->assertSame(UserRole::Client, $user->role);
        $this->assertSame(UserStatus::Active, $user->status);
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    public function test_logout_deletes_current_token_only(): void
    {
        $user = User::factory()->create();
        $keep = $user->createToken('keep-token');
        $current = $user->createToken('current-token');

        $this->withToken($current->plainTextToken)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertNull(PersonalAccessToken::query()->find($current->accessToken->id));
        $this->assertNotNull(PersonalAccessToken::query()->find($keep->accessToken->id));

        // Simulate a fresh HTTP request (guards persist across calls in the same test process).
        $this->app['auth']->forgetGuards();

        $this->withToken($current->plainTextToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_unauthenticated_logout_returns_401(): void
    {
        $this->postJson('/api/v1/auth/logout')
            ->assertUnauthorized()
            ->assertJsonPath('error_code', 'UNAUTHENTICATED');
    }

    public function test_auth_works_with_email_verified_at_and_without_remember_token(): void
    {
        $user = User::factory()->create([
            'email' => 'schema@example.com',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $this->assertArrayHasKey('email_verified_at', $user->getAttributes());
        $this->assertArrayNotHasKey('remember_token', $user->getAttributes());

        $this->postJson('/api/v1/auth/login', [
            'email' => 'schema@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('error_code', 'EMAIL_VERIFICATION_REQUIRED');
    }

    public function test_only_required_auth_routes_exist(): void
    {
        $authRoutes = collect(Route::getRoutes())->filter(
            fn ($route) => str_starts_with($route->uri(), 'api/v1/auth'),
        );

        $expected = [
            'api/v1/auth/register' => 'POST',
            'api/v1/auth/login' => 'POST',
            'api/v1/auth/email/verification-code' => 'POST',
            'api/v1/auth/email/verify' => 'POST',
            'api/v1/auth/password/forgot' => 'POST',
            'api/v1/auth/password/reset' => 'POST',
            'api/v1/auth/logout' => 'POST',
            'api/v1/auth/me' => 'GET',
            'api/v1/auth/profile' => 'PATCH',
        ];

        $this->assertCount(count($expected), $authRoutes);

        foreach ($authRoutes as $route) {
            $methods = array_values(array_diff($route->methods(), ['HEAD']));
            $key = $route->uri();
            $this->assertArrayHasKey($key, $expected);
            $this->assertSame([$expected[$key]], $methods);
        }

        $uris = $authRoutes->map(fn ($route) => $route->uri())->all();
        $this->assertNotContains('api/v1/auth/forgot-password', $uris);
        $this->assertNotContains('api/v1/auth/social', $uris);
        $this->assertNotContains('api/v1/auth/admin/register', $uris);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validRegistration(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'phone' => '0599000000',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ], $overrides);
    }
}
