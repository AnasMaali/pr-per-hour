<?php

declare(strict_types=1);

namespace App\Features\Auth\DTOs;

final readonly class RegisterClientData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $phone,
        public string $password,
    ) {}

    /**
     * @param  array{name: string, email: string, phone?: string|null, password: string}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'] ?? null,
            password: $validated['password'],
        );
    }
}
