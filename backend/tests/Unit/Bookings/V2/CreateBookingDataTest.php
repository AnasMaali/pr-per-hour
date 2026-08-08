<?php

declare(strict_types=1);

namespace Tests\Unit\Bookings\V2;

use App\Features\Bookings\V2\DTOs\CreateBookingData;
use PHPUnit\Framework\TestCase;

final class CreateBookingDataTest extends TestCase
{
    public function test_it_builds_v2_booking_data_without_end_time(): void
    {
        $data = CreateBookingData::fromValidated([
            'service_id' => 7,
            'booking_date' => '2026-08-20',
            'start_time' => '10:30',
            'notes' => '  Strategy consultation  ',
        ], 12);

        $this->assertSame(12, $data->userId);
        $this->assertSame(7, $data->serviceId);
        $this->assertSame('2026-08-20', $data->bookingDate);
        $this->assertSame('10:30:00', $data->startTime);
        $this->assertSame('Strategy consultation', $data->notes);
    }

    public function test_notes_can_be_null(): void
    {
        $data = CreateBookingData::fromValidated([
            'service_id' => 3,
            'booking_date' => '2026-08-20',
            'start_time' => '09:00',
            'notes' => null,
        ], 5);

        $this->assertNull($data->notes);
    }
}
