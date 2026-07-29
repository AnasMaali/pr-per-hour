<?php

declare(strict_types=1);

namespace App\Features\Bookings\Policies;

use App\Enums\UserStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Users\Models\User;

final class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Booking $booking): bool
    {
        return $this->isActiveOwner($user, $booking);
    }

    public function create(User $user): bool
    {
        return $user->status === UserStatus::Active;
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return $this->isActiveOwner($user, $booking);
    }

    public function updateStatus(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function updateMeetingLink(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function updateNotes(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    private function isActiveOwner(User $user, Booking $booking): bool
    {
        return $user->status === UserStatus::Active
            && (int) $user->id === (int) $booking->user_id;
    }
}
