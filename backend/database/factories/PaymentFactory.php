<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Payments\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'amount' => fake()->randomFloat(2, 10, 1000),
            'currency' => 'USD',
            'payment_method' => fake()->optional()->randomElement(PaymentMethod::cases()),
            'transaction_id' => fake()->optional()->uuid(),
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
        ];
    }
}
