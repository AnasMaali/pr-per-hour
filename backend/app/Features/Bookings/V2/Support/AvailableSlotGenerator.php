<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Support;

use InvalidArgumentException;

final class AvailableSlotGenerator
{
    /**
     * @param  list<array{start: string, end: string}>  $workingWindows
     * @param  list<array{start: string, end: string}>  $busyPeriods
     * @return list<array{start_time: string, end_time: string}>
     */
    public function generate(
        array $workingWindows,
        array $busyPeriods,
        int $durationMinutes,
        int $stepMinutes = 30,
    ): array {
        if ($durationMinutes <= 0) {
            throw new InvalidArgumentException(
                'Duration must be greater than zero.'
            );
        }

        if ($stepMinutes <= 0) {
            throw new InvalidArgumentException(
                'Slot step must be greater than zero.'
            );
        }

        $busy = array_map(
            fn (array $period): array => [
                'start' => $this->toMinutes($period['start']),
                'end' => $this->toMinutes($period['end']),
            ],
            $busyPeriods
        );

        $slots = [];

        foreach ($workingWindows as $window) {
            $windowStart = $this->toMinutes($window['start']);
            $windowEnd = $this->toMinutes($window['end']);

            if ($windowEnd <= $windowStart) {
                throw new InvalidArgumentException(
                    'Working window end must be after start.'
                );
            }

            for (
                $start = $windowStart;
                $start + $durationMinutes <= $windowEnd;
                $start += $stepMinutes
            ) {
                $end = $start + $durationMinutes;

                $hasConflict = false;

                foreach ($busy as $period) {
                    if (
                        $start < $period['end']
                        && $end > $period['start']
                    ) {
                        $hasConflict = true;

                        break;
                    }
                }

                if ($hasConflict) {
                    continue;
                }

                $startTime = $this->fromMinutes($start);
                $endTime = $this->fromMinutes($end);
                $key = $startTime.'-'.$endTime;

                $slots[$key] = [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ];
            }
        }

        $slots = array_values($slots);

        usort(
            $slots,
            static fn (array $a, array $b): int =>
                [$a['start_time'], $a['end_time']]
                <=>
                [$b['start_time'], $b['end_time']]
        );

        return $slots;
    }

    private function toMinutes(string $time): int
    {
        $normalized = strlen($time) === 5
            ? $time.':00'
            : $time;

        if (
            preg_match(
                '/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/',
                $normalized
            ) !== 1
        ) {
            throw new InvalidArgumentException(
                'Invalid time value.'
            );
        }

        [$hours, $minutes] = array_map(
            'intval',
            array_slice(explode(':', $normalized), 0, 2)
        );

        return ($hours * 60) + $minutes;
    }

    private function fromMinutes(int $minutes): string
    {
        if ($minutes < 0 || $minutes >= 24 * 60) {
            throw new InvalidArgumentException(
                'Time is outside the supported day.'
            );
        }

        return sprintf(
            '%02d:%02d',
            intdiv($minutes, 60),
            $minutes % 60
        );
    }
}
