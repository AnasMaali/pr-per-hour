<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\DTOs;

final readonly class CreateServiceCategoryData
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description,
        public bool $isActive,
    ) {}

    /**
     * @param  array{name: string, slug: string, description?: string|null, is_active?: bool}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            name: $validated['name'],
            slug: $validated['slug'],
            description: $validated['description'] ?? null,
            isActive: array_key_exists('is_active', $validated)
                ? (bool) $validated['is_active']
                : true,
        );
    }
}
