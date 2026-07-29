<?php

declare(strict_types=1);

namespace App\Features\Services\DTOs;

final readonly class CreateServiceData
{
    public function __construct(
        public int $categoryId,
        public string $title,
        public string $slug,
        public ?string $description,
        public ?int $durationMinutes,
        public string $price,
        public string $currency,
        public bool $isActive,
    ) {}

    /**
     * @param  array{
     *     category_id: int,
     *     title: string,
     *     slug: string,
     *     description?: string|null,
     *     duration_minutes?: int|null,
     *     price?: numeric-string|float|int,
     *     currency?: string,
     *     is_active?: bool
     * }  $validated
     */
    public static function fromValidated(array $validated): self
    {
        $price = array_key_exists('price', $validated)
            ? number_format((float) $validated['price'], 2, '.', '')
            : '0.00';

        $currency = array_key_exists('currency', $validated)
            ? strtoupper((string) $validated['currency'])
            : 'USD';

        return new self(
            categoryId: (int) $validated['category_id'],
            title: $validated['title'],
            slug: $validated['slug'],
            description: $validated['description'] ?? null,
            durationMinutes: array_key_exists('duration_minutes', $validated)
                ? ($validated['duration_minutes'] !== null ? (int) $validated['duration_minutes'] : null)
                : null,
            price: $price,
            currency: $currency,
            isActive: array_key_exists('is_active', $validated)
                ? (bool) $validated['is_active']
                : true,
        );
    }
}
