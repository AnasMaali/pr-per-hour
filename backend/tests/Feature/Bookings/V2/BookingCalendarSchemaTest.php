<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Enums\BookingAvailabilityExceptionType;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\Models\BookingAvailabilityException;
use App\Features\Bookings\V2\Models\BookingAvailabilityRule;
use App\Features\Bookings\V2\Models\BookingCalendar;
use App\Features\Bookings\V2\Models\BookingCalendarAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class BookingCalendarSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_v2_booking_calendar_tables_exist(): void
    {
        $this->assertTrue(Schema::hasTable('booking_calendars'));
        $this->assertTrue(Schema::hasTable('booking_availability_rules'));
        $this->assertTrue(Schema::hasTable('booking_availability_exceptions'));
        $this->assertTrue(Schema::hasTable('booking_calendar_assignments'));
    }

    public function test_calendar_schema_contains_expected_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('booking_calendars', [
            'id',
            'slug',
            'name',
            'timezone',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at',
        ]));

        $this->assertTrue(Schema::hasColumns('booking_availability_rules', [
            'id',
            'calendar_id',
            'day_of_week',
            'start_time',
            'end_time',
            'is_active',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('booking_availability_exceptions', [
            'id',
            'calendar_id',
            'date',
            'start_time',
            'end_time',
            'type',
            'reason',
            'is_active',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('booking_calendar_assignments', [
            'id',
            'booking_id',
            'calendar_id',
            'created_at',
            'updated_at',
        ]));
    }

    public function test_calendar_models_and_relationships_work(): void
    {
        $calendar = BookingCalendar::query()->create([
            'slug' => 'test-calendar',
            'name' => 'Test Calendar',
            'timezone' => 'Asia/Hebron',
            'is_active' => true,
        ]);

        $rule = BookingAvailabilityRule::query()->create([
            'calendar_id' => $calendar->id,
            'day_of_week' => 0,
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
        ]);

        $exception = BookingAvailabilityException::query()->create([
            'calendar_id' => $calendar->id,
            'date' => now()->addDay()->toDateString(),
            'type' => BookingAvailabilityExceptionType::Blocked,
            'reason' => 'Test closure',
            'is_active' => true,
        ]);

        $booking = Booking::factory()->create();

        $assignment = BookingCalendarAssignment::query()->create([
            'booking_id' => $booking->id,
            'calendar_id' => $calendar->id,
        ]);

        $this->assertTrue($rule->calendar->is($calendar));
        $this->assertTrue($exception->calendar->is($calendar));
        $this->assertTrue($assignment->calendar->is($calendar));
        $this->assertTrue($assignment->booking->is($booking));

        $this->assertSame(
            BookingAvailabilityExceptionType::Blocked,
            $exception->type
        );
    }

    public function test_v1_bookings_table_is_not_modified_by_calendar_foundation(): void
    {
        $this->assertFalse(
            Schema::hasColumn('bookings', 'calendar_id')
        );
    }
}
