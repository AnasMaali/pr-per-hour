<?php

declare(strict_types=1);

namespace Tests\Feature\ContactMessages;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\ContactMessages\Requests\StoreContactMessageRequest;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class ContactMessageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_submit_contact_message_with_receipt_only(): void
    {
        $response = $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'Sara Client',
            'email' => '  Sara@Example.COM ',
            'phone' => '0599000000',
            'organization' => 'Acme',
            'message' => 'I need a consultation.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Your message has been submitted successfully.')
            ->assertJsonPath('data.status', 'new')
            ->assertJsonStructure([
                'data' => ['id', 'status', 'created_at'],
            ])
            ->assertHeader('Content-Language', 'en')
            ->assertHeader('X-Request-ID');

        $this->assertSame(['id', 'status', 'created_at'], array_keys($response->json('data')));
        $this->assertArrayNotHasKey('message', $response->json('data'));
        $this->assertArrayNotHasKey('full_name', $response->json('data'));
        $this->assertArrayNotHasKey('email', $response->json('data'));

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'sara@example.com',
            'full_name' => 'Sara Client',
            'status' => 'new',
            'organization' => 'Acme',
        ]);

        $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'Malicious',
            'email' => 'evil@example.com',
            'message' => 'Try override',
            'status' => 'closed',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'Malicious',
            'email' => 'evil2@example.com',
            'message' => 'Try protected',
            'subject' => 'Nope',
            'assigned_to' => 1,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subject', 'assigned_to']);

        $this->assertDatabaseMissing('contact_messages', ['email' => 'evil@example.com']);
    }

    public function test_public_submission_validation_and_locale(): void
    {
        $this->postJson('/api/v1/contact-messages', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name', 'email', 'message']);

        $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'A',
            'email' => 'not-an-email',
            'message' => 'Hello',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'A',
            'email' => 'a@example.com',
            'message' => str_repeat('x', StoreContactMessageRequest::MESSAGE_MAX_LENGTH + 1),
        ])->assertUnprocessable()->assertJsonValidationErrors(['message']);

        $this->postJson('/api/v1/contact-messages', [
            'full_name' => 'Optional Fields',
            'email' => 'optional@example.com',
            'message' => 'Hello without phone/org',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'new');

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'optional@example.com',
            'phone' => null,
            'organization' => null,
        ]);

        $this->withHeader('X-Locale', 'ar')
            ->postJson('/api/v1/contact-messages', [
                'full_name' => 'عميل',
                'email' => 'ar@example.com',
                'message' => 'مرحبا',
            ])
            ->assertCreated()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'تم إرسال رسالتك بنجاح.');
    }

    public function test_contact_rate_limiter_is_attached_to_public_route(): void
    {
        $route = Route::getRoutes()->getByName('api.v1.contact-messages.store');

        $this->assertNotNull($route);
        $this->assertTrue(collect($route->gatherMiddleware())->contains('throttle:contact'));
    }

    public function test_admin_authorization_boundaries(): void
    {
        $message = ContactMessage::factory()->create();

        $this->getJson('/api/v1/admin/contact-messages')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/admin/contact-messages')->assertForbidden();
        $this->getJson('/api/v1/admin/contact-messages/'.$message->id)->assertForbidden();
        $this->patchJson('/api/v1/admin/contact-messages/'.$message->id.'/status', [
            'status' => 'read',
        ])->assertForbidden();
        $this->deleteJson('/api/v1/admin/contact-messages/'.$message->id)->assertForbidden();

        $message->delete();
        $this->postJson('/api/v1/admin/contact-messages/'.$message->id.'/restore')->assertForbidden();

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/v1/admin/contact-messages')->assertOk();
    }

    public function test_admin_list_filters_sorting_and_pagination(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        ContactMessage::factory()->create([
            'full_name' => 'Alpha Person',
            'email' => 'alpha@example.com',
            'organization' => 'Alpha Org',
            'message' => 'Need media training',
            'created_at' => now()->subDays(2),
        ]);
        $read = ContactMessage::factory()->status(ContactMessageStatus::Read)->create([
            'full_name' => 'Beta Person',
            'email' => 'beta@example.com',
            'organization' => 'Beta Org',
            'message' => 'General inquiry',
            'created_at' => now()->subDay(),
        ]);
        $trashed = ContactMessage::factory()->create([
            'email' => 'gone@example.com',
        ]);
        $trashed->delete();

        $list = $this->getJson('/api/v1/admin/contact-messages?per_page=15')->assertOk();
        $emails = collect($list->json('data'))->pluck('email')->all();
        $this->assertContains('alpha@example.com', $emails);
        $this->assertContains('beta@example.com', $emails);
        $this->assertNotContains('gone@example.com', $emails);
        $this->assertSame(15, $list->json('meta.per_page'));
        $this->assertSame('beta@example.com', $list->json('data.0.email'));

        $this->getJson('/api/v1/admin/contact-messages?search=Alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?search=beta@example.com')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?search=Beta Org')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?search=media')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?status=read')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $read->id);

        $this->getJson('/api/v1/admin/contact-messages?email=alpha@example.com')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?organization=Alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?created_from='.now()->subDay()->toDateString())
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?created_to='.now()->subDays(2)->toDateString())
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages?created_from='.now()->toDateString().'&created_to='.now()->subDays(3)->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['created_from']);

        $this->getJson('/api/v1/admin/contact-messages?sort=password')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sort']);

        $this->getJson('/api/v1/admin/contact-messages?per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_admin_details_do_not_auto_change_status(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $message = ContactMessage::factory()->create([
            'message' => 'Full body content',
        ]);

        $this->getJson('/api/v1/admin/contact-messages/'.$message->id)
            ->assertOk()
            ->assertJsonPath('data.message', 'Full body content')
            ->assertJsonPath('data.status', 'new')
            ->assertJsonMissingPath('data.deleted_at');

        $message->refresh();
        $this->assertSame(ContactMessageStatus::New, $message->status);

        $message->delete();
        $this->getJson('/api/v1/admin/contact-messages/'.$message->id)->assertNotFound();
    }

    public function test_admin_can_update_status_through_lifecycle(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $message = ContactMessage::factory()->create();

        $this->patchJson('/api/v1/admin/contact-messages/'.$message->id.'/status', [
            'status' => 'read',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'read')
            ->assertJsonPath('message', 'Contact message marked as read.');

        $this->patchJson('/api/v1/admin/contact-messages/'.$message->id.'/status', [
            'status' => 'replied',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'replied');

        $this->withHeader('X-Locale', 'ar')
            ->patchJson('/api/v1/admin/contact-messages/'.$message->id.'/status', [
                'status' => 'closed',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'closed')
            ->assertJsonPath('message', 'تم تعليم رسالة التواصل كمغلق.');

        $originalName = $message->full_name;

        $this->patchJson('/api/v1/admin/contact-messages/'.$message->id.'/status', [
            'status' => 'invalid',
        ])->assertUnprocessable()->assertJsonValidationErrors(['status']);

        $message->refresh();
        $this->assertSame($originalName, $message->full_name);
        $this->assertSame(ContactMessageStatus::Closed, $message->status);
    }

    public function test_admin_soft_delete_and_restore_preserves_status(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $message = ContactMessage::factory()->status(ContactMessageStatus::Replied)->create([
            'email' => 'restore@example.com',
        ]);

        $this->deleteJson('/api/v1/admin/contact-messages/'.$message->id)
            ->assertOk()
            ->assertJsonPath('message', 'Contact message deleted successfully.');

        $this->assertSoftDeleted('contact_messages', ['id' => $message->id]);

        $list = $this->getJson('/api/v1/admin/contact-messages')->assertOk();
        $this->assertNotContains('restore@example.com', collect($list->json('data'))->pluck('email')->all());
        $this->getJson('/api/v1/admin/contact-messages/'.$message->id)->assertNotFound();

        $this->postJson('/api/v1/admin/contact-messages/'.$message->id.'/restore')
            ->assertOk()
            ->assertJsonPath('data.email', 'restore@example.com')
            ->assertJsonPath('data.status', 'replied');

        $this->postJson('/api/v1/admin/contact-messages/999999/restore')->assertNotFound();

        $live = ContactMessage::factory()->create();
        $this->postJson('/api/v1/admin/contact-messages/'.$live->id.'/restore')->assertNotFound();
    }

    public function test_only_approved_contact_message_routes_exist(): void
    {
        $routes = collect(Route::getRoutes())->filter(
            fn ($route) => str_contains($route->uri(), 'contact-messages'),
        );

        $expected = [
            'api/v1/contact-messages' => ['POST'],
            'api/v1/admin/contact-messages' => ['GET'],
            'api/v1/admin/contact-messages/{contactMessage}' => ['GET', 'DELETE'],
            'api/v1/admin/contact-messages/{contactMessage}/status' => ['PATCH'],
            'api/v1/admin/contact-messages/{id}/restore' => ['POST'],
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
        $this->assertFalse(collect($uris)->contains(fn ($uri) => str_contains($uri, 'reply')
            || str_contains($uri, 'email')
            || str_contains($uri, 'attachment')
            || str_contains($uri, 'bulk')
            || str_contains($uri, 'force')));
    }

    public function test_contact_messages_schema_columns_unchanged(): void
    {
        $columns = collect(Schema::getColumnListing('contact_messages'))->sort()->values()->all();

        $this->assertSame([
            'created_at',
            'deleted_at',
            'email',
            'full_name',
            'id',
            'message',
            'organization',
            'phone',
            'status',
            'updated_at',
        ], $columns);
    }
}
