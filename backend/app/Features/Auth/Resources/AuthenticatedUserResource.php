<?php

declare(strict_types=1);

namespace App\Features\Auth\Resources;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Users\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
final class AuthenticatedUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role instanceof UserRole ? $this->role->value : (string) $this->role,
            'status' => $this->status instanceof UserStatus ? $this->status->value : (string) $this->status,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
