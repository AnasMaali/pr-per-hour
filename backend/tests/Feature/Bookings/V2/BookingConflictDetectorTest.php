<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\Support\BookingConflictDetector;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class BookingConflictDetectorTest extends TestCase
{
    use RefreshDatabase;

    public function test_shared_calendar_blocks_different_services_at_same_time(): void
    {
        config([
            'v2.bookings.calendar_mode' => 'shared',
        ]);

        $category = ServiceCategory::factory()->create([
            'is_active' => true,
        ]);

        $serviceA = Service::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $serviceB = Service::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $date = now()->addDays(5)->toDateString();

        Booking::factory()->create([
            'service_id' => $serviceA->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        $this->assertTrue(
            app(BookingConflictDetector::class)->exists(
                bookingDate: $date,
                startTime: '10:30:00',
                endTime: '11:30:00',
                serviceId: $serviceB->id,
            )
        );
    }

    public function test_shared_calendar_allows_adjacent_time(): void
    {
        config([
            'v2.bookings.calendar_mode' => 'shared',
        ]);

        $category = ServiceCategory::factory()->create([
            'is_active' => true,
        ]);

        $service = Service::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $date = now()->addDays(5)->toDateString();

        Booking::factory()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        $this->assertFalse(
            app(BookingConflictDetector::class)->exists(
                bookingDate: $date,
                startTime: '11:00:00',
                endTime: '12:00:00',
                serviceId: $service->id,
            )
        );
    }
}
