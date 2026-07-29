<?php

declare(strict_types=1);

namespace App\Features\Auth\Models;

use App\Enums\OneTimeCodePurpose;
use App\Features\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OneTimeCode extends Model
{
    protected $fillable = [
        'user_id',
        'purpose',
        'code_hash',
        'expires_at',
        'attempts',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'purpose' => OneTimeCodePurpose::class,
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function hasExceededAttempts(int $maxAttempts): bool
    {
        return $this->attempts >= $maxAttempts;
    }
}
