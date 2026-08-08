<?php

declare(strict_types=1);

namespace Tests\Unit\Bookings\V2;

use App\Features\Bookings\V2\Support\BookingTimeCalculator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class BookingTimeCalculatorTest extends TestCase
{
    public function test_it_calculates_end_time_from_service_duration(): void
    {
        $calculator = new BookingTimeCalculator;

        $this->assertSame(
            '11:00:00',
            $calculator->calculateEndTime('10:00', 60)
        );

        $this->assertSame(
            '15:45:00',
            $calculator->calculateEndTime('14:15', 90)
        );
    }

    public function test_it_accepts_normalized_database_time(): void
    {
        $calculator = new BookingTimeCalculator;

        $this->assertSame(
            '10:30:00',
            $calculator->calculateEndTime('10:00:00', 30)
        );
    }

    public function test_it_rejects_missing_duration(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new BookingTimeCalculator)
            ->calculateEndTime('10:00', null);
    }

    public function test_it_rejects_zero_duration(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new BookingTimeCalculator)
            ->calculateEndTime('10:00', 0);
    }

    public function test_it_rejects_negative_duration(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new BookingTimeCalculator)
            ->calculateEndTime('10:00', -1);
    }

    public function test_it_rejects_invalid_start_time(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new BookingTimeCalculator)
            ->calculateEndTime('25:00', 60);
    }

    public function test_it_rejects_booking_that_crosses_midnight(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new BookingTimeCalculator)
            ->calculateEndTime('23:30', 60);
    }
}
