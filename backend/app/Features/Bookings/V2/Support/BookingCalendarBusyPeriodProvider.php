<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use App\Enums\BookingCalendarMode;
use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\Models\BookingCalendar;
use Illuminate\Database\Eloquent\Builder;

final class BookingCalendarBusyPeriodProvider
{
    /**
     * @return list<array{start:string,end:string}>
     */
    public function forDate(
        BookingCalendar $calendar,
        string $date,
    ): array {
        $query = Booking::query()
            ->whereDate('booking_date', $date)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Confirmed->value,
            ])
            ->where(function (Builder $query) use ($calendar): void {
                $query->whereExists(
                    function ($subquery) use ($calendar): void {
                        $subquery
                            ->selectRaw('1')
                            ->from('booking_calendar_assignments')
                            ->whereColumn(
                                'booking_calendar_assignments.booking_id',
                                'bookings.id'
                            )
                            ->where(
                                'booking_calendar_assignments.calendar_id',
                                $calendar->id
                            );
                    }
                );

                if ($this->shouldIncludeLegacyBookings($calendar)) {
                    $query->orWhereNotExists(
                        function ($subquery): void {
                            $subquery
                                ->selectRaw('1')
                                ->from('booking_calendar_assignments')
                                ->whereColumn(
                                    'booking_calendar_assignments.booking_id',
                                    'bookings.id'
                                );
                        }
                    );
                }
            })
            ->orderBy('start_time');

        return $query
            ->get(['start_time', 'end_time'])
            ->map(static fn (Booking $booking): array => [
                'start' => (string) $booking->start_time,
                'end' => (string) $booking->end_time,
            ])
            ->values()
            ->all();
    }

    private function shouldIncludeLegacyBookings(
        BookingCalendar $calendar,
    ): bool {
        $mode = BookingCalendarMode::tryFrom(
            (string) config(
                'v2.bookings.calendar_mode',
                BookingCalendarMode::Shared->value
            )
        );

        if ($mode !== BookingCalendarMode::Shared) {
            return false;
        }

        return $calendar->slug === (string) config(
            'v2.bookings.default_calendar_slug',
            'pr-per-hour-shared'
        );
    }
}
