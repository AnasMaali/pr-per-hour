<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\DTOs;

final readonly class UpdateServiceCategoryData
{
    /**
     * @param  array{name?: string, slug?: string, description?: string|null}  $validated
     */
    public function __construct(
        public array $validated,
    ) {}

    /**
     * @param  array{name?: string, slug?: string, description?: string|null}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self($validated);
    }

    /**
     * @return array{name?: string, slug?: string, description?: string|null}
     */
    public function attributes(): array
    {
        return $this->validated;
    }
}
