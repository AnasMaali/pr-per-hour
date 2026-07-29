<?php

declare(strict_types=1);

namespace App\Features\Bookings\DTOs;

final readonly class UpdateBookingMeetingLinkData
{
    public function __construct(
        public ?string $meetingLink,
    ) {}

    /**
     * @param  array{meeting_link: string|null}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            meetingLink: $validated['meeting_link'] !== null
                ? (string) $validated['meeting_link']
                : null,
        );
    }
}
