<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\ServiceCategories\Models\ServiceCategory;

final class PrPerHourKnowledgeBuilder
{
    /**
     * @return array{
     *     company: array<string, mixed>,
     *     service_categories: list<array{
     *         name: string,
     *         description: string|null,
     *         services: list<array{
     *             title: string,
     *             description: string|null
     *         }>
     *     }>
     * }
     */
    public function build(): array
    {
        $categories = ServiceCategory::query()
            ->active()
            ->with([
                'services' => static function ($query): void {
                    $query
                        ->where('is_active', true)
                        ->orderBy('id');
                },
            ])
            ->orderBy('id')
            ->get();

        return [
            'company' => (array) config(
                'chatbot.company',
                [],
            ),

            'service_categories' => $categories
                ->map(static function (ServiceCategory $category): array {
                    return [
                        'name' => $category->name,
                        'description' => $category->description,

                        'services' => $category->services
                            ->map(static fn ($service): array => [
                                'title' => $service->title,
                                'description' => $service->description,
                            ])
                            ->values()
                            ->all(),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    public function toPromptContext(): string
    {
        $knowledge = $this->build();
        $company = $knowledge['company'];

        $lines = [
            'PR PER HOUR KNOWLEDGE',
            'Company: '.($company['name'] ?? 'PR Per Hour'),
            'Website: '.($company['website'] ?? ''),
            'Email: '.($company['email'] ?? ''),
            'Phone: '.($company['phone'] ?? ''),
            'About: '.($company['description'] ?? ''),
            '',
            'LEADERSHIP',
        ];

        foreach (($company['leadership'] ?? []) as $leader) {
            $lines[] = sprintf(
                '- %s / %s — %s / %s',
                $leader['name_en'] ?? '',
                $leader['name_ar'] ?? '',
                $leader['role'] ?? '',
                $leader['role_ar'] ?? '',
            );

            $expertise = array_values(
                array_filter(
                    (array) ($leader['expertise'] ?? []),
                    static fn ($value): bool =>
                        is_string($value)
                        && trim($value) !== '',
                ),
            );

            if ($expertise !== []) {
                $lines[] = '  Expertise: '.implode(
                    '; ',
                    $expertise,
                );
            }
        }

        $lines[] = '';
        $lines[] = 'ORGANIZATIONS WE HAVE WORKED WITH';

        foreach ((array) config('chatbot.worked_with', []) as $organization) {
            $lines[] = sprintf(
                '- %s / %s — %s / %s',
                $organization['name_en'] ?? '',
                $organization['name_ar'] ?? '',
                $organization['type_en'] ?? '',
                $organization['type_ar'] ?? '',
            );
        }

        $lines[] = '';
        $lines[] = 'SERVICES';

        foreach (
            $knowledge['service_categories']
            as $category
        ) {
            $lines[] = '';
            $lines[] = 'Category: '.$category['name'];

            foreach ($category['services'] as $service) {
                $description = self::compactDescription(
                    $service['description'] ?? null,
                );

                $line = '- '.$service['title'];

                if ($description !== null) {
                    $line .= ': '.$description;
                }

                $lines[] = $line;
            }
        }

        return implode("\n", $lines);
    }

    private static function compactDescription(
        ?string $description,
    ): ?string {
        if ($description === null) {
            return null;
        }

        $clean = trim(
            preg_replace(
                '/\s+/u',
                ' ',
                $description,
            ) ?? $description,
        );

        if ($clean === '') {
            return null;
        }

        /*
         * One sentence is enough for model routing/recommendation while
         * preserving the authoritative meaning from the database.
         */
        if (
            preg_match(
                '/^(.{1,180}?[.!?])(?:\s|$)/u',
                $clean,
                $match,
            )
        ) {
            return trim($match[1]);
        }

        if (mb_strlen($clean, 'UTF-8') <= 180) {
            return $clean;
        }

        return rtrim(
            mb_substr(
                $clean,
                0,
                177,
                'UTF-8',
            ),
        ).'...';
    }
}
