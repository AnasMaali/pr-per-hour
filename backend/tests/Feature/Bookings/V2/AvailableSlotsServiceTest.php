<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Enums\BookingAvailabilityExceptionType;
use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\Models\BookingAvailabilityException;
use App\Features\Bookings\V2\Models\BookingCalendar;
use App\Features\Bookings\V2\Models\BookingCalendarAssignment;
use App\Features\Bookings\V2\Support\AvailableSlotsService;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Database\Seeders\V2\BookingAvailabilitySeeder;
use Database\Seeders\V2\BookingCalendarSeeder;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AvailableSlotsServiceTest extends TestCase
{
    use RefreshDatabase;

    private BookingCalendar $calendar;

    protected function setUp(): void
    {
        parent::setUp();

        CarbonImmutable::setTestNow(
            CarbonImmutable::parse(
                '2026-08-01 08:00:00',
                'Asia/Hebron'
            )
        );

        $this->seed(BookingCalendarSeeder::class);
        $this->seed(BookingAvailabilitySeeder::class);

        $this->calendar = BookingCalendar::query()
            ->where(
                'slug',
                config('v2.bookings.default_calendar_slug')
            )
            ->firstOrFail();
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

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

    public function test_it_reads_weekly_hours_from_database(): void
    {
        $service = $this->service(60);

        $slots = app(AvailableSlotsService::class)
            ->forServiceAndDate(
                $service,
                $this->calendar,
                '2026-08-09'
            );

        $this->assertSame(
            ['start_time' => '09:00', 'end_time' => '10:00'],
            $slots[0]
        );

        $this->assertSame(
            ['start_time' => '16:00', 'end_time' => '17:00'],
            $slots[array_key_last($slots)]
        );
    }

    public function test_legacy_unassigned_booking_blocks_shared_calendar(): void
    {
        $service = $this->service(60);
        $date = '2026-08-09';

        Booking::factory()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        $slots = app(AvailableSlotsService::class)
            ->forServiceAndDate(
                $service,
                $this->calendar,
                $date
            );

        $starts = array_column($slots, 'start_time');

        $this->assertNotContains('09:30', $starts);
        $this->assertNotContains('10:00', $starts);
        $this->assertNotContains('10:30', $starts);
        $this->assertContains('11:00', $starts);
    }

    public function test_full_day_blocked_exception_closes_calendar(): void
    {
        $service = $this->service(60);

        BookingAvailabilityException::query()->create([
            'calendar_id' => $this->calendar->id,
            'date' => '2026-08-09',
            'type' => BookingAvailabilityExceptionType::Blocked,
            'reason' => 'Office closed',
            'is_active' => true,
        ]);

        $slots = app(AvailableSlotsService::class)
            ->forServiceAndDate(
                $service,
                $this->calendar,
                '2026-08-09'
            );

        $this->assertSame([], $slots);
    }

    public function test_available_exception_can_open_normally_closed_day(): void
    {
        $service = $this->service(60);

        BookingAvailabilityException::query()->create([
            'calendar_id' => $this->calendar->id,
            'date' => '2026-08-08',
            'start_time' => '10:00:00',
            'end_time' => '13:00:00',
            'type' => BookingAvailabilityExceptionType::Available,
            'reason' => 'Special Saturday availability',
            'is_active' => true,
        ]);

        $slots = app(AvailableSlotsService::class)
            ->forServiceAndDate(
                $service,
                $this->calendar,
                '2026-08-08'
            );

        $this->assertNotEmpty($slots);
    }

    public function test_booking_assigned_to_different_calendar_does_not_block_default_calendar(): void
    {
        $service = $this->service(60);
        $date = '2026-08-09';

        $otherCalendar = BookingCalendar::query()->create([
            'slug' => 'future-consultant-calendar',
            'name' => 'Future Consultant',
            'timezone' => 'Asia/Hebron',
            'is_active' => true,
        ]);

        $booking = Booking::factory()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Confirmed,
        ]);

        BookingCalendarAssignment::query()->create([
            'booking_id' => $booking->id,
            'calendar_id' => $otherCalendar->id,
        ]);

        $slots = app(AvailableSlotsService::class)
            ->forServiceAndDate(
                $service,
                $this->calendar,
                $date
            );

        $this->assertContains(
            '10:00',
            array_column($slots, 'start_time')
        );
    }
}
