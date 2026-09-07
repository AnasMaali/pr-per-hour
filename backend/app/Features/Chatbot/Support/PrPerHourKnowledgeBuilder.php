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
            '',
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
                '- %s (Arabic: %s) — %s',
                $leader['name_en'] ?? '',
                $leader['name_ar'] ?? '',
                $leader['role'] ?? '',
            );

            foreach (($leader['expertise'] ?? []) as $expertise) {
                $lines[] = '  • '.$expertise;
            }
        }

        $lines[] = '';
        $lines[] = 'SERVICES';

        foreach ($knowledge['service_categories'] as $category) {
            $lines[] = '';
            $lines[] = 'Category: '.$category['name'];

            if ($category['description']) {
                $lines[] = $category['description'];
            }

            foreach ($category['services'] as $service) {
                $lines[] = '- '.$service['title'];

                if ($service['description']) {
                    $lines[] = '  '.$service['description'];
                }
            }
        }

        return implode("\n", $lines);
    }
}
