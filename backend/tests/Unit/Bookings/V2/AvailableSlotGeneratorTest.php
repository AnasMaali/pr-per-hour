<?php

declare(strict_types=1);

namespace Tests\Unit\Bookings\V2;

use App\Features\Bookings\V2\Support\AvailableSlotGenerator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class AvailableSlotGeneratorTest extends TestCase
{
    public function test_it_generates_slots_inside_working_window(): void
    {
        $slots = (new AvailableSlotGenerator)->generate(
            workingWindows: [
                ['start' => '09:00', 'end' => '12:00'],
            ],
            busyPeriods: [],
            durationMinutes: 60,
            stepMinutes: 30,
        );

        $this->assertSame([
            ['start_time' => '09:00', 'end_time' => '10:00'],
            ['start_time' => '09:30', 'end_time' => '10:30'],
            ['start_time' => '10:00', 'end_time' => '11:00'],
            ['start_time' => '10:30', 'end_time' => '11:30'],
            ['start_time' => '11:00', 'end_time' => '12:00'],
        ], $slots);
    }

    public function test_it_removes_slots_that_overlap_existing_booking(): void
    {
        $slots = (new AvailableSlotGenerator)->generate(
            workingWindows: [
                ['start' => '09:00', 'end' => '13:00'],
            ],
            busyPeriods: [
                ['start' => '10:00', 'end' => '11:00'],
            ],
            durationMinutes: 60,
            stepMinutes: 30,
        );

        $this->assertSame([
            ['start_time' => '09:00', 'end_time' => '10:00'],
            ['start_time' => '11:00', 'end_time' => '12:00'],
            ['start_time' => '11:30', 'end_time' => '12:30'],
            ['start_time' => '12:00', 'end_time' => '13:00'],
        ], $slots);
    }

    public function test_it_supports_multiple_working_windows(): void
    {
        $slots = (new AvailableSlotGenerator)->generate(
            workingWindows: [
                ['start' => '09:00', 'end' => '11:00'],
                ['start' => '13:00', 'end' => '15:00'],
            ],
            busyPeriods: [],
            durationMinutes: 60,
            stepMinutes: 60,
        );

        $this->assertSame([
            ['start_time' => '09:00', 'end_time' => '10:00'],
            ['start_time' => '10:00', 'end_time' => '11:00'],
            ['start_time' => '13:00', 'end_time' => '14:00'],
            ['start_time' => '14:00', 'end_time' => '15:00'],
        ], $slots);
    }

    public function test_it_rejects_invalid_duration(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new AvailableSlotGenerator)->generate(
            workingWindows: [],
            busyPeriods: [],
            durationMinutes: 0,
        );
    }

    public function test_it_rejects_invalid_step(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new AvailableSlotGenerator)->generate(
            workingWindows: [],
            busyPeriods: [],
            durationMinutes: 60,
            stepMinutes: 0,
        );
    }

    public function test_it_rejects_invalid_working_window(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new AvailableSlotGenerator)->generate(
            workingWindows: [
                ['start' => '17:00', 'end' => '09:00'],
            ],
            busyPeriods: [],
            durationMinutes: 60,
        );
    }
}
