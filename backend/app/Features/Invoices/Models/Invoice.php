<?php

declare(strict_types=1);

namespace App\Features\Invoices\Models;

use App\Enums\InvoiceStatus;
use App\Features\Bookings\Models\Booking;
use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'invoice_number',
        'total',
        'currency',
        'status',
        'issued_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'status' => InvoiceStatus::class,
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    protected static function newFactory(): InvoiceFactory
    {
        return InvoiceFactory::new();
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
