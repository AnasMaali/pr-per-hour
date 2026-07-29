<?php

declare(strict_types=1);

namespace App\Features\Bookings\Actions;

use App\Enums\BookingStatus;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use Carbon\CarbonImmutable;

final class CancelBooking
{
    public function execute(Booking $booking): Booking
    {
        if (! in_array($booking->status, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            throw new BookingDomainException(
                'BOOKING_CANNOT_BE_CANCELLED',
                __('bookings.cannot_cancel'),
            );
        }

        $startsAt = CarbonImmutable::parse(
            $booking->booking_date->format('Y-m-d').' '.$this->normalizeTime((string) $booking->start_time),
            config('app.timezone'),
        );

        if ($startsAt->lessThanOrEqualTo(CarbonImmutable::now(config('app.timezone')))) {
            throw new BookingDomainException(
                'BOOKING_CANNOT_BE_CANCELLED',
                __('bookings.cannot_cancel'),
            );
        }

        $booking->status = BookingStatus::Cancelled;
        $booking->save();

        return $booking->refresh()->load(['service.category']);
    }

    private function normalizeTime(string $time): string
    {
        return strlen($time) === 5 ? $time.':00' : $time;
    }
}
