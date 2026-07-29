<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Features\ServiceCategories\Models\ServiceCategory;
use Illuminate\Database\Seeder;

/**
 * Seeds the three initial categories from the client handoff SQL seed data.
 * Note: PR_Per_Hour_SQL.txt (schema-only export) does not include INSERT statements;
 * names/slugs/descriptions match the authoritative handoff seed block for these categories.
 */
class ServiceCategorySeeder extends Seeder
{
    /**
     * @var list<array{name: string, slug: string, description: string}>
     */
    public const CATEGORIES = [
        [
            'name' => 'Strategic Communication',
            'slug' => 'strategic-communication',
            'description' => 'Communication strategy, stakeholder engagement, messaging, and organizational communication planning.',
        ],
        [
            'name' => 'Public Relations Campaigns',
            'slug' => 'public-relations-campaigns',
            'description' => 'Integrated PR campaigns, reputation management, media relations, crisis communication, and corporate positioning.',
        ],
        [
            'name' => 'Training & Capacity Building',
            'slug' => 'training-capacity-building',
            'description' => 'Training programs for communication teams, leaders, spokespersons, and corporate professionals.',
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $category) {
            ServiceCategory::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                ],
            );
        }
    }
}
