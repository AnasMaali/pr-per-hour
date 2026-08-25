<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use Database\Seeders\ServiceCatalogSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ServiceCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_complete_service_catalog(): void
    {
        $this->seed(ServiceCategorySeeder::class);
        $this->seed(ServiceCatalogSeeder::class);

        $this->assertSame(4, ServiceCategory::query()->count());
        $this->assertSame(20, Service::query()->count());

        $technology = ServiceCategory::query()
            ->where('slug', 'data-ai-technology')
            ->firstOrFail();

        $this->assertSame('Data, AI & Technology', $technology->name);

        $this->assertSame(
            5,
            Service::query()
                ->where('category_id', $technology->id)
                ->count()
        );

        $this->assertDatabaseHas('services', [
            'slug' => 'data-analysis-business-intelligence',
            'category_id' => $technology->id,
        ]);

        $this->assertDatabaseHas('services', [
            'slug' => 'technology-ai-consulting',
            'category_id' => $technology->id,
        ]);
    }

    public function test_catalog_seeding_is_idempotent(): void
    {
        $this->seed(ServiceCategorySeeder::class);
        $this->seed(ServiceCatalogSeeder::class);

        $this->seed(ServiceCategorySeeder::class);
        $this->seed(ServiceCatalogSeeder::class);

        $this->assertSame(4, ServiceCategory::query()->count());
        $this->assertSame(20, Service::query()->count());
    }

    public function test_reseeding_preserves_operational_service_values(): void
    {
        $this->seed(ServiceCategorySeeder::class);
        $this->seed(ServiceCatalogSeeder::class);

        $service = Service::query()
            ->where('slug', 'communication-strategy-development')
            ->firstOrFail();

        $service->update([
            'price' => '125.00',
            'currency' => 'USD',
            'duration_minutes' => 90,
            'is_active' => false,
        ]);

        $this->seed(ServiceCatalogSeeder::class);

        $service->refresh();

        $this->assertSame('125.00', $service->price);
        $this->assertSame('USD', $service->currency);
        $this->assertSame(90, $service->duration_minutes);
        $this->assertFalse($service->is_active);
    }

    public function test_reseeding_preserves_category_operational_state(): void
    {
        $this->seed(ServiceCategorySeeder::class);

        $category = ServiceCategory::query()
            ->where('slug', 'data-ai-technology')
            ->firstOrFail();

        $category->update([
            'is_active' => false,
        ]);

        $this->seed(ServiceCategorySeeder::class);

        $category->refresh();

        $this->assertFalse($category->is_active);
    }
}
