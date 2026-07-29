<?php

declare(strict_types=1);

namespace App\Features\Bookings\Exceptions;

use RuntimeException;

final class BookingDomainException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
    ) {
        parent::__construct($message);
    }
}
