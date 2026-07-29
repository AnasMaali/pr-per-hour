<?php

declare(strict_types=1);

namespace App\Features\Bookings\Models;

use App\Enums\BookingStatus;
use App\Features\Invoices\Models\Invoice;
use App\Features\Payments\Models\Payment;
use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'service_id',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'notes',
        'meeting_link',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'status' => BookingStatus::class,
        ];
    }

    protected static function newFactory(): BookingFactory
    {
        return BookingFactory::new();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Overlap: new_start < existing_end AND new_end > existing_start.
     * Considers pending/confirmed only; soft-deleted rows are excluded by default.
     *
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeOverlapping(
        Builder $query,
        int $serviceId,
        string $bookingDate,
        string $startTime,
        string $endTime,
    ): Builder {
        return $query
            ->where('service_id', $serviceId)
            ->whereDate('booking_date', $bookingDate)
            ->whereIn('status', [
                BookingStatus::Pending->value,
                BookingStatus::Confirmed->value,
            ])
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if ($status === null || trim($status) === '') {
            return $query;
        }

        return $query->where('status', trim($status));
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeFilterUser(Builder $query, ?int $userId): Builder
    {
        if ($userId === null) {
            return $query;
        }

        return $query->where('user_id', $userId);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeFilterService(Builder $query, ?int $serviceId): Builder
    {
        if ($serviceId === null) {
            return $query;
        }

        return $query->where('service_id', $serviceId);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeFilterBookingDate(Builder $query, ?string $bookingDate): Builder
    {
        if ($bookingDate === null || trim($bookingDate) === '') {
            return $query;
        }

        return $query->whereDate('booking_date', $bookingDate);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeFilterDateBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from !== null && $from !== '') {
            $query->whereDate('booking_date', '>=', $from);
        }

        if ($to !== null && $to !== '') {
            $query->whereDate('booking_date', '<=', $to);
        }

        return $query;
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($term));
        $like = '%'.$escaped.'%';

        return $query->where(function (Builder $builder) use ($like): void {
            $builder
                ->whereHas('user', static function (Builder $userQuery) use ($like): void {
                    $userQuery
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                })
                ->orWhereHas('service', static function (Builder $serviceQuery) use ($like): void {
                    $serviceQuery
                        ->where('title', 'like', $like)
                        ->orWhere('slug', 'like', $like);
                });
        });
    }
}
