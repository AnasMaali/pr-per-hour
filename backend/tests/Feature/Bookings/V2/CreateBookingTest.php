<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Enums\BookingStatus;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\Actions\CreateBooking;
use App\Features\Bookings\V2\DTOs\CreateBookingData;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CreateBookingTest extends TestCase
{
    use RefreshDatabase;

    private function service(int $duration = 60): Service
    {
        $category = ServiceCategory::factory()->create([
            'is_active' => true,
        ]);

        return Service::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
            'duration_minutes' => $duration,
        ]);
    }

    public function test_v2_calculates_end_time_from_service_duration(): void
    {
        $user = User::factory()->create();
        $service = $this->service(90);

        $data = new CreateBookingData(
            userId: $user->id,
            serviceId: $service->id,
            bookingDate: now()->addDays(3)->toDateString(),
            startTime: '10:00:00',
            notes: 'Strategy meeting',
        );

        $booking = app(CreateBooking::class)->execute($data);

        $this->assertSame('10:00:00', (string) $booking->start_time);
        $this->assertSame('11:30:00', (string) $booking->end_time);
        $this->assertSame(BookingStatus::Pending, $booking->status);
        $this->assertNull($booking->meeting_link);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'user_id' => $user->id,
            'service_id' => $service->id,
            'start_time' => '10:00:00',
            'end_time' => '11:30:00',
            'status' => 'pending',
        ]);
    }

    public function test_v2_rejects_overlapping_booking(): void
    {
        $user = User::factory()->create();
        $service = $this->service(60);
        $date = now()->addDays(4)->toDateString();

        Booking::factory()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        $data = new CreateBookingData(
            userId: $user->id,
            serviceId: $service->id,
            bookingDate: $date,
            startTime: '10:30:00',
            notes: null,
        );

        try {
            app(CreateBooking::class)->execute($data);
            $this->fail('Expected booking conflict.');
        } catch (BookingDomainException $exception) {
            $this->assertSame(
                'BOOKING_TIME_CONFLICT',
                $exception->errorCode,
            );
        }
    }

    public function test_adjacent_slot_is_allowed(): void
    {
        $user = User::factory()->create();
        $service = $this->service(60);
        $date = now()->addDays(4)->toDateString();

        Booking::factory()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        $data = new CreateBookingData(
            userId: $user->id,
            serviceId: $service->id,
            bookingDate: $date,
            startTime: '11:00:00',
            notes: null,
        );

        $booking = app(CreateBooking::class)->execute($data);

        $this->assertSame('11:00:00', (string) $booking->start_time);
        $this->assertSame('12:00:00', (string) $booking->end_time);
    }

    public function test_service_without_valid_duration_is_rejected(): void
    {
        $user = User::factory()->create();
        $service = $this->service(0);

        $data = new CreateBookingData(
            userId: $user->id,
            serviceId: $service->id,
            bookingDate: now()->addDays(3)->toDateString(),
            startTime: '10:00:00',
            notes: null,
        );

        try {
            app(CreateBooking::class)->execute($data);
            $this->fail('Expected invalid duration.');
        } catch (BookingDomainException $exception) {
            $this->assertSame(
                'BOOKING_DURATION_INVALID',
                $exception->errorCode,
            );
        }
    }
}
