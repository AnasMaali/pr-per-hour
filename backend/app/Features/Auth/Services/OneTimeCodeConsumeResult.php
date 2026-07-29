<?php

declare(strict_types=1);

namespace App\Features\Auth\Services;

use App\Features\Auth\Models\OneTimeCode;

/**
 * Typed consume outcome returned after the DB transaction commits.
 */
final readonly class OneTimeCodeConsumeResult
{
    public function __construct(
        public OneTimeCodeConsumeStatus $status,
        public ?OneTimeCode $code = null,
    ) {}
}
