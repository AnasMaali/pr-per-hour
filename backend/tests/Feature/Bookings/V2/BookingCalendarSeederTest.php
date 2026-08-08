<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings\V2;

use App\Features\Bookings\V2\Models\BookingCalendar;
use Database\Seeders\V2\BookingCalendarSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class BookingCalendarSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_shared_calendar_seeder_is_idempotent(): void
    {
        $this->seed(BookingCalendarSeeder::class);
        $this->seed(BookingCalendarSeeder::class);

        $this->assertSame(
            1,
            BookingCalendar::query()
                ->where(
                    'slug',
                    config('v2.bookings.default_calendar_slug')
                )
                ->count()
        );
    }

    public function test_shared_calendar_uses_configured_identity_and_timezone(): void
    {
        config([
            'v2.bookings.default_calendar_slug' => 'custom-shared-calendar',
            'v2.bookings.default_calendar_timezone' => 'Asia/Hebron',
        ]);

        $this->seed(BookingCalendarSeeder::class);

        $calendar = BookingCalendar::query()
            ->where('slug', 'custom-shared-calendar')
            ->firstOrFail();

        $this->assertSame(
            'PR Per Hour Shared Calendar',
            $calendar->name
        );

        $this->assertSame(
            'Asia/Hebron',
            $calendar->timezone
        );

        $this->assertTrue($calendar->is_active);
    }
}
