<?php

declare(strict_types=1);

namespace App\Features\Users\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Chatbot\Models\ChatConversation;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Mass-assignable attributes for safe profile/account updates.
     * role and status are assigned explicitly in trusted Actions/seeders only.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
        ];
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function chatConversations(): HasMany
    {
        return $this->hasMany(ChatConversation::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin
            && $this->status === UserStatus::Active;
    }
}
