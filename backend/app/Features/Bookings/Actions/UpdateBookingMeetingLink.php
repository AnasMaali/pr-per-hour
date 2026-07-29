<?php

declare(strict_types=1);

namespace App\Features\Bookings\Actions;

use App\Features\Bookings\DTOs\UpdateBookingMeetingLinkData;
use App\Features\Bookings\Models\Booking;

final class UpdateBookingMeetingLink
{
    public function execute(Booking $booking, UpdateBookingMeetingLinkData $data): Booking
    {
        $booking->meeting_link = $data->meetingLink;
        $booking->save();

        return $booking->refresh()->load(['user', 'service.category']);
    }
}
