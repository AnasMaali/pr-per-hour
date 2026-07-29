<?php

declare(strict_types=1);

namespace Tests\Feature\ServiceCategories;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class ServiceCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_list_returns_only_active_non_deleted_categories(): void
    {
        $active = ServiceCategory::factory()->create(['name' => 'Active Cat', 'slug' => 'active-cat']);
        ServiceCategory::factory()->inactive()->create(['slug' => 'inactive-cat']);
        $deleted = ServiceCategory::factory()->create(['slug' => 'deleted-cat']);
        $deleted->delete();

        $response = $this->getJson('/api/v1/service-categories');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Service categories retrieved successfully.')
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('X-Request-ID');

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertContains($active->id, $ids);
        $this->assertCount(1, $ids);

        $item = $response->json('data.0');
        $this->assertSame([
            'id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at',
        ], array_keys($item));
        $this->assertArrayNotHasKey('deleted_at', $item);
        $this->assertTrue($item['is_active']);
    }

    public function test_public_list_returns_arabic_message(): void
    {
        ServiceCategory::factory()->create();

        $this->withHeader('X-Locale', 'ar')
            ->getJson('/api/v1/service-categories')
            ->assertOk()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'تم استرجاع فئات الخدمات بنجاح.');
    }

    public function test_public_show_resolves_active_slug_and_hides_inactive_or_deleted(): void
    {
        $active = ServiceCategory::factory()->create(['slug' => 'strategic-communication']);
        ServiceCategory::factory()->inactive()->create(['slug' => 'inactive-slug']);
        $deleted = ServiceCategory::factory()->create(['slug' => 'deleted-slug']);
        $deleted->delete();

        $this->getJson('/api/v1/service-categories/strategic-communication')
            ->assertOk()
            ->assertJsonPath('data.id', $active->id)
            ->assertJsonPath('data.slug', 'strategic-communication')
            ->assertJsonMissingPath('data.services');

        $this->getJson('/api/v1/service-categories/inactive-slug')->assertNotFound();
        $this->getJson('/api/v1/service-categories/deleted-slug')->assertNotFound();
        $this->getJson('/api/v1/service-categories/unknown-slug')->assertNotFound();
    }

    public function test_admin_list_requires_admin_and_supports_filters_sort_pagination(): void
    {
        $this->getJson('/api/v1/admin/service-categories')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/admin/service-categories')->assertForbidden();

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        ServiceCategory::factory()->create(['name' => 'Alpha PR', 'slug' => 'alpha-pr', 'is_active' => true]);
        ServiceCategory::factory()->inactive()->create(['name' => 'Beta PR', 'slug' => 'beta-pr']);
        $deleted = ServiceCategory::factory()->create(['name' => 'Gone', 'slug' => 'gone']);
        $deleted->delete();

        $list = $this->getJson('/api/v1/admin/service-categories?per_page=15');
        $list->assertOk()
            ->assertJsonPath('meta.per_page', 15)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonStructure(['meta' => ['current_page', 'per_page', 'total', 'last_page']]);

        $ids = collect($list->json('data'))->pluck('slug')->all();
        $this->assertContains('alpha-pr', $ids);
        $this->assertContains('beta-pr', $ids);
        $this->assertNotContains('gone', $ids);

        $this->getJson('/api/v1/admin/service-categories?search=alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'alpha-pr');

        $this->getJson('/api/v1/admin/service-categories?search=beta-pr')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'beta-pr');

        $this->getJson('/api/v1/admin/service-categories?is_active=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_active', false);

        $this->getJson('/api/v1/admin/service-categories?sort=name&direction=asc')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'alpha-pr');

        $this->getJson('/api/v1/admin/service-categories?sort=password')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sort']);

        $this->getJson('/api/v1/admin/service-categories?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_client_cannot_mutate_categories(): void
    {
        $client = User::factory()->create();
        $category = ServiceCategory::factory()->create();
        Sanctum::actingAs($client);

        $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'X',
            'slug' => 'x',
        ])->assertForbidden();

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [
            'name' => 'Y',
        ])->assertForbidden();

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id.'/status', [
            'is_active' => false,
        ])->assertForbidden();

        $this->deleteJson('/api/v1/admin/service-categories/'.$category->id)
            ->assertForbidden();

        $category->delete();
        $this->postJson('/api/v1/admin/service-categories/'.$category->id.'/restore')
            ->assertForbidden();
    }

    public function test_admin_can_create_category_with_defaults_and_validation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $created = $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'Strategic Communication',
            'slug' => 'Strategic Communication',
            'description' => null,
        ]);

        $created->assertCreated()
            ->assertJsonPath('message', 'Service category created successfully.')
            ->assertJsonPath('data.slug', 'strategic-communication')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.description', null);

        $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'Inactive One',
            'slug' => 'inactive-one',
            'is_active' => false,
        ])
            ->assertCreated()
            ->assertJsonPath('data.is_active', false);

        $this->postJson('/api/v1/admin/service-categories', [
            'slug' => 'missing-name',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name']);

        $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'Missing Slug',
        ])->assertUnprocessable()->assertJsonValidationErrors(['slug']);

        $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'Dup',
            'slug' => 'strategic-communication',
        ])->assertUnprocessable()->assertJsonValidationErrors(['slug']);

        $response = $this->postJson('/api/v1/admin/service-categories', [
            'name' => 'Bad',
            'slug' => 'ok',
            'id' => 999,
            'created_at' => '2020-01-01',
        ]);
        $response->assertCreated();
        $this->assertNotSame(999, $response->json('data.id'));
    }

    public function test_admin_can_update_category_and_rejects_protected_fields(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create([
            'name' => 'Old',
            'slug' => 'old-slug',
            'description' => 'desc',
            'is_active' => true,
        ]);
        ServiceCategory::factory()->create(['slug' => 'taken']);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [
            'name' => 'New Name',
            'slug' => 'New Slug',
            'description' => null,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.slug', 'new-slug')
            ->assertJsonPath('data.description', null);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [
            'slug' => 'taken',
        ])->assertUnprocessable()->assertJsonValidationErrors(['slug']);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [
            'is_active' => false,
        ])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id, [
            'id' => 1,
            'deleted_at' => now()->toIso8601String(),
        ])->assertUnprocessable();

        $category->refresh();
        $this->assertTrue($category->is_active);
    }

    public function test_admin_status_endpoint_activates_and_deactivates(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create(['is_active' => true]);

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id.'/status', [
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('message', 'Service category deactivated successfully.');

        $this->withHeader('X-Locale', 'ar')
            ->patchJson('/api/v1/admin/service-categories/'.$category->id.'/status', [
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('message', 'تم تفعيل فئة الخدمة بنجاح.');

        $this->patchJson('/api/v1/admin/service-categories/'.$category->id.'/status', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['is_active']);
    }

    public function test_admin_soft_delete_and_restore_behavior(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = ServiceCategory::factory()->create([
            'slug' => 'restorable',
            'is_active' => true,
        ]);

        $this->deleteJson('/api/v1/admin/service-categories/'.$category->id)
            ->assertOk()
            ->assertJsonPath('message', 'Service category deleted successfully.');

        $this->assertSoftDeleted('service_categories', ['id' => $category->id]);

        $this->getJson('/api/v1/service-categories/restorable')->assertNotFound();
        $adminList = $this->getJson('/api/v1/admin/service-categories')->assertOk();
        $this->assertNotContains('restorable', collect($adminList->json('data'))->pluck('slug')->all());

        $this->postJson('/api/v1/admin/service-categories/'.$category->id.'/restore')
            ->assertOk()
            ->assertJsonPath('data.slug', 'restorable')
            ->assertJsonPath('message', 'Service category restored successfully.');

        $this->getJson('/api/v1/service-categories/restorable')->assertOk();

        $this->postJson('/api/v1/admin/service-categories/999999/restore')->assertNotFound();

        $live = ServiceCategory::factory()->create();
        $this->postJson('/api/v1/admin/service-categories/'.$live->id.'/restore')
            ->assertNotFound();
    }

    public function test_admin_show_includes_inactive_excludes_deleted(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $inactive = ServiceCategory::factory()->inactive()->create();
        $deleted = ServiceCategory::factory()->create();
        $deleted->delete();

        $this->getJson('/api/v1/admin/service-categories/'.$inactive->id)
            ->assertOk()
            ->assertJsonPath('data.id', $inactive->id)
            ->assertJsonPath('data.is_active', false);

        $this->getJson('/api/v1/admin/service-categories/'.$deleted->id)
            ->assertNotFound();
    }

    public function test_only_approved_service_category_routes_exist(): void
    {
        $categoryRoutes = collect(Route::getRoutes())->filter(
            fn ($route) => str_contains($route->uri(), 'service-categories'),
        );

        $expected = [
            'api/v1/service-categories' => ['GET'],
            'api/v1/service-categories/{slug}' => ['GET'],
            'api/v1/admin/service-categories' => ['GET', 'POST'],
            'api/v1/admin/service-categories/{serviceCategory}' => ['GET', 'PATCH', 'DELETE'],
            'api/v1/admin/service-categories/{serviceCategory}/status' => ['PATCH'],
            'api/v1/admin/service-categories/{id}/restore' => ['POST'],
        ];

        foreach ($categoryRoutes as $route) {
            $uri = $route->uri();
            $methods = array_values(array_diff($route->methods(), ['HEAD']));
            $this->assertArrayHasKey($uri, $expected, 'Unexpected route: '.$uri);
            foreach ($methods as $method) {
                $this->assertContains($method, $expected[$uri], "Unexpected method {$method} on {$uri}");
            }
        }

        $uris = $categoryRoutes->map(fn ($route) => $route->uri())->unique()->values()->all();
        $this->assertNotContains('api/v1/services', $uris);
        $this->assertFalse(
            collect($uris)->contains(fn ($uri) => str_contains($uri, 'translation')
                || str_contains($uri, 'bulk')
                || str_contains($uri, 'force')),
        );
    }

    public function test_schema_columns_unchanged_for_service_categories(): void
    {
        $columns = collect(Schema::getColumnListing('service_categories'))
            ->sort()
            ->values()
            ->all();

        $this->assertSame([
            'created_at',
            'deleted_at',
            'description',
            'id',
            'is_active',
            'name',
            'slug',
            'updated_at',
        ], $columns);
    }
}
