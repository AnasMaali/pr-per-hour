<?php

declare(strict_types=1);

namespace App\Features\Chatbot\DTOs;

/**
 * Outcome of running AnasResponseQualityGuard on a candidate reply.
 *
 * `text` is always the best available text (deterministic sanitizations,
 * such as softened real-time claims, are applied even when `accepted` is
 * true). `issues` are internal diagnostic codes for logging only — never
 * exposed through the public chatbot API.
 */
final readonly class AnasResponseQualityResult
{
    /**
     * @param  list<string>  $issues
     */
    public function __construct(
        public bool $accepted,
        public string $text,
        public array $issues = [],
    ) {}
}
