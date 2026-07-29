<?php

declare(strict_types=1);

namespace App\Features\Services\DTOs;

final readonly class UpdateServiceData
{
    /**
     * @param  array{
     *     category_id?: int,
     *     title?: string,
     *     slug?: string,
     *     description?: string|null,
     *     duration_minutes?: int|null,
     *     price?: numeric-string|float|int,
     *     currency?: string
     * }  $validated
     */
    public function __construct(
        public array $validated,
    ) {}

    /**
     * @param  array{
     *     category_id?: int,
     *     title?: string,
     *     slug?: string,
     *     description?: string|null,
     *     duration_minutes?: int|null,
     *     price?: numeric-string|float|int,
     *     currency?: string
     * }  $validated
     */
    public static function fromValidated(array $validated): self
    {
        if (array_key_exists('price', $validated)) {
            $validated['price'] = number_format((float) $validated['price'], 2, '.', '');
        }

        if (array_key_exists('currency', $validated)) {
            $validated['currency'] = strtoupper((string) $validated['currency']);
        }

        return new self($validated);
    }

    /**
     * @return array{
     *     category_id?: int,
     *     title?: string,
     *     slug?: string,
     *     description?: string|null,
     *     duration_minutes?: int|null,
     *     price?: string,
     *     currency?: string
     * }
     */
    public function attributes(): array
    {
        return $this->validated;
    }
}
