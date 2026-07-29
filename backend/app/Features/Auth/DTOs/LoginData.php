<?php

declare(strict_types=1);

namespace App\Features\Auth\DTOs;

final readonly class LoginData
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}

    /**
     * @param  array{email: string, password: string}  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            email: $validated['email'],
            password: $validated['password'],
        );
    }
}
