<?php

declare(strict_types=1);

namespace App\Features\Bookings\Resources;

use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Booking
 */
final class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_date' => $this->booking_date?->format('Y-m-d'),
            'start_time' => $this->formatTime($this->start_time),
            'end_time' => $this->formatTime($this->end_time),
            'status' => $this->status instanceof BookingStatus
                ? $this->status->value
                : (string) $this->status,
            'notes' => $this->notes,
            'meeting_link' => $this->meeting_link,
            'service' => $this->whenLoaded(
                'service',
                fn () => (new BookingServiceSummaryResource($this->service))->resolve(),
            ),
            'client' => $this->whenLoaded(
                'user',
                fn () => (new BookingUserSummaryResource($this->user))->resolve(),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function formatTime(mixed $time): ?string
    {
        if ($time === null) {
            return null;
        }

        $value = (string) $time;

        return strlen($value) >= 5 ? substr($value, 0, 5) : $value;
    }
}
