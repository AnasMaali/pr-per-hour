<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use App\Enums\BookingAvailabilityExceptionType;
use App\Features\Bookings\V2\Models\BookingCalendar;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

final class BookingAvailabilityResolver
{
    /**
     * @return array{
     *     working_windows: list<array{start:string,end:string}>,
     *     blocked_periods: list<array{start:string,end:string}>
     * }
     */
    public function resolve(
        BookingCalendar $calendar,
        string $date,
    ): array {
        $dayOfWeek = CarbonImmutable::parse(
            $date,
            $calendar->timezone
        )->dayOfWeek;

        $workingWindows = $calendar
            ->availabilityRules()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get()
            ->map(static fn ($rule): array => [
                'start' => (string) $rule->start_time,
                'end' => (string) $rule->end_time,
            ])
            ->values()
            ->all();

        $blockedPeriods = [];

        $exceptions = $calendar
            ->availabilityExceptions()
            ->whereDate('date', $date)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get();

        foreach ($exceptions as $exception) {
            $start = $exception->start_time !== null
                ? (string) $exception->start_time
                : null;

            $end = $exception->end_time !== null
                ? (string) $exception->end_time
                : null;

            if (($start === null) !== ($end === null)) {
                throw new InvalidArgumentException(
                    'Availability exception must define both start and end times.'
                );
            }

            if (
                $exception->type
                === BookingAvailabilityExceptionType::Blocked
            ) {
                if ($start === null && $end === null) {
                    return [
                        'working_windows' => [],
                        'blocked_periods' => [],
                    ];
                }

                $blockedPeriods[] = [
                    'start' => $start,
                    'end' => $end,
                ];

                continue;
            }

            if (
                $exception->type
                === BookingAvailabilityExceptionType::Available
            ) {
                if ($start === null || $end === null) {
                    throw new InvalidArgumentException(
                        'Available exception requires a start and end time.'
                    );
                }

                $workingWindows[] = [
                    'start' => $start,
                    'end' => $end,
                ];
            }
        }

        return [
            'working_windows' => $workingWindows,
            'blocked_periods' => $blockedPeriods,
        ];
    }
}
