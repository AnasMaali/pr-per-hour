<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\V2\Models\BookingCalendar;
use App\Features\Services\Models\Service;
use Carbon\CarbonImmutable;

final class AvailableSlotsService
{
    public function __construct(
        private readonly BookingAvailabilityResolver $availabilityResolver,
        private readonly BookingCalendarBusyPeriodProvider $busyPeriodProvider,
        private readonly AvailableSlotGenerator $slotGenerator,
    ) {}

    /**
     * @return list<array{start_time:string,end_time:string}>
     */
    public function forServiceAndDate(
        Service $service,
        BookingCalendar $calendar,
        string $date,
    ): array {
        if (! $calendar->is_active) {
            throw new BookingDomainException(
                'BOOKING_CALENDAR_UNAVAILABLE',
                'The booking calendar is unavailable.',
            );
        }

        $duration = $service->duration_minutes;

        if ($duration === null || $duration <= 0) {
            throw new BookingDomainException(
                'BOOKING_DURATION_INVALID',
                __('bookings.service_unavailable'),
            );
        }

        $availability = $this->availabilityResolver->resolve(
            $calendar,
            $date
        );

        if ($availability['working_windows'] === []) {
            return [];
        }

        $busyPeriods = array_merge(
            $availability['blocked_periods'],
            $this->busyPeriodProvider->forDate(
                $calendar,
                $date
            )
        );

        $slots = $this->slotGenerator->generate(
            workingWindows: $availability['working_windows'],
            busyPeriods: $busyPeriods,
            durationMinutes: $duration,
            stepMinutes: (int) config(
                'v2.bookings.slot_step_minutes',
                30
            ),
        );

        return $this->removePastSlots(
            $slots,
            $date,
            $calendar->timezone
        );
    }

    /**
     * @param  list<array{start_time:string,end_time:string}>  $slots
     * @return list<array{start_time:string,end_time:string}>
     */
    private function removePastSlots(
        array $slots,
        string $date,
        string $timezone,
    ): array {
        $now = CarbonImmutable::now($timezone);
        $requestedDate = CarbonImmutable::parse(
            $date,
            $timezone
        )->startOfDay();

        if ($requestedDate->lessThan($now->startOfDay())) {
            return [];
        }

        if (! $requestedDate->equalTo($now->startOfDay())) {
            return $slots;
        }

        return array_values(array_filter(
            $slots,
            static fn (array $slot): bool =>
                CarbonImmutable::parse(
                    $date.' '.$slot['start_time'],
                    $timezone
                )->greaterThan($now)
        ));
    }
}
