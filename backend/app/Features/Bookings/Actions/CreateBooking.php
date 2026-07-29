<?php

declare(strict_types=1);

namespace App\Features\Bookings\Actions;

use App\Enums\BookingStatus;
use App\Features\Bookings\DTOs\CreateBookingData;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use App\Features\Services\Models\Service;
use Illuminate\Support\Facades\DB;

final class CreateBooking
{
    public function execute(CreateBookingData $data): Booking
    {
        return DB::transaction(function () use ($data): Booking {
            $service = Service::query()
                ->publiclyVisible()
                ->whereKey($data->serviceId)
                ->lockForUpdate()
                ->first();

            if ($service === null) {
                throw new BookingDomainException(
                    'SERVICE_UNAVAILABLE',
                    __('bookings.service_unavailable'),
                );
            }

            $conflictExists = Booking::query()
                ->overlapping(
                    serviceId: $data->serviceId,
                    bookingDate: $data->bookingDate,
                    startTime: $data->startTime,
                    endTime: $data->endTime,
                )
                ->lockForUpdate()
                ->exists();

            if ($conflictExists) {
                throw new BookingDomainException(
                    'BOOKING_TIME_CONFLICT',
                    __('bookings.time_conflict'),
                );
            }

            $booking = new Booking;
            $booking->user_id = $data->userId;
            $booking->service_id = $data->serviceId;
            $booking->booking_date = $data->bookingDate;
            $booking->start_time = $data->startTime;
            $booking->end_time = $data->endTime;
            $booking->notes = $data->notes;
            $booking->status = BookingStatus::Pending;
            $booking->meeting_link = null;
            $booking->save();

            return $booking->load(['service.category']);
        });
    }
}
