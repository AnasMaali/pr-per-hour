<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Features\Bookings\V2\Models\BookingAvailabilityRule;
use App\Features\Bookings\V2\Models\BookingCalendar;
use Database\Seeders\V2\BookingAvailabilitySeeder;
use Database\Seeders\V2\BookingCalendarSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class BookingAvailabilitySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_default_sunday_through_thursday_hours(): void
    {
        $this->seed(BookingCalendarSeeder::class);
        $this->seed(BookingAvailabilitySeeder::class);

        $calendar = BookingCalendar::query()
            ->where(
                'slug',
                config('v2.bookings.default_calendar_slug')
            )
            ->firstOrFail();

        $rules = BookingAvailabilityRule::query()
            ->where('calendar_id', $calendar->id)
            ->orderBy('day_of_week')
            ->get();

        $this->assertCount(5, $rules);

        $this->assertSame(
            [0, 1, 2, 3, 4],
            $rules->pluck('day_of_week')->all()
        );

        foreach ($rules as $rule) {
            $this->assertSame('09:00:00', (string) $rule->start_time);
            $this->assertSame('17:00:00', (string) $rule->end_time);
            $this->assertTrue($rule->is_active);
        }
    }

    public function test_seeder_is_idempotent(): void
    {
        $this->seed(BookingCalendarSeeder::class);

        $this->seed(BookingAvailabilitySeeder::class);
        $this->seed(BookingAvailabilitySeeder::class);

        $this->assertSame(
            5,
            BookingAvailabilityRule::query()->count()
        );
    }

    public function test_seeder_does_not_overwrite_admin_changes(): void
    {
        $this->seed(BookingCalendarSeeder::class);
        $this->seed(BookingAvailabilitySeeder::class);

        $rule = BookingAvailabilityRule::query()
            ->where('day_of_week', 0)
            ->firstOrFail();

        $rule->update([
            'start_time' => '11:00:00',
            'end_time' => '19:00:00',
        ]);

        $this->seed(BookingAvailabilitySeeder::class);

        $rule->refresh();

        $this->assertSame('11:00:00', (string) $rule->start_time);
        $this->assertSame('19:00:00', (string) $rule->end_time);

        $this->assertSame(
            5,
            BookingAvailabilityRule::query()->count()
        );
    }
}
