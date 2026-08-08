<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use InvalidArgumentException;

final class BookingTimeCalculator
{
    public function calculateEndTime(
        string $startTime,
        ?int $durationMinutes,
    ): string {
        if ($durationMinutes === null || $durationMinutes <= 0) {
            throw new InvalidArgumentException(
                'Booking service must have a positive duration.'
            );
        }

        $normalized = strlen($startTime) === 5
            ? $startTime.':00'
            : $startTime;

        if (
            preg_match(
                '/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/',
                $normalized
            ) !== 1
        ) {
            throw new InvalidArgumentException(
                'Invalid booking start time.'
            );
        }

        [$hours, $minutes] = array_map(
            'intval',
            array_slice(explode(':', $normalized), 0, 2)
        );

        $startMinutes = ($hours * 60) + $minutes;
        $endMinutes = $startMinutes + $durationMinutes;

        if ($endMinutes >= 24 * 60) {
            throw new InvalidArgumentException(
                'Booking duration cannot cross midnight.'
            );
        }

        $endHours = intdiv($endMinutes, 60);
        $endMinutePart = $endMinutes % 60;

        return sprintf(
            '%02d:%02d:00',
            $endHours,
            $endMinutePart
        );
    }
}
