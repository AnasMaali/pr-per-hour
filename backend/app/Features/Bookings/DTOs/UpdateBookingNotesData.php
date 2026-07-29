<?php

declare(strict_types=1);

namespace App\Features\Bookings\DTOs;

final readonly class UpdateBookingNotesData
{
    public function __construct(
        public ?string $notes,
    ) {}

    /**
     * @param  array{notes: string|null}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            notes: $validated['notes'] !== null ? (string) $validated['notes'] : null,
        );
    }
}
