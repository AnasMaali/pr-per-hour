<?php

declare(strict_types=1);

namespace App\Features\Services\Resources;

use App\Features\Services\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Service
 */
final class ServiceResource extends JsonResource
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
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'price' => number_format((float) $this->price, 2, '.', ''),
            'currency' => strtoupper((string) $this->currency),
            'is_active' => (bool) $this->is_active,
            'category' => $this->whenLoaded(
                'category',
                fn () => (new ServiceCategorySummaryResource($this->category))->resolve(),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
