<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\DTOs;

final readonly class CreateContactMessageData
{
    public function __construct(
        public string $fullName,
        public string $email,
        public ?string $phone,
        public ?string $organization,
        public string $message,
    ) {}

    /**
     * @param  array{
     *     full_name: string,
     *     email: string,
     *     phone?: string|null,
     *     organization?: string|null,
     *     message: string
     * }  $validated
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            fullName: $validated['full_name'],
            email: $validated['email'],
            phone: $validated['phone'] ?? null,
            organization: $validated['organization'] ?? null,
            message: $validated['message'],
        );
    }
}
