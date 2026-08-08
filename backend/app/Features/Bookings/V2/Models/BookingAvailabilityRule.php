<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BookingAvailabilityRule extends Model
{
    protected $fillable = [
        'calendar_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(BookingCalendar::class, 'calendar_id');
    }
}
