<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use App\Enums\BookingCalendarMode;
use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use Illuminate\Database\Eloquent\Builder;
use InvalidArgumentException;

final class BookingConflictDetector
{
    public function exists(
        string $bookingDate,
        string $startTime,
        string $endTime,
        ?int $serviceId = null,
        ?int $excludeBookingId = null,
    ): bool {
        $mode = BookingCalendarMode::tryFrom(
            (string) config('v2.bookings.calendar_mode', 'shared')
        );

        if ($mode === null) {
            throw new InvalidArgumentException(
                'Unsupported V2 booking calendar mode.'
            );
        }

        $query = Booking::query()
            ->whereDate('booking_date', $bookingDate)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Confirmed->value,
            ])
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime);

        if ($excludeBookingId !== null) {
            $query->whereKeyNot($excludeBookingId);
        }

        $this->applyCalendarScope(
            query: $query,
            mode: $mode,
            serviceId: $serviceId,
        );

        return $query->exists();
    }

    /**
     * Calendar scoping is centralized here so future modes such as
     * per-consultant or per-resource can be added without rewriting
     * booking creation, rescheduling, or availability generation.
     *
     * @param Builder<Booking> $query
     */
    private function applyCalendarScope(
        Builder $query,
        BookingCalendarMode $mode,
        ?int $serviceId,
    ): void {
        match ($mode) {
            BookingCalendarMode::Shared => null,
        };
    }
}
