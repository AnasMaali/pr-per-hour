<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Features\ServiceCategories\Models\ServiceCategory;
use Illuminate\Database\Seeder;

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
        [
            'name' => 'Data, AI & Technology',
            'slug' => 'data-ai-technology',
            'description' => 'Data-driven, AI-powered, and digital solutions that help organizations understand information, improve operations, automate workflows, and make better business decisions.',
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $categoryData) {
            $category = ServiceCategory::withTrashed()
                ->where('slug', $categoryData['slug'])
                ->first();

            if ($category === null) {
                ServiceCategory::query()->create([
                    ...$categoryData,
                    'is_active' => true,
                ]);

                continue;
            }

            // Keep operational state such as active/deleted status unchanged.
            $category->name = $categoryData['name'];
            $category->description = $categoryData['description'];
            $category->save();
        }
    }
}
