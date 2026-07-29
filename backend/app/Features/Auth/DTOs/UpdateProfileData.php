<?php

declare(strict_types=1);

namespace App\Features\Auth\DTOs;

final readonly class UpdateProfileData
{
    /**
     * @param  array{name?: string, phone?: string|null}  $validated
     */
    public function __construct(
        public array $validated,
    ) {}

    /**
     * @param  array{name?: string, phone?: string|null}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self($validated);
    }

    /**
     * @return array{name?: string, phone?: string|null}
     */
    public function attributes(): array
    {
        return $this->validated;
    }
}
