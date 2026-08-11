<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Actions;

use App\Enums\BookingStatus;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\V2\DTOs\CreateBookingData;
use App\Features\Bookings\V2\Models\BookingCalendarAssignment;
use App\Features\Bookings\V2\Support\BookingConflictDetector;
use App\Features\Bookings\V2\Support\BookingTimeCalculator;
use App\Features\Bookings\V2\Support\DefaultBookingCalendarResolver;
use App\Features\Services\Models\Service;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class CreateBooking
{
    public function __construct(
        private readonly BookingTimeCalculator $timeCalculator,
        private readonly BookingConflictDetector $conflictDetector,
        private readonly DefaultBookingCalendarResolver $calendarResolver,
    ) {}

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

            try {
                $endTime = $this->timeCalculator->calculateEndTime(
                    $data->startTime,
                    $service->duration_minutes,
                );
            } catch (InvalidArgumentException) {
                throw new BookingDomainException(
                    'BOOKING_DURATION_INVALID',
                    __('bookings.service_unavailable'),
                );
            }

            $conflictExists = $this->conflictDetector->exists(
                bookingDate: $data->bookingDate,
                startTime: $data->startTime,
                endTime: $endTime,
                serviceId: $data->serviceId,
            );

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
            $booking->end_time = $endTime;
            $booking->notes = $data->notes;
            $booking->status = BookingStatus::Pending;
            $booking->meeting_link = null;
            $booking->save();

            $calendar = $this->calendarResolver->resolve();

            BookingCalendarAssignment::query()->create([
                'booking_id' => $booking->id,
                'calendar_id' => $calendar->id,
            ]);

            return $booking->load(['service.category']);
        });
    }
}
