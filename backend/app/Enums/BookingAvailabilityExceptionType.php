<?php

declare(strict_types=1);

namespace App\Enums;

enum BookingAvailabilityExceptionType: string
{
    case Blocked = 'blocked';
    case Available = 'available';
}
