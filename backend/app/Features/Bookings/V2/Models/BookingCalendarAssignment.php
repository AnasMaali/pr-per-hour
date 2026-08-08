<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Models;

use App\Features\Bookings\Models\Booking;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BookingCalendarAssignment extends Model
{
    protected $fillable = [
        'booking_id',
        'calendar_id',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(BookingCalendar::class, 'calendar_id');
    }
}
