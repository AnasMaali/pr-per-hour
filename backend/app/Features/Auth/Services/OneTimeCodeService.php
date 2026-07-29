<?php

declare(strict_types=1);

namespace App\Features\Auth\Services;

use App\Enums\OneTimeCodePurpose;
use App\Features\Auth\Exceptions\CodeAttemptsExceededException;
use App\Features\Auth\Exceptions\InvalidOrExpiredCodeException;
use App\Features\Auth\Models\OneTimeCode;
use App\Features\Users\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

final class OneTimeCodeService
{
    /**
     * Issue a new code for the user and purpose. Invalidates prior active codes.
     * Returns the plain six-digit code for delivery only — never persist or log it.
     */
    public function issue(User $user, OneTimeCodePurpose $purpose): string
    {
        $length = $this->codeLength();
        $plainCode = $this->generatePlainCode($length);
        $hash = $this->hashCode($plainCode);
        $expiresAt = now()->addMinutes($this->expiresMinutes());

        DB::transaction(function () use ($user, $purpose, $hash, $expiresAt): void {
            $this->invalidateActiveCodes($user, $purpose);

            OneTimeCode::query()->create([
                'user_id' => $user->id,
                'purpose' => $purpose,
                'code_hash' => $hash,
                'expires_at' => $expiresAt,
                'attempts' => 0,
                'used_at' => null,
            ]);
        });

        return $plainCode;
    }

    /**
     * Atomically verify and consume a code.
     *
     * Failed-attempt increments commit inside the transaction; API exceptions are
     * thrown only after commit so they are not rolled back.
     *
     * Attempt semantics (max failed attempts = 5):
     * - Attempts 1–5 with a wrong code: persist increment, InvalidOrExpired
     * - Attempt 6+: no comparison, AttemptsExceeded
     *
     * @throws InvalidOrExpiredCodeException
     * @throws CodeAttemptsExceededException
     */
    public function consume(User $user, OneTimeCodePurpose $purpose, string $plainCode): OneTimeCode
    {
        $plainCode = $this->normalizeCode($plainCode);
        $formatOk = $this->isValidFormat($plainCode);
        $expectedHash = $formatOk ? $this->hashCode($plainCode) : null;

        $result = DB::transaction(function () use ($user, $purpose, $expectedHash): OneTimeCodeConsumeResult {
            /** @var OneTimeCode|null $record */
            $record = OneTimeCode::query()
                ->where('user_id', $user->id)
                ->where('purpose', $purpose->value)
                ->whereNull('used_at')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($record === null || $record->isExpired()) {
                return new OneTimeCodeConsumeResult(OneTimeCodeConsumeStatus::InvalidOrExpired);
            }

            $maxAttempts = $this->maxAttempts();

            // Attempt 6+: already at the failed-attempt cap — do not compare again.
            if ($record->hasExceededAttempts($maxAttempts)) {
                return new OneTimeCodeConsumeResult(OneTimeCodeConsumeStatus::AttemptsExceeded);
            }

            if ($expectedHash === null || ! hash_equals($record->code_hash, $expectedHash)) {
                $record->attempts = $record->attempts + 1;
                $record->save();

                // Attempts 1–5 (including the one that reaches the cap) stay
                // InvalidOrExpired; only the next request is AttemptsExceeded.
                return new OneTimeCodeConsumeResult(OneTimeCodeConsumeStatus::InvalidOrExpired);
            }

            $record->used_at = now();
            $record->save();

            return new OneTimeCodeConsumeResult(
                OneTimeCodeConsumeStatus::Success,
                $record->fresh() ?? $record,
            );
        });

        return match ($result->status) {
            OneTimeCodeConsumeStatus::Success => $result->code
                ?? throw new RuntimeException('Successful OTP consume missing code row.'),
            OneTimeCodeConsumeStatus::AttemptsExceeded => throw new CodeAttemptsExceededException,
            OneTimeCodeConsumeStatus::InvalidOrExpired => throw new InvalidOrExpiredCodeException,
        };
    }

    public function hashCode(string $plainCode): string
    {
        return hash_hmac('sha256', $this->normalizeCode($plainCode), $this->hmacKey());
    }

    public function generatePlainCode(?int $length = null): string
    {
        $length ??= $this->codeLength();

        if ($length < 4 || $length > 12) {
            throw new InvalidArgumentException('OTP length must be between 4 and 12.');
        }

        $max = (10 ** $length) - 1;
        $number = random_int(0, $max);

        return str_pad((string) $number, $length, '0', STR_PAD_LEFT);
    }

    public function isValidFormat(string $plainCode): bool
    {
        $length = $this->codeLength();

        return (bool) preg_match('/^\d{'.$length.'}$/', $plainCode);
    }

    public function normalizeCode(string $plainCode): string
    {
        return trim($plainCode);
    }

    public function codeLength(): int
    {
        return max(4, min(12, (int) config('otp.length', 6)));
    }

    public function expiresMinutes(): int
    {
        return max(1, (int) config('otp.expires_minutes', 10));
    }

    public function maxAttempts(): int
    {
        return max(1, (int) config('otp.max_attempts', 5));
    }

    public function resendSeconds(): int
    {
        return max(1, (int) config('otp.resend_seconds', 60));
    }

    private function invalidateActiveCodes(User $user, OneTimeCodePurpose $purpose): void
    {
        OneTimeCode::query()
            ->where('user_id', $user->id)
            ->where('purpose', $purpose->value)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);
    }

    private function hmacKey(): string
    {
        $appKey = (string) config('app.key');

        if ($appKey === '') {
            throw new RuntimeException('Application key is required to hash one-time codes.');
        }

        return hash('sha256', $appKey.'|otp-code-hmac', true);
    }
}
