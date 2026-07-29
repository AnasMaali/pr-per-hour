<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Resources;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Safe public receipt after contact form submission.
 *
 * @mixin ContactMessage
 */
final class ContactMessageReceiptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status instanceof ContactMessageStatus
                ? $this->status->value
                : (string) $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
