<?php

declare(strict_types=1);

namespace App\Features\Bookings\DTOs;

use App\Enums\BookingStatus;

final readonly class UpdateBookingStatusData
{
    public function __construct(
        public BookingStatus $status,
    ) {}

    /**
     * @param  array{status: string}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            status: BookingStatus::from((string) $validated['status']),
        );
    }
}
