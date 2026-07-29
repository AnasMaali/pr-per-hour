<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->optional()->numerify('##########'),
            'organization' => fake()->optional()->company(),
            'message' => fake()->paragraph(),
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (ContactMessage $message): void {
            if ($message->status === null) {
                $message->status = ContactMessageStatus::New;
            }
        });
    }

    public function status(ContactMessageStatus $status): static
    {
        return $this->afterMaking(function (ContactMessage $message) use ($status): void {
            $message->status = $status;
        });
    }
}
