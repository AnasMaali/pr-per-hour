<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Features\Auth\Notifications\PasswordResetCodeNotification;
use App\Features\Auth\Notifications\VerifyEmailCodeNotification;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

final class TurnstileAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app['env'] = 'testing';

        RateLimiter::clear('otp-resend:verify_email:'.hash('sha256', 'client@example.com'));
        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', 'client@example.com'));
        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', 'missing@example.com'));
    }

    protected function tearDown(): void
    {
        $this->app['env'] = 'testing';
        parent::tearDown();
    }

    public function test_registration_does_not_require_turnstile_when_disabled(): void
    {
        Notification::fake();
        Config::set('turnstile.enabled', false);

        $this->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertCreated()
            ->assertJsonPath('data.email_verification_required', true);
    }

    public function test_registration_requires_turnstile_when_enabled(): void
    {
        $this->enableTurnstile();

        $this->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');

        $this->assertDatabaseMissing('users', ['email' => 'client@example.com']);
    }

    public function test_valid_turnstile_permits_registration(): void
    {
        Notification::fake();
        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'register');

        $response = $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'valid-token',
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.verification_sent', true)
            ->assertJsonMissingPath('data.token');

        $json = json_encode($response->json()) ?: '';
        $this->assertStringNotContainsString('1x0000000000000000000000000000000AA', $json);
        $this->assertStringNotContainsString('valid-token', $json);
    }

    public function test_invalid_turnstile_token_blocks_registration(): void
    {
        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => false,
                'error-codes' => ['invalid-input-response'],
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'bad-token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED')
            ->assertJsonPath('message', 'Human verification failed. Please try again.');

        $this->assertDatabaseMissing('users', ['email' => 'client@example.com']);
    }

    public function test_action_mismatch_fails_turnstile(): void
    {
        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'wrong_action');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_disallowed_hostname_fails_turnstile(): void
    {
        $this->enableTurnstile();
        Config::set('turnstile.expected_hostnames', ['app.example.com']);
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => true,
                'action' => 'register',
                'hostname' => 'evil.example.com',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_timeout_or_duplicate_fails_turnstile(): void
    {
        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => true,
                'action' => 'register',
                'hostname' => 'localhost',
                'error-codes' => ['timeout-or-duplicate'],
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_cloudflare_network_failure_fails_closed(): void
    {
        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => function () {
                throw new ConnectionException('connection refused');
            },
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_missing_secret_fails_closed_when_enabled(): void
    {
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.secret_key', '');
        Config::set('turnstile.expected_hostnames', []);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_secret_and_token_never_appear_in_api_response(): void
    {
        Notification::fake();
        $this->enableTurnstile();
        $secret = 'super-secret-turnstile-key-xyz';
        Config::set('turnstile.secret_key', $secret);
        $this->fakeTurnstileSuccess(action: 'register');

        $token = 'turnstile-client-token-abc123';
        $response = $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => $token,
        ]));

        $response->assertCreated();
        $body = $response->getContent() ?: '';
        $this->assertStringNotContainsString($secret, $body);
        $this->assertStringNotContainsString($token, $body);
    }

    public function test_resend_verification_requires_turnstile(): void
    {
        User::factory()->create([
            'email' => 'client@example.com',
            'email_verified_at' => null,
        ]);

        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response(['success' => false], 200),
        ]);

        $this->postJson('/api/v1/auth/email/verification-code', [
            'email' => 'client@example.com',
            'turnstile_token' => 'bad',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_resend_verification_accepts_valid_turnstile(): void
    {
        Notification::fake();
        User::factory()->create([
            'email' => 'client@example.com',
            'email_verified_at' => null,
        ]);

        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'resend_verification');

        $this->postJson('/api/v1/auth/email/verification-code', [
            'email' => 'client@example.com',
            'turnstile_token' => 'token',
        ])
            ->assertOk()
            ->assertJsonPath('data.sent', true);

        Notification::assertSentTo(
            User::query()->where('email', 'client@example.com')->firstOrFail(),
            VerifyEmailCodeNotification::class,
        );
    }

    public function test_forgot_password_requires_turnstile(): void
    {
        $this->enableTurnstile();

        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'client@example.com',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_forgot_password_remains_generic_with_valid_turnstile(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'client@example.com']);

        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'forgot_password');

        $known = $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'client@example.com',
            'turnstile_token' => 'token',
        ]);

        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', 'missing@example.com'));
        $this->fakeTurnstileSuccess(action: 'forgot_password');

        $unknown = $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'missing@example.com',
            'turnstile_token' => 'token-2',
        ]);

        $known->assertOk();
        $unknown->assertOk();
        $this->assertSame($known->json('message'), $unknown->json('message'));
        Notification::assertSentTo(
            User::query()->where('email', 'client@example.com')->firstOrFail(),
            PasswordResetCodeNotification::class,
        );
    }

    public function test_turnstile_does_not_replace_auth_rate_limits(): void
    {
        $route = Route::getRoutes()->getByName('api.v1.auth.register');
        $this->assertNotNull($route);
        $this->assertTrue(collect($route->gatherMiddleware())->contains('throttle:auth'));
    }

    public function test_registration_survives_mail_delivery_failure(): void
    {
        Config::set('turnstile.enabled', false);
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'scheme' => null,
            'url' => null,
            'host' => '127.0.0.1',
            'port' => 39999,
            'username' => null,
            'password' => null,
            'timeout' => 1,
            'local_domain' => null,
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertCreated()
            ->assertJsonPath('data.verification_sent', false);

        $this->assertDatabaseHas('users', ['email' => 'client@example.com']);
    }

    public function test_forgot_password_response_remains_generic_on_mail_failure(): void
    {
        Config::set('turnstile.enabled', false);
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'scheme' => null,
            'url' => null,
            'host' => '127.0.0.1',
            'port' => 39999,
            'username' => null,
            'password' => null,
            'timeout' => 1,
            'local_domain' => null,
        ]);

        User::factory()->create(['email' => 'client@example.com']);

        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'client@example.com',
        ])
            ->assertOk()
            ->assertJsonPath(
                'message',
                'If an account exists for this email, a reset code has been sent.',
            );
    }

    public function test_arabic_human_verification_message(): void
    {
        $this->enableTurnstile();

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/auth/register', $this->validRegistration())
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED')
            ->assertJsonPath('message', 'فشل التحقق البشري. يُرجى المحاولة مرة أخرى.');
    }

    public function test_local_official_test_secret_accepts_dummy_action_test(): void
    {
        Notification::fake();
        $this->app['env'] = 'local';
        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'test');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'XXXX.DUMMY.TOKEN.XXXX',
        ]))->assertCreated();
    }

    public function test_testing_official_test_secret_accepts_dummy_action_test(): void
    {
        Notification::fake();
        $this->app['env'] = 'testing';
        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'test');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'XXXX.DUMMY.TOKEN.XXXX',
        ]))->assertCreated();
    }

    public function test_production_rejects_dummy_action_test_for_register(): void
    {
        $this->app['env'] = 'production';
        $this->enableTurnstile();
        $this->fakeTurnstileSuccess(action: 'test');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'XXXX.DUMMY.TOKEN.XXXX',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');

        $this->assertDatabaseMissing('users', ['email' => 'client@example.com']);
    }

    public function test_local_non_test_secret_rejects_dummy_action_test(): void
    {
        $this->app['env'] = 'local';
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.secret_key', 'real-looking-production-secret-key');
        Config::set('turnstile.expected_hostnames', []);
        $this->fakeTurnstileSuccess(action: 'test');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'XXXX.DUMMY.TOKEN.XXXX',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_success_false_still_fails_with_official_test_secret(): void
    {
        $this->app['env'] = 'local';
        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => false,
                'action' => 'test',
                'error-codes' => ['invalid-input-response'],
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'bad-token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_timeout_or_duplicate_still_fails_with_official_test_secret(): void
    {
        $this->app['env'] = 'local';
        $this->enableTurnstile();
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => true,
                'action' => 'test',
                'hostname' => 'localhost',
                'error-codes' => ['timeout-or-duplicate'],
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'spent-token',
        ]))
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'HUMAN_VERIFICATION_FAILED');
    }

    public function test_production_matching_register_action_still_passes(): void
    {
        Notification::fake();
        $this->app['env'] = 'production';
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.secret_key', 'production-secret-not-a-test-key');
        Config::set('turnstile.expected_hostnames', []);
        $this->fakeTurnstileSuccess(action: 'register');

        $this->postJson('/api/v1/auth/register', $this->validRegistration([
            'turnstile_token' => 'live-token',
        ]))->assertCreated();
    }

    private function enableTurnstile(): void
    {
        Config::set('turnstile.enabled', true);
        Config::set('turnstile.secret_key', '1x0000000000000000000000000000000AA');
        Config::set('turnstile.expected_hostnames', []);
        Config::set('turnstile.timeout_seconds', 8);
    }

    private function fakeTurnstileSuccess(string $action): void
    {
        Http::fake([
            'challenges.cloudflare.com/*' => Http::response([
                'success' => true,
                'action' => $action,
                'hostname' => 'localhost',
            ], 200),
        ]);
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
