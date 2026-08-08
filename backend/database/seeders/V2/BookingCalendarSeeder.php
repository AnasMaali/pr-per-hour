<?php

declare(strict_types=1);

namespace Database\Seeders\V2;

use App\Features\Bookings\V2\Models\BookingCalendar;
use Illuminate\Database\Seeder;

final class BookingCalendarSeeder extends Seeder
{
    public function run(): void
    {
        $slug = (string) config(
            'v2.bookings.default_calendar_slug',
            'pr-per-hour-shared'
        );

        $timezone = (string) config(
            'v2.bookings.default_calendar_timezone',
            'Asia/Hebron'
        );

        BookingCalendar::query()->updateOrCreate(
            [
                'slug' => $slug,
            ],
            [
                'name' => 'PR Per Hour Shared Calendar',
                'timezone' => $timezone,
                'is_active' => true,
            ]
        );
    }
}
