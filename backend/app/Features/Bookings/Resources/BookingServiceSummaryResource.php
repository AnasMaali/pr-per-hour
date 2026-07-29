<?php

declare(strict_types=1);

namespace App\Features\Bookings\Resources;

use App\Features\Services\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Service
 */
final class BookingServiceSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'duration_minutes' => $this->duration_minutes,
            'price' => number_format((float) $this->price, 2, '.', ''),
            'currency' => strtoupper((string) $this->currency),
            'category' => $this->whenLoaded(
                'category',
                fn () => (new BookingCategorySummaryResource($this->category))->resolve(),
            ),
        ];
    }
}
