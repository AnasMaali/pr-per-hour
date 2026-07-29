<?php

declare(strict_types=1);

namespace Tests\Feature\Bookings;

use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\Requests\StoreBookingRequest;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    private function bookableService(array $overrides = []): Service
    {
        $category = ServiceCategory::factory()->create(['is_active' => true]);

        return Service::factory()->create(array_merge([
            'category_id' => $category->id,
            'is_active' => true,
            'price' => 150.5,
            'currency' => 'usd',
            'title' => 'Media Training',
            'slug' => 'media-training-'.uniqid(),
        ], $overrides));
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(Service $service, array $overrides = []): array
    {
        return array_merge([
            'service_id' => $service->id,
            'booking_date' => now()->addDays(3)->toDateString(),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'notes' => 'Please confirm agenda.',
        ], $overrides);
    }

    public function test_client_can_create_booking_with_security_controls(): void
    {
        $user = User::factory()->create();
        $service = $this->bookableService();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'user_id' => 999,
            'status' => 'confirmed',
            'meeting_link' => 'https://evil.example/meet',
        ]));

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id', 'status', 'meeting_link']);

        $ok = $this->postJson('/api/v1/bookings', $this->validPayload($service))
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Booking created successfully.')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.meeting_link', null)
            ->assertJsonPath('data.service.price', '150.50')
            ->assertJsonPath('data.service.currency', 'USD')
            ->assertJsonMissingPath('data.client')
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('X-Request-ID');

        $this->assertDatabaseHas('bookings', [
            'id' => $ok->json('data.id'),
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'pending',
            'meeting_link' => null,
        ]);

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/bookings', $this->validPayload($service, [
                'start_time' => '12:00',
                'end_time' => '13:00',
            ]))
            ->assertCreated()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'تم إنشاء الحجز بنجاح.');
    }

    public function test_unauthenticated_create_returns_401(): void
    {
        $service = $this->bookableService();

        $this->postJson('/api/v1/bookings', $this->validPayload($service))
            ->assertUnauthorized();
    }

    public function test_create_rejects_unavailable_services_and_invalid_times(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $inactiveService = $this->bookableService(['is_active' => false]);
        $this->postJson('/api/v1/bookings', $this->validPayload($inactiveService))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);

        $deletedService = $this->bookableService();
        $deletedService->delete();
        $this->postJson('/api/v1/bookings', $this->validPayload($deletedService))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);

        $inactiveCategory = ServiceCategory::factory()->create(['is_active' => false]);
        $underInactive = Service::factory()->create([
            'category_id' => $inactiveCategory->id,
            'is_active' => true,
        ]);
        $this->postJson('/api/v1/bookings', $this->validPayload($underInactive))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);

        $deletedCategory = ServiceCategory::factory()->create(['is_active' => true]);
        $underDeleted = Service::factory()->create([
            'category_id' => $deletedCategory->id,
            'is_active' => true,
        ]);
        $deletedCategory->delete();
        $this->postJson('/api/v1/bookings', $this->validPayload($underDeleted))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['service_id']);

        $service = $this->bookableService();
        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => now()->subDay()->toDateString(),
        ]))->assertUnprocessable()->assertJsonValidationErrors(['booking_date']);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'start_time' => '11:00',
            'end_time' => '10:00',
        ]))->assertUnprocessable()->assertJsonValidationErrors(['end_time']);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'start_time' => '10:00',
            'end_time' => '10:00',
        ]))->assertUnprocessable()->assertJsonValidationErrors(['end_time']);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'notes' => str_repeat('x', StoreBookingRequest::NOTES_MAX_LENGTH + 1),
        ]))->assertUnprocessable()->assertJsonValidationErrors(['notes']);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'notes' => null,
            'start_time' => '14:00',
            'end_time' => '15:00',
        ]))->assertCreated()->assertJsonPath('data.notes', null);
    }

    public function test_booking_conflict_and_adjacent_slots(): void
    {
        $user = User::factory()->create();
        $service = $this->bookableService();
        Sanctum::actingAs($user);

        $date = now()->addDays(5)->toDateString();

        Booking::factory()->create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Pending,
        ]);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '10:30',
            'end_time' => '11:30',
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_TIME_CONFLICT')
            ->assertJsonPath('message', 'The selected time overlaps an existing booking for this service.');

        Booking::factory()->confirmed()->create([
            'user_id' => User::factory(),
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '13:00:00',
            'end_time' => '14:00:00',
        ]);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '13:30',
            'end_time' => '14:30',
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_TIME_CONFLICT');

        Booking::factory()->cancelled()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '15:00:00',
            'end_time' => '16:00:00',
        ]);
        Booking::factory()->completed()->create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
        ]);

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '15:00',
            'end_time' => '16:00',
        ]))->assertCreated();

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '16:00',
            'end_time' => '17:00',
        ]))->assertCreated();

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '11:00',
            'end_time' => '12:00',
        ]))->assertCreated();

        $this->postJson('/api/v1/bookings', $this->validPayload($service, [
            'booking_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ]))->assertCreated();

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/bookings', $this->validPayload($service, [
                'booking_date' => $date,
                'start_time' => '10:15',
                'end_time' => '10:45',
            ]))
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_TIME_CONFLICT')
            ->assertJsonPath('message', 'الوقت المحدد يتعارض مع حجز قائم لهذه الخدمة.');
    }

    public function test_client_list_details_and_ownership(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $service = $this->bookableService();

        $mine = Booking::factory()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'start_time' => '10:00:00',
            'status' => BookingStatus::Pending,
        ]);
        $theirs = Booking::factory()->create([
            'user_id' => $other->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(4)->toDateString(),
        ]);
        $trashed = Booking::factory()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
        ]);
        $trashed->delete();

        Sanctum::actingAs($owner);

        $list = $this->getJson('/api/v1/bookings')->assertOk();
        $ids = collect($list->json('data'))->pluck('id')->all();
        $this->assertContains($mine->id, $ids);
        $this->assertNotContains($theirs->id, $ids);
        $this->assertNotContains($trashed->id, $ids);
        $this->assertSame(10, $list->json('meta.per_page'));
        $this->assertArrayHasKey('service', $list->json('data.0'));
        $this->assertArrayHasKey('category', $list->json('data.0.service'));
        $this->assertArrayNotHasKey('client', $list->json('data.0'));

        $this->getJson('/api/v1/bookings?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);

        $this->getJson('/api/v1/bookings?status=pending')
            ->assertOk()
            ->assertJsonPath('data.0.id', $mine->id);

        $this->getJson('/api/v1/bookings?service_id='.$service->id)->assertOk();
        $this->getJson('/api/v1/bookings?booking_date='.$mine->booking_date->format('Y-m-d'))
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/bookings?date_from='.now()->addDays(3)->toDateString().'&date_to='.now()->addDay()->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date_from']);

        $this->getJson('/api/v1/bookings?sort=created_at&direction=asc')->assertOk();

        $details = $this->getJson('/api/v1/bookings/'.$mine->id)
            ->assertOk()
            ->assertJsonPath('data.id', $mine->id)
            ->assertJsonPath('data.service.title', 'Media Training')
            ->assertJsonMissingPath('data.client')
            ->assertJsonMissingPath('data.deleted_at')
            ->assertJsonMissingPath('data.payments')
            ->assertJsonMissingPath('data.invoice');

        $this->assertSame(['id', 'booking_date', 'start_time', 'end_time', 'status', 'notes', 'meeting_link', 'service', 'created_at', 'updated_at'], array_keys($details->json('data')));

        $this->getJson('/api/v1/bookings/'.$theirs->id)->assertForbidden();
        $this->getJson('/api/v1/bookings/'.$trashed->id)->assertNotFound();

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/bookings/'.$mine->id)->assertUnauthorized();
    }

    public function test_client_cancellation_rules(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $service = $this->bookableService();
        Sanctum::actingAs($owner);

        $pending = Booking::factory()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'notes' => 'Keep notes',
            'meeting_link' => 'https://meet.example/a',
            'status' => BookingStatus::Pending,
        ]);

        $this->patchJson('/api/v1/bookings/'.$pending->id.'/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.notes', 'Keep notes')
            ->assertJsonPath('data.meeting_link', 'https://meet.example/a')
            ->assertJsonPath('message', 'Booking cancelled successfully.');

        $this->assertNotSoftDeleted('bookings', ['id' => $pending->id]);

        $this->patchJson('/api/v1/bookings/'.$pending->id.'/cancel')
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_CANNOT_BE_CANCELLED');

        $confirmed = Booking::factory()->confirmed()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(3)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);
        $this->patchJson('/api/v1/bookings/'.$confirmed->id.'/cancel')
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $completed = Booking::factory()->completed()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(4)->toDateString(),
        ]);
        $this->patchJson('/api/v1/bookings/'.$completed->id.'/cancel')
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_CANNOT_BE_CANCELLED');

        $past = Booking::factory()->create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'booking_date' => now()->subDay()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => BookingStatus::Pending,
        ]);
        $this->patchJson('/api/v1/bookings/'.$past->id.'/cancel')
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_CANNOT_BE_CANCELLED');

        $foreign = Booking::factory()->create([
            'user_id' => $other->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(5)->toDateString(),
        ]);
        $this->patchJson('/api/v1/bookings/'.$foreign->id.'/cancel')->assertForbidden();

        $this->withHeader('X-Locale', 'ar')
            ->patchJson('/api/v1/bookings/'.$completed->id.'/cancel')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'لا يمكن إلغاء هذا الحجز.');
    }

    public function test_admin_authorization_and_list_filters(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Sara Client', 'email' => 'sara@example.com']);
        $service = $this->bookableService(['slug' => 'media-training-admin']);

        $booking = Booking::factory()->create([
            'user_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:00:00',
            'status' => BookingStatus::Pending,
        ]);
        $confirmed = Booking::factory()->confirmed()->create([
            'user_id' => User::factory(),
            'service_id' => $service->id,
            'booking_date' => now()->addDays(1)->toDateString(),
            'start_time' => '12:00:00',
        ]);
        $trashed = Booking::factory()->create(['service_id' => $service->id]);
        $trashed->delete();

        $this->getJson('/api/v1/admin/bookings')->assertUnauthorized();

        Sanctum::actingAs($client);
        $this->getJson('/api/v1/admin/bookings')->assertForbidden();
        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/status', ['status' => 'confirmed'])->assertForbidden();
        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/meeting-link', ['meeting_link' => 'https://a.test'])->assertForbidden();
        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/notes', ['notes' => 'x'])->assertForbidden();

        Sanctum::actingAs($admin);

        $list = $this->getJson('/api/v1/admin/bookings')->assertOk();
        $ids = collect($list->json('data'))->pluck('id')->all();
        $this->assertContains($booking->id, $ids);
        $this->assertContains($confirmed->id, $ids);
        $this->assertNotContains($trashed->id, $ids);
        $this->assertSame(15, $list->json('meta.per_page'));
        $this->assertArrayHasKey('client', $list->json('data.0'));
        $this->assertSame($booking->id, $list->json('data.0.id'));

        $this->getJson('/api/v1/admin/bookings?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);

        $this->getJson('/api/v1/admin/bookings?status=confirmed')
            ->assertOk()
            ->assertJsonPath('data.0.id', $confirmed->id);

        $this->getJson('/api/v1/admin/bookings?user_id='.$client->id)
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/bookings?service_id='.$service->id)->assertOk();
        $this->getJson('/api/v1/admin/bookings?booking_date='.$booking->booking_date->format('Y-m-d'))
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/bookings?date_from='.now()->addDays(3)->toDateString().'&date_to='.now()->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date_from']);

        $this->getJson('/api/v1/admin/bookings?search=Sara')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/bookings?search=sara@example.com')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/bookings?search=Media')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/v1/admin/bookings?search=media-training-admin')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_details_status_meeting_link_and_notes(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create(['name' => 'Omar', 'email' => 'omar@example.com', 'phone' => '0599111222']);
        $service = $this->bookableService();
        Sanctum::actingAs($admin);

        $booking = Booking::factory()->create([
            'user_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'notes' => 'Initial',
            'meeting_link' => null,
            'status' => BookingStatus::Pending,
        ]);

        $details = $this->getJson('/api/v1/admin/bookings/'.$booking->id)
            ->assertOk()
            ->assertJsonPath('data.client.name', 'Omar')
            ->assertJsonPath('data.client.email', 'omar@example.com')
            ->assertJsonPath('data.client.phone', '0599111222')
            ->assertJsonPath('data.service.category.slug', $service->category->slug)
            ->assertJsonMissingPath('data.client.password')
            ->assertJsonMissingPath('data.payments')
            ->assertJsonMissingPath('data.invoice')
            ->assertJsonMissingPath('data.deleted_at');

        $this->assertSame('10:00', $details->json('data.start_time'));
        $this->assertSame('11:00', $details->json('data.end_time'));

        $trashed = Booking::factory()->create(['service_id' => $service->id]);
        $trashed->delete();
        $this->getJson('/api/v1/admin/bookings/'.$trashed->id)->assertNotFound();

        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/status', ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('message', 'Booking status updated successfully.');

        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/status', ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/status', ['status' => 'pending'])
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_INVALID_STATUS_TRANSITION');

        $pending2 = Booking::factory()->create([
            'user_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(6)->toDateString(),
            'status' => BookingStatus::Pending,
            'notes' => 'Stay',
        ]);
        $this->patchJson('/api/v1/admin/bookings/'.$pending2->id.'/status', ['status' => 'cancelled'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.notes', 'Stay');

        $this->patchJson('/api/v1/admin/bookings/'.$pending2->id.'/status', ['status' => 'confirmed'])
            ->assertUnprocessable()
            ->assertJsonPath('error_code', 'BOOKING_INVALID_STATUS_TRANSITION');

        $confirmed = Booking::factory()->confirmed()->create([
            'user_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(7)->toDateString(),
        ]);
        $this->patchJson('/api/v1/admin/bookings/'.$confirmed->id.'/status', ['status' => 'cancelled'])
            ->assertOk();

        $this->patchJson('/api/v1/admin/bookings/'.$booking->id.'/status', ['status' => 'paid'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $live = Booking::factory()->create([
            'user_id' => $client->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(8)->toDateString(),
            'status' => BookingStatus::Pending,
            'notes' => 'N1',
        ]);

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/meeting-link', [
            'meeting_link' => 'https://meet.example/room',
        ])
            ->assertOk()
            ->assertJsonPath('data.meeting_link', 'https://meet.example/room')
            ->assertJsonPath('data.status', 'pending');

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/meeting-link', [
            'meeting_link' => null,
        ])
            ->assertOk()
            ->assertJsonPath('data.meeting_link', null);

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/meeting-link', [
            'meeting_link' => 'not-a-url',
        ])->assertUnprocessable()->assertJsonValidationErrors(['meeting_link']);

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/meeting-link', [
            'meeting_link' => 'https://example.com/'.str_repeat('a', 500),
        ])->assertUnprocessable()->assertJsonValidationErrors(['meeting_link']);

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/notes', [
            'notes' => 'Admin note',
        ])
            ->assertOk()
            ->assertJsonPath('data.notes', 'Admin note')
            ->assertJsonPath('data.status', 'pending');

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/notes', [
            'notes' => null,
        ])
            ->assertOk()
            ->assertJsonPath('data.notes', null);

        $this->patchJson('/api/v1/admin/bookings/'.$live->id.'/notes', [
            'notes' => str_repeat('n', StoreBookingRequest::NOTES_MAX_LENGTH + 1),
        ])->assertUnprocessable()->assertJsonValidationErrors(['notes']);
    }

    public function test_only_approved_booking_routes_exist_and_schema_unchanged(): void
    {
        $routes = collect(Route::getRoutes())->filter(
            fn ($route) => str_contains($route->uri(), 'bookings'),
        );

        $expected = [
            'api/v1/bookings' => ['GET', 'POST'],
            'api/v1/bookings/{booking}' => ['GET'],
            'api/v1/bookings/{booking}/cancel' => ['PATCH'],
            'api/v1/admin/bookings' => ['GET'],
            'api/v1/admin/bookings/{booking}' => ['GET'],
            'api/v1/admin/bookings/{booking}/status' => ['PATCH'],
            'api/v1/admin/bookings/{booking}/meeting-link' => ['PATCH'],
            'api/v1/admin/bookings/{booking}/notes' => ['PATCH'],
        ];

        foreach ($routes as $route) {
            $uri = $route->uri();
            $methods = array_values(array_diff($route->methods(), ['HEAD']));
            $this->assertArrayHasKey($uri, $expected, 'Unexpected route: '.$uri);
            foreach ($methods as $method) {
                $this->assertContains($method, $expected[$uri]);
            }
        }

        $uris = $routes->map(fn ($route) => $route->uri())->all();
        $this->assertFalse(collect($uris)->contains(fn ($uri) => str_contains($uri, 'payment')
            || str_contains($uri, 'invoice')
            || str_contains($uri, 'restore')
            || str_contains($uri, 'reschedule')
            || str_contains($uri, 'availability')
            || str_contains($uri, 'calendar')
            || str_contains($uri, 'force')));

        $hasDelete = $routes->contains(fn ($route) => in_array('DELETE', $route->methods(), true));
        $this->assertFalse($hasDelete);

        $columns = collect(Schema::getColumnListing('bookings'))->sort()->values()->all();
        $this->assertSame([
            'booking_date',
            'created_at',
            'deleted_at',
            'end_time',
            'id',
            'meeting_link',
            'notes',
            'service_id',
            'start_time',
            'status',
            'updated_at',
            'user_id',
        ], $columns);
    }
}
