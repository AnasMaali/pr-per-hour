<?php

declare(strict_types=1);

namespace App\Features\Bookings\Actions;

use App\Enums\BookingStatus;
use App\Features\Bookings\DTOs\UpdateBookingStatusData;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;

final class UpdateBookingStatus
{
    /**
     * @var array<string, list<BookingStatus>>
     */
    private const TRANSITIONS = [
        'pending' => [BookingStatus::Confirmed, BookingStatus::Cancelled],
        'confirmed' => [BookingStatus::Completed, BookingStatus::Cancelled],
        'completed' => [],
        'cancelled' => [],
    ];

    public function execute(Booking $booking, UpdateBookingStatusData $data): Booking
    {
        $current = $booking->status;
        $allowed = self::TRANSITIONS[$current->value] ?? [];

        if (! in_array($data->status, $allowed, true)) {
            throw new BookingDomainException(
                'BOOKING_INVALID_STATUS_TRANSITION',
                __('bookings.invalid_status_transition'),
            );
        }

        $booking->status = $data->status;
        $booking->save();

        return $booking->refresh()->load(['user', 'service.category']);
    }
}
