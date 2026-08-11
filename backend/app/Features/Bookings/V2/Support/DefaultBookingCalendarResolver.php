<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\V2\Models\BookingCalendar;

final class DefaultBookingCalendarResolver
{
    public function resolve(): BookingCalendar
    {
        $slug = (string) config(
            'v2.bookings.default_calendar_slug',
            'pr-per-hour-shared'
        );

        $calendar = BookingCalendar::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if ($calendar === null) {
            throw new BookingDomainException(
                'BOOKING_CALENDAR_UNAVAILABLE',
                'The booking calendar is unavailable.',
            );
        }

        return $calendar;
    }
}
