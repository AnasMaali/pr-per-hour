<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Models;

use App\Enums\BookingAvailabilityExceptionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BookingAvailabilityException extends Model
{
    protected $fillable = [
        'calendar_id',
        'date',
        'start_time',
        'end_time',
        'type',
        'reason',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => BookingAvailabilityExceptionType::class,
            'is_active' => 'boolean',
        ];
    }

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(BookingCalendar::class, 'calendar_id');
    }
}
