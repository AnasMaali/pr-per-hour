<?php

declare(strict_types=1);

namespace Database\Seeders\V2;

use App\Features\Bookings\V2\Models\BookingAvailabilityRule;
use App\Features\Bookings\V2\Models\BookingCalendar;
use Illuminate\Database\Seeder;

final class BookingAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $calendar = BookingCalendar::query()
            ->where(
                'slug',
                config(
                    'v2.bookings.default_calendar_slug',
                    'pr-per-hour-shared'
                )
            )
            ->firstOrFail();

        // Never overwrite availability that may have been changed
        // later by an administrator.
        if ($calendar->availabilityRules()->exists()) {
            return;
        }

        // 0 = Sunday ... 4 = Thursday
        foreach ([0, 1, 2, 3, 4] as $dayOfWeek) {
            BookingAvailabilityRule::query()->create([
                'calendar_id' => $calendar->id,
                'day_of_week' => $dayOfWeek,
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ]);
        }

        // Friday (5) and Saturday (6) intentionally have no
        // recurring availability rules, so they are closed by default.
    }
}
