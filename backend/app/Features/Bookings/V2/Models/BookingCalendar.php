<?php

declare(strict_types=1);

namespace App\Features\Bookings\V2\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class BookingCalendar extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'timezone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function availabilityRules(): HasMany
    {
        return $this->hasMany(BookingAvailabilityRule::class, 'calendar_id');
    }

    public function availabilityExceptions(): HasMany
    {
        return $this->hasMany(BookingAvailabilityException::class, 'calendar_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BookingCalendarAssignment::class, 'calendar_id');
    }
}
