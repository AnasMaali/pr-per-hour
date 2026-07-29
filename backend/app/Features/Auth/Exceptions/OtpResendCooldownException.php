<?php

declare(strict_types=1);

namespace App\Features\Auth\Exceptions;

use Exception;

final class OtpResendCooldownException extends Exception
{
    public function __construct(
        public readonly int $retryAfterSeconds,
        string $message = '',
    ) {
        parent::__construct($message !== '' ? $message : 'Please wait before requesting another code.');
    }
}
