<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Models\OneTimeCode;
use App\Features\Auth\Notifications\PasswordResetCodeNotification;
use App\Features\Auth\Notifications\VerifyEmailCodeNotification;
use App\Features\Auth\Services\OneTimeCodeService;
use App\Features\Users\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

final class OneTimeCodeAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('otp-resend:verify_email:'.hash('sha256', 'client@example.com'));
        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', 'client@example.com'));
        RateLimiter::clear('otp-resend:verify_email:'.hash('sha256', 'missing@example.com'));
        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', 'missing@example.com'));
    }

    public function test_verification_code_can_be_issued_and_notification_is_sent(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();

        $this->postJson('/api/v1/auth/email/verification-code', [
            'email' => $user->email,
        ])
            ->assertOk()
            ->assertJsonPath('success', true);

        Notification::assertSentTo($user, VerifyEmailCodeNotification::class);

        $row = OneTimeCode::query()->where('user_id', $user->id)->first();
        $this->assertNotNull($row);
        $this->assertSame(OneTimeCodePurpose::VerifyEmail, $row->purpose);
        $this->assertNull($row->used_at);
        $this->assertTrue(strlen($row->code_hash) >= 32);
        $this->assertDoesNotMatchRegularExpression('/^\d{6}$/', $row->code_hash);
    }

    public function test_plain_code_is_not_stored_in_database(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();
        $plain = null;

        $this->postJson('/api/v1/auth/email/verification-code', ['email' => $user->email])->assertOk();

        Notification::assertSentTo(
            $user,
            VerifyEmailCodeNotification::class,
            function (VerifyEmailCodeNotification $notification) use (&$plain): bool {
                $plain = $notification->plainCode;

                return true;
            },
        );

        $this->assertNotNull($plain);
        $this->assertMatchesRegularExpression('/^\d{6}$/', $plain);
        $this->assertDatabaseMissing('one_time_codes', ['code_hash' => $plain]);
        $hashes = OneTimeCode::query()->pluck('code_hash')->all();
        $this->assertNotContains($plain, $hashes);
    }

    public function test_correct_code_verifies_email_without_issuing_token(): void
    {
        Event::fake([Verified::class]);
        Notification::fake();
        $user = $this->unverifiedUser();
        $code = $this->issueVerificationCode($user);

        $response = $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonMissingPath('data.token');

        $this->assertNotNull($user->fresh()?->email_verified_at);
        $this->assertNotNull(OneTimeCode::query()->where('user_id', $user->id)->value('used_at'));
        Event::assertDispatched(Verified::class);
    }

    public function test_wrong_code_fails_and_increments_attempts(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();
        $this->issueVerificationCode($user);

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => '000000',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_OR_EXPIRED_CODE');

        $this->assertSame(1, (int) OneTimeCode::query()->where('user_id', $user->id)->value('attempts'));
        $this->assertNull($user->fresh()?->email_verified_at);
    }

    public function test_sixth_attempt_is_blocked_after_five_failures(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();
        $this->issueVerificationCode($user);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/email/verify', [
                'email' => $user->email,
                'code' => '11111'.$i,
            ])->assertStatus(422);
        }

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => '999999',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'CODE_ATTEMPTS_EXCEEDED');
    }

    public function test_expired_and_used_verification_codes_fail(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();
        $service = app(OneTimeCodeService::class);
        $plain = $service->issue($user, OneTimeCodePurpose::VerifyEmail);

        OneTimeCode::query()->where('user_id', $user->id)->update([
            'expires_at' => now()->subMinute(),
        ]);

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $plain,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_OR_EXPIRED_CODE');

        $fresh = $service->issue($user, OneTimeCodePurpose::VerifyEmail);
        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $fresh,
        ])->assertOk();

        // Used-code replay must fail even though email_verified_at is now set.
        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $fresh,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_OR_EXPIRED_CODE');
    }

    public function test_new_verification_code_invalidates_old_code(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser();
        $old = $this->issueVerificationCode($user);

        RateLimiter::clear('otp-resend:verify_email:'.hash('sha256', $user->email));
        $new = $this->issueVerificationCode($user);

        $this->assertNotSame($old, $new);

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $old,
        ])->assertStatus(422);

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $new,
        ])->assertOk();
    }

    public function test_already_verified_user_cannot_request_another_code(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'verified@example.com',
            'password' => 'Password123',
            'email_verified_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/email/verification-code', [
            'email' => $user->email,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'EMAIL_ALREADY_VERIFIED');

        Notification::assertNothingSent();
    }

    public function test_verification_code_request_is_rate_limited(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser('rate-verify@example.com');

        $this->postJson('/api/v1/auth/email/verification-code', ['email' => $user->email])->assertOk();
        $this->postJson('/api/v1/auth/email/verification-code', ['email' => $user->email])
            ->assertStatus(429)
            ->assertJsonPath('error_code', 'TOO_MANY_REQUESTS');
    }

    public function test_verification_notification_respects_arabic_locale(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser('ar-verify@example.com');

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/auth/email/verification-code', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo(
            $user,
            VerifyEmailCodeNotification::class,
            function (VerifyEmailCodeNotification $notification) use ($user): bool {
                $mail = $notification->toMail($user);
                // MailMessage::render() returns HtmlString — cast before str_contains.
                $rendered = (string) $mail->render();

                return str_contains((string) ($mail->subject ?? ''), 'PR Per Hour')
                    && (
                        str_contains($rendered, 'رمز')
                        || str_contains((string) $mail->greeting, 'مرحب')
                    );
            },
        );
    }

    public function test_forgot_password_returns_generic_response_for_existing_and_missing_emails(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser('reset@example.com');

        $existing = $this->postJson('/api/v1/auth/password/forgot', ['email' => $user->email]);
        $missing = $this->postJson('/api/v1/auth/password/forgot', ['email' => 'missing@example.com']);

        $existing->assertOk();
        $missing->assertOk();
        $this->assertSame(
            $existing->json('message'),
            $missing->json('message'),
        );

        Notification::assertSentTo($user, PasswordResetCodeNotification::class);
        Notification::assertSentTimes(PasswordResetCodeNotification::class, 1);
    }

    public function test_correct_reset_code_changes_password_and_revokes_tokens(): void
    {
        Event::fake([PasswordReset::class]);
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'reset-ok@example.com',
            'password' => 'OldPassword1',
            'email_verified_at' => now(),
        ]);
        $oldToken = $user->createToken('client-access-token')->plainTextToken;
        $code = $this->issuePasswordResetCode($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonMissingPath('data.token');

        $this->assertTrue(Hash::check('NewPassword1', $user->fresh()->password));
        $this->assertFalse(Hash::check('OldPassword1', $user->fresh()->password));
        $this->assertSame(0, $user->fresh()->tokens()->count());

        $this->withToken($oldToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'NewPassword1',
        ])->assertOk();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'OldPassword1',
        ])->assertStatus(422);

        Event::assertDispatched(PasswordReset::class);
    }

    public function test_wrong_expired_and_used_reset_codes_fail(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'reset-fail@example.com',
            'password' => 'Password123',
        ]);
        $service = app(OneTimeCodeService::class);
        $plain = $service->issue($user, OneTimeCodePurpose::PasswordReset);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => '000000',
            'password' => 'Password1234',
            'password_confirmation' => 'Password1234',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'RESET_CODE_INVALID');

        OneTimeCode::query()->where('user_id', $user->id)->update([
            'expires_at' => now()->subMinute(),
            'attempts' => 0,
        ]);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $plain,
            'password' => 'Password1234',
            'password_confirmation' => 'Password1234',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'RESET_CODE_INVALID');

        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', $user->email));
        $fresh = $this->issuePasswordResetCode($user);
        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $fresh,
            'password' => 'Password1234',
            'password_confirmation' => 'Password1234',
        ])->assertOk();

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $fresh,
            'password' => 'Password12345',
            'password_confirmation' => 'Password12345',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'RESET_CODE_INVALID');
    }

    public function test_password_policy_is_enforced_on_reset(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'policy@example.com',
            'password' => 'Password123',
        ]);
        $code = $this->issuePasswordResetCode($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_purposes_cannot_be_exchanged(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser('purpose@example.com');
        $verifyCode = $this->issueVerificationCode($user);

        RateLimiter::clear('otp-resend:password_reset:'.hash('sha256', $user->email));
        $resetCode = $this->issuePasswordResetCode($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'code' => $verifyCode,
            'password' => 'Password1234',
            'password_confirmation' => 'Password1234',
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'RESET_CODE_INVALID');

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $resetCode,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_OR_EXPIRED_CODE');
    }

    public function test_code_cannot_be_consumed_twice_concurrently_safe_path(): void
    {
        Notification::fake();
        $user = $this->unverifiedUser('once@example.com');
        $code = $this->issueVerificationCode($user);

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $code,
        ])->assertOk();

        $user->forceFill(['email_verified_at' => null])->save();

        $this->postJson('/api/v1/auth/email/verify', [
            'email' => $user->email,
            'code' => $code,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'INVALID_OR_EXPIRED_CODE');
    }

    public function test_otp_prune_command_removes_old_rows(): void
    {
        $user = $this->unverifiedUser('prune@example.com');
        $service = app(OneTimeCodeService::class);
        $service->issue($user, OneTimeCodePurpose::VerifyEmail);

        OneTimeCode::query()->update([
            'used_at' => now()->subDays(30),
            'expires_at' => now()->subDays(30),
        ]);

        $this->artisan('otp:prune')->assertSuccessful();
        $this->assertSame(0, OneTimeCode::query()->count());
    }

    private function unverifiedUser(string $email = 'client@example.com'): User
    {
        return User::factory()->create([
            'email' => $email,
            'password' => 'Password123',
            'email_verified_at' => null,
        ]);
    }

    private function issueVerificationCode(User $user): string
    {
        $plain = '';

        $this->postJson('/api/v1/auth/email/verification-code', [
            'email' => $user->email,
        ])->assertOk();

        Notification::assertSentTo(
            $user,
            VerifyEmailCodeNotification::class,
            function (VerifyEmailCodeNotification $notification) use (&$plain): bool {
                $plain = $notification->plainCode;

                return true;
            },
        );

        return $plain;
    }

    private function issuePasswordResetCode(User $user): string
    {
        $plain = '';

        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => $user->email,
        ])->assertOk();

        Notification::assertSentTo(
            $user,
            PasswordResetCodeNotification::class,
            function (PasswordResetCodeNotification $notification) use (&$plain): bool {
                $plain = $notification->plainCode;

                return true;
            },
        );

        return $plain;
    }
}
