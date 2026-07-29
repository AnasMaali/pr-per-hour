<?php

declare(strict_types=1);

namespace App\Features\Bookings\Actions;

use App\Features\Bookings\DTOs\UpdateBookingNotesData;
use App\Features\Bookings\Models\Booking;

final class UpdateBookingNotes
{
    public function execute(Booking $booking, UpdateBookingNotesData $data): Booking
    {
        $booking->notes = $data->notes;
        $booking->save();

        return $booking->refresh()->load(['user', 'service.category']);
    }
}
