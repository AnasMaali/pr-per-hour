<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'category_id' => ServiceCategory::factory(),
            'title' => rtrim($title, '.'),
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'description' => fake()->optional()->paragraph(),
            'duration_minutes' => fake()->optional()->numberBetween(30, 180),
            'price' => fake()->randomFloat(2, 0, 500),
            'currency' => 'USD',
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
