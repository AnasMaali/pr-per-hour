<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Resources;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ContactMessage
 */
final class ContactMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'organization' => $this->organization,
            'message' => $this->message,
            'status' => $this->status instanceof ContactMessageStatus
                ? $this->status->value
                : (string) $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
