<?php

declare(strict_types=1);

namespace App\Features\Bookings\DTOs;

final readonly class CreateBookingData
{
    public function __construct(
        public int $userId,
        public int $serviceId,
        public string $bookingDate,
        public string $startTime,
        public string $endTime,
        public ?string $notes,
    ) {}

    /**
     * @param  array{
     *     service_id: int,
     *     booking_date: string,
     *     start_time: string,
     *     end_time: string,
     *     notes?: string|null
     * }  $validated
     */
    public static function fromValidated(array $validated, int $userId): self
    {
        return new self(
            userId: $userId,
            serviceId: (int) $validated['service_id'],
            bookingDate: (string) $validated['booking_date'],
            startTime: self::normalizeTime((string) $validated['start_time']),
            endTime: self::normalizeTime((string) $validated['end_time']),
            notes: array_key_exists('notes', $validated) && $validated['notes'] !== null
                ? (string) $validated['notes']
                : null,
        );
    }

    private static function normalizeTime(string $time): string
    {
        return strlen($time) === 5 ? $time.':00' : $time;
    }
}
