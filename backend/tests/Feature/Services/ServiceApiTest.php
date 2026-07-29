<?php

declare(strict_types=1);

namespace Tests\Feature\Services;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_list_returns_only_publicly_visible_services(): void
    {
        $activeCategory = ServiceCategory::factory()->create(['slug' => 'active-cat']);
        $inactiveCategory = ServiceCategory::factory()->inactive()->create(['slug' => 'inactive-cat']);
        $deletedCategory = ServiceCategory::factory()->create(['slug' => 'deleted-cat']);

        $visible = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'title' => 'Visible Service',
            'slug' => 'visible-service',
            'price' => 100.50,
        ]);
        Service::factory()->inactive()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'inactive-service',
        ]);
        $trashedService = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'trashed-service',
        ]);
        $trashedService->delete();
        Service::factory()->create([
            'category_id' => $inactiveCategory->id,
            'slug' => 'under-inactive-category',
        ]);
        Service::factory()->create([
            'category_id' => $deletedCategory->id,
            'slug' => 'under-deleted-category',
        ]);
        $deletedCategory->delete();

        $response = $this->getJson('/api/v1/services');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Services retrieved successfully.')
            ->assertJsonPath('meta.per_page', 12)
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('X-Request-ID');

        $slugs = collect($response->json('data'))->pluck('slug')->all();
        $this->assertSame(['visible-service'], $slugs);

        $item = $response->json('data.0');
        $this->assertSame($visible->id, $item['id']);
        $this->assertSame('100.50', $item['price']);
        $this->assertSame('USD', $item['currency']);
        $this->assertArrayHasKey('category', $item);
        $this->assertSame(['id', 'name', 'slug'], array_keys($item['category']));
        $this->assertArrayNotHasKey('deleted_at', $item);
        $this->assertArrayNotHasKey('bookings', $item);
        $this->assertArrayNotHasKey('payments', $item);
        $this->assertArrayNotHasKey('invoices', $item);
    }

    public function test_public_list_filters_sorting_pagination_and_locale(): void
    {
        $category = ServiceCategory::factory()->create(['slug' => 'pr-campaigns']);
        $other = ServiceCategory::factory()->create(['slug' => 'training']);

        Service::factory()->create([
            'category_id' => $category->id,
            'title' => 'Media Training',
            'slug' => 'media-training',
            'description' => 'Press interview coaching',
            'price' => 200,
            'currency' => 'USD',
            'duration_minutes' => 60,
        ]);
        Service::factory()->create([
            'category_id' => $other->id,
            'title' => 'Crisis Plan',
            'slug' => 'crisis-plan',
            'description' => 'Emergency response',
            'price' => 50,
            'currency' => 'EUR',
            'duration_minutes' => 90,
        ]);

        $this->getJson('/api/v1/services?search=Media')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'media-training');

        $this->getJson('/api/v1/services?search=media-training')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/services?search=interview')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/services?category=pr-campaigns')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'media-training');

        $this->getJson('/api/v1/services?currency=eur')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.currency', 'EUR');

        $this->getJson('/api/v1/services?duration_minutes=60')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/services?min_price=100')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'media-training');

        $this->getJson('/api/v1/services?max_price=100')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'crisis-plan');

        $this->getJson('/api/v1/services?min_price=200&max_price=50')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['min_price']);

        $this->getJson('/api/v1/services?sort=title&direction=asc')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'crisis-plan');

        $this->getJson('/api/v1/services?sort=password')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sort']);

        $this->getJson('/api/v1/services?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);

        $this->withHeader('X-Locale', 'ar')
            ->getJson('/api/v1/services')
            ->assertOk()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'تم استرجاع الخدمات بنجاح.');
    }

    public function test_public_show_respects_visibility_rules(): void
    {
        $activeCategory = ServiceCategory::factory()->create();
        $inactiveCategory = ServiceCategory::factory()->inactive()->create();
        $deletedCategory = ServiceCategory::factory()->create();

        $active = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'active-service',
        ]);
        Service::factory()->inactive()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'inactive-service',
        ]);
        $deleted = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'deleted-service',
        ]);
        $deleted->delete();
        Service::factory()->create([
            'category_id' => $inactiveCategory->id,
            'slug' => 'under-inactive',
        ]);
        Service::factory()->create([
            'category_id' => $deletedCategory->id,
            'slug' => 'under-deleted',
        ]);
        $deletedCategory->delete();

        $this->getJson('/api/v1/services/active-service')
            ->assertOk()
            ->assertJsonPath('data.id', $active->id)
            ->assertJsonPath('data.category.id', $activeCategory->id)
            ->assertJsonMissingPath('data.bookings')
            ->assertJsonMissingPath('data.payments')
            ->assertJsonMissingPath('data.invoices');

        $this->getJson('/api/v1/services/inactive-service')->assertNotFound();
        $this->getJson('/api/v1/services/deleted-service')->assertNotFound();
        $this->getJson('/api/v1/services/under-inactive')->assertNotFound();
        $this->getJson('/api/v1/services/under-deleted')->assertNotFound();
        $this->getJson('/api/v1/services/unknown-slug')->assertNotFound();
    }

    public function test_admin_authorization_boundaries(): void
    {
        $this->getJson('/api/v1/admin/services')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/admin/services')->assertForbidden();

        $category = ServiceCategory::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'X',
            'slug' => 'x',
        ])->assertForbidden();

        $this->patchJson('/api/v1/admin/services/'.$service->id, ['title' => 'Y'])
            ->assertForbidden();
        $this->patchJson('/api/v1/admin/services/'.$service->id.'/status', ['is_active' => false])
            ->assertForbidden();
        $this->deleteJson('/api/v1/admin/services/'.$service->id)->assertForbidden();

        $service->delete();
        $this->postJson('/api/v1/admin/services/'.$service->id.'/restore')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/v1/admin/services')->assertOk();
    }

    public function test_admin_list_filters_and_includes_inactive_category_services(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $activeCategory = ServiceCategory::factory()->create(['slug' => 'active-cat']);
        $inactiveCategory = ServiceCategory::factory()->inactive()->create(['slug' => 'inactive-cat']);

        Service::factory()->create([
            'category_id' => $activeCategory->id,
            'title' => 'Alpha',
            'slug' => 'alpha',
            'is_active' => true,
            'price' => 10,
            'currency' => 'USD',
            'duration_minutes' => 30,
        ]);
        Service::factory()->inactive()->create([
            'category_id' => $activeCategory->id,
            'title' => 'Beta',
            'slug' => 'beta',
            'price' => 20,
            'currency' => 'EUR',
            'duration_minutes' => 45,
        ]);
        Service::factory()->create([
            'category_id' => $inactiveCategory->id,
            'title' => 'Gamma',
            'slug' => 'gamma',
        ]);
        $trashed = Service::factory()->create([
            'category_id' => $activeCategory->id,
            'slug' => 'trashed',
        ]);
        $trashed->delete();

        $list = $this->getJson('/api/v1/admin/services?per_page=15')->assertOk();
        $slugs = collect($list->json('data'))->pluck('slug')->all();
        $this->assertContains('alpha', $slugs);
        $this->assertContains('beta', $slugs);
        $this->assertContains('gamma', $slugs);
        $this->assertNotContains('trashed', $slugs);
        $this->assertSame(15, $list->json('meta.per_page'));

        $this->getJson('/api/v1/admin/services?search=Alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/services?category_id='.$activeCategory->id)
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/v1/admin/services?category=inactive-cat')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'gamma');

        $this->getJson('/api/v1/admin/services?is_active=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'beta');

        $this->getJson('/api/v1/admin/services?currency=EUR')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/services?min_price=15&max_price=25')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'beta');

        $this->getJson('/api/v1/admin/services?duration_minutes=30')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/services?sort=title&direction=asc')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'alpha');

        $this->getJson('/api/v1/admin/services?per_page=101')
            ->assertUnprocessable();
    }

    public function test_admin_can_create_service_with_defaults_and_validation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create();
        $inactiveCategory = ServiceCategory::factory()->inactive()->create();
        $deletedCategory = ServiceCategory::factory()->create();
        $deletedCategory->delete();

        $created = $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Strategic Briefing',
            'slug' => 'Strategic Briefing',
            'description' => null,
            'duration_minutes' => null,
        ]);

        $created->assertCreated()
            ->assertJsonPath('message', 'Service created successfully.')
            ->assertJsonPath('data.slug', 'strategic-briefing')
            ->assertJsonPath('data.price', '0.00')
            ->assertJsonPath('data.currency', 'USD')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonPath('data.description', null)
            ->assertJsonPath('data.duration_minutes', null);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $inactiveCategory->id,
            'title' => 'Draft Service',
            'slug' => 'draft-service',
            'is_active' => false,
            'price' => 12.5,
            'currency' => 'eur',
        ])
            ->assertCreated()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.price', '12.50')
            ->assertJsonPath('data.currency', 'EUR');

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $deletedCategory->id,
            'title' => 'Bad',
            'slug' => 'bad',
        ])->assertUnprocessable()->assertJsonValidationErrors(['category_id']);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Dup',
            'slug' => 'strategic-briefing',
        ])->assertUnprocessable()->assertJsonValidationErrors(['slug']);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Neg',
            'slug' => 'neg',
            'price' => -1,
        ])->assertUnprocessable()->assertJsonValidationErrors(['price']);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Overflow',
            'slug' => 'overflow',
            'price' => 100000000,
        ])->assertUnprocessable()->assertJsonValidationErrors(['price']);

        $this->postJson('/api/v1/admin/services', [
            'category_id' => $category->id,
            'title' => 'Neg Duration',
            'slug' => 'neg-duration',
            'duration_minutes' => -5,
        ])->assertUnprocessable()->assertJsonValidationErrors(['duration_minutes']);
    }

    public function test_admin_can_update_service_and_rejects_protected_fields(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create();
        $other = ServiceCategory::factory()->create();
        $deletedCategory = ServiceCategory::factory()->create();
        $deletedCategory->delete();

        $service = Service::factory()->create([
            'category_id' => $category->id,
            'title' => 'Old',
            'slug' => 'old-slug',
            'description' => 'desc',
            'duration_minutes' => 60,
            'price' => 10,
            'currency' => 'USD',
            'is_active' => true,
        ]);
        Service::factory()->create([
            'category_id' => $category->id,
            'slug' => 'taken',
        ]);

        $this->patchJson('/api/v1/admin/services/'.$service->id, [
            'title' => 'New Title',
            'category_id' => $other->id,
            'slug' => 'New Slug',
            'description' => null,
            'duration_minutes' => null,
            'price' => 33.3,
            'currency' => 'gbp',
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'New Title')
            ->assertJsonPath('data.category.id', $other->id)
            ->assertJsonPath('data.slug', 'new-slug')
            ->assertJsonPath('data.description', null)
            ->assertJsonPath('data.duration_minutes', null)
            ->assertJsonPath('data.price', '33.30')
            ->assertJsonPath('data.currency', 'GBP');

        $this->patchJson('/api/v1/admin/services/'.$service->id, [
            'slug' => 'taken',
        ])->assertUnprocessable()->assertJsonValidationErrors(['slug']);

        $this->patchJson('/api/v1/admin/services/'.$service->id, [
            'category_id' => $deletedCategory->id,
        ])->assertUnprocessable()->assertJsonValidationErrors(['category_id']);

        $this->patchJson('/api/v1/admin/services/'.$service->id, [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service']);

        $this->patchJson('/api/v1/admin/services/'.$service->id, [
            'is_active' => false,
        ])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);

        $this->patchJson('/api/v1/admin/services/'.$service->id, [
            'id' => 1,
            'deleted_at' => now()->toIso8601String(),
        ])->assertUnprocessable();

        $service->refresh();
        $this->assertTrue($service->is_active);
    }

    public function test_admin_status_and_public_visibility_with_inactive_category(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $inactiveCategory = ServiceCategory::factory()->inactive()->create();
        $service = Service::factory()->inactive()->create([
            'category_id' => $inactiveCategory->id,
            'slug' => 'hidden-by-category',
        ]);

        $this->patchJson('/api/v1/admin/services/'.$service->id.'/status', [
            'is_active' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('message', 'Service activated successfully.');

        $this->getJson('/api/v1/services/hidden-by-category')->assertNotFound();

        $this->withHeader('X-Locale', 'ar')
            ->patchJson('/api/v1/admin/services/'.$service->id.'/status', [
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('message', 'تم إلغاء تفعيل الخدمة بنجاح.');

        $this->patchJson('/api/v1/admin/services/'.$service->id.'/status', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['is_active']);
    }

    public function test_admin_soft_delete_and_restore_behavior(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create();
        $service = Service::factory()->create([
            'category_id' => $category->id,
            'slug' => 'restorable-service',
            'is_active' => true,
        ]);

        $this->deleteJson('/api/v1/admin/services/'.$service->id)
            ->assertOk()
            ->assertJsonPath('message', 'Service deleted successfully.');

        $this->assertSoftDeleted('services', ['id' => $service->id]);
        $this->getJson('/api/v1/services/restorable-service')->assertNotFound();

        $adminList = $this->getJson('/api/v1/admin/services')->assertOk();
        $this->assertNotContains('restorable-service', collect($adminList->json('data'))->pluck('slug')->all());

        $this->postJson('/api/v1/admin/services/'.$service->id.'/restore')
            ->assertOk()
            ->assertJsonPath('data.slug', 'restorable-service');

        $this->getJson('/api/v1/services/restorable-service')->assertOk();

        $this->postJson('/api/v1/admin/services/999999/restore')->assertNotFound();

        $live = Service::factory()->create(['category_id' => $category->id]);
        $this->postJson('/api/v1/admin/services/'.$live->id.'/restore')->assertNotFound();

        $orphanCategory = ServiceCategory::factory()->create();
        $blocked = Service::factory()->create([
            'category_id' => $orphanCategory->id,
            'slug' => 'blocked-restore',
        ]);
        $blocked->delete();
        $orphanCategory->delete();

        $this->postJson('/api/v1/admin/services/'.$blocked->id.'/restore')
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'CATEGORY_UNAVAILABLE')
            ->assertJsonPath('message', 'This service cannot be restored because its category is deleted.');
    }

    public function test_only_approved_service_routes_exist(): void
    {
        $serviceRoutes = collect(Route::getRoutes())->filter(
            fn ($route) => preg_match('#(^|/)services(/|$)#', $route->uri()) === 1
                && ! str_contains($route->uri(), 'service-categories'),
        );

        $expected = [
            'api/v1/services' => ['GET'],
            'api/v1/services/{slug}' => ['GET'],
            'api/v1/admin/services' => ['GET', 'POST'],
            'api/v1/admin/services/{service}' => ['GET', 'PATCH', 'DELETE'],
            'api/v1/admin/services/{service}/status' => ['PATCH'],
            'api/v1/admin/services/{id}/restore' => ['POST'],
        ];

        foreach ($serviceRoutes as $route) {
            $uri = $route->uri();
            $methods = array_values(array_diff($route->methods(), ['HEAD']));
            $this->assertArrayHasKey($uri, $expected, 'Unexpected route: '.$uri);
            foreach ($methods as $method) {
                $this->assertContains($method, $expected[$uri]);
            }
        }

        $allUris = collect(Route::getRoutes())->map(fn ($route) => $route->uri());
        $this->assertFalse($allUris->contains(fn ($uri) => str_contains($uri, 'payments')));
        $this->assertFalse($allUris->contains(fn ($uri) => str_contains($uri, 'translation')));
        $this->assertFalse($allUris->contains(fn ($uri) => str_contains($uri, 'force')));
        $this->assertFalse($allUris->contains(fn ($uri) => str_contains($uri, 'upload')));
    }

    public function test_services_schema_columns_unchanged(): void
    {
        $columns = collect(Schema::getColumnListing('services'))->sort()->values()->all();

        $this->assertSame([
            'category_id',
            'created_at',
            'currency',
            'deleted_at',
            'description',
            'duration_minutes',
            'id',
            'is_active',
            'price',
            'slug',
            'title',
            'updated_at',
        ], $columns);
    }
}
