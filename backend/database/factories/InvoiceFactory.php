<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Invoices\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('########'),
            'total' => fake()->randomFloat(2, 10, 1000),
            'currency' => 'USD',
            'status' => InvoiceStatus::Unpaid,
            'issued_at' => null,
            'paid_at' => null,
        ];
    }
}
