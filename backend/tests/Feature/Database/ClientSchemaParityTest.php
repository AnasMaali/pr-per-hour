<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Enums\BookingStatus;
use App\Enums\ChatSender;
use App\Enums\UserRole;
use App\Features\Bookings\Models\Booking;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\Invoices\Models\Invoice;
use App\Features\Payments\Models\Payment;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Models\Service;
use App\Features\Users\Models\User;
use Database\Seeders\ServiceCategorySeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\Support\ClientSchemaManifest;
use Tests\TestCase;

final class ClientSchemaParityTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_nine_domain_tables_exist(): void
    {
        foreach (ClientSchemaManifest::domainTables() as $table) {
            $this->assertTrue(Schema::hasTable($table), "Missing domain table [{$table}]");
        }
    }

    public function test_unauthorized_domain_tables_do_not_exist(): void
    {
        foreach (ClientSchemaManifest::unauthorizedDomainTables() as $table) {
            $this->assertFalse(Schema::hasTable($table), "Unauthorized domain table exists [{$table}]");
        }
    }

    public function test_every_expected_column_exists_and_no_unauthorized_columns(): void
    {
        foreach (ClientSchemaManifest::columnsByTable() as $table => $expected) {
            $actual = Schema::getColumnListing($table);
            sort($actual);
            $sortedExpected = $expected;
            sort($sortedExpected);

            $this->assertSame(
                $sortedExpected,
                $actual,
                "Column set mismatch for [{$table}]",
            );

            foreach (ClientSchemaManifest::unauthorizedColumns() as $forbidden) {
                $this->assertNotContains(
                    $forbidden,
                    $actual,
                    "Unauthorized column [{$forbidden}] found on [{$table}]",
                );
            }
        }
    }

    public function test_user_email_is_unique(): void
    {
        User::factory()->create(['email' => 'unique@example.com']);

        $this->expectException(QueryException::class);
        User::factory()->create(['email' => 'unique@example.com']);
    }

    public function test_category_and_service_slugs_are_unique(): void
    {
        ServiceCategory::factory()->create(['slug' => 'unique-category']);
        $this->expectException(QueryException::class);
        ServiceCategory::factory()->create(['slug' => 'unique-category']);
    }

    public function test_service_slug_is_unique(): void
    {
        Service::factory()->create(['slug' => 'unique-service']);
        $this->expectException(QueryException::class);
        Service::factory()->create(['slug' => 'unique-service']);
    }

    public function test_invoice_number_and_booking_id_are_unique(): void
    {
        $booking = Booking::factory()->create();
        Invoice::factory()->create([
            'booking_id' => $booking->id,
            'invoice_number' => 'INV-UNIQUE-1',
        ]);

        $this->expectException(QueryException::class);
        Invoice::factory()->create([
            'booking_id' => Booking::factory()->create()->id,
            'invoice_number' => 'INV-UNIQUE-1',
        ]);
    }

    public function test_invoice_booking_id_is_unique(): void
    {
        $booking = Booking::factory()->create();
        Invoice::factory()->create([
            'booking_id' => $booking->id,
            'invoice_number' => 'INV-BOOKING-1',
        ]);

        $this->expectException(QueryException::class);
        Invoice::factory()->create([
            'booking_id' => $booking->id,
            'invoice_number' => 'INV-BOOKING-2',
        ]);
    }

    public function test_user_service_and_booking_relationships_work(): void
    {
        $user = User::factory()->create();
        $category = ServiceCategory::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'service_id' => $service->id,
        ]);

        $this->assertTrue($user->bookings->contains($booking));
        $this->assertTrue($service->category->is($category));
        $this->assertTrue($booking->user->is($user));
        $this->assertTrue($booking->service->is($service));
    }

    public function test_payment_and_invoice_booking_relationships_work(): void
    {
        $booking = Booking::factory()->create();
        $payment = Payment::factory()->create(['booking_id' => $booking->id]);
        $invoice = Invoice::factory()->create(['booking_id' => $booking->id]);

        $this->assertTrue($payment->booking->is($booking));
        $this->assertTrue($invoice->booking->is($booking));
        $this->assertTrue($booking->payments->contains($payment));
        $this->assertTrue($booking->invoice->is($invoice));
    }

    public function test_chat_conversation_nullable_user_and_message_cascade(): void
    {
        $conversation = ChatConversation::factory()->create(['user_id' => null]);
        $message = ChatMessage::factory()->create(['conversation_id' => $conversation->id]);

        $this->assertNull($conversation->user);
        $this->assertTrue($conversation->messages->contains($message));

        $conversation->delete();
        // Soft delete conversation should not cascade-delete messages via Eloquent soft delete.
        // SQL ON DELETE CASCADE applies to hard deletes.
        $this->assertDatabaseHas('chat_messages', ['id' => $message->id]);

        $conversation->forceDelete();
        $this->assertDatabaseMissing('chat_messages', ['id' => $message->id]);
    }

    public function test_model_enum_casts_work(): void
    {
        $user = User::factory()->admin()->create();
        $booking = Booking::factory()->confirmed()->create();
        $message = ChatMessage::factory()->create(['sender' => ChatSender::Bot]);

        $this->assertSame(UserRole::Admin, $user->role);
        $this->assertSame(BookingStatus::Confirmed, $booking->status);
        $this->assertSame(ChatSender::Bot, $message->sender);
    }

    public function test_soft_deletes_only_where_deleted_at_exists(): void
    {
        $user = User::factory()->create();
        $user->delete();
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        $contact = ContactMessage::factory()->create();
        $contact->delete();
        $this->assertSoftDeleted('contact_messages', ['id' => $contact->id]);

        $this->assertFalse(in_array('SoftDeletes', class_uses_recursive(ChatMessage::class), true));
        $this->assertFalse(Schema::hasColumn('chat_messages', 'deleted_at'));
    }

    public function test_category_seeder_is_idempotent_and_seeds_exactly_three(): void
    {
        $this->seed(ServiceCategorySeeder::class);
        $this->seed(ServiceCategorySeeder::class);

        $this->assertSame(3, ServiceCategory::query()->count());
        $this->assertSame(
            [
                'strategic-communication',
                'public-relations-campaigns',
                'training-capacity-building',
            ],
            ServiceCategory::query()->orderBy('id')->pluck('slug')->all(),
        );
    }

    public function test_production_seeder_creates_no_operational_records(): void
    {
        $this->seed(ServiceCategorySeeder::class);

        $this->assertSame(0, Booking::query()->count());
        $this->assertSame(0, Payment::query()->count());
        $this->assertSame(0, Invoice::query()->count());
        $this->assertSame(0, ChatConversation::query()->count());
        $this->assertSame(0, ChatMessage::query()->count());
        $this->assertSame(0, ContactMessage::query()->count());
        $this->assertSame(0, Service::query()->count());
    }

    public function test_user_model_supports_email_verified_at_without_remember_token(): void
    {
        $this->assertTrue(Schema::hasColumn('users', 'email_verified_at'));
        $this->assertFalse(Schema::hasColumn('users', 'remember_token'));
        $this->assertTrue(Schema::hasTable('one_time_codes'));

        $user = User::factory()->create([
            'email' => 'verified-column@example.com',
            'email_verified_at' => now(),
        ]);

        $this->assertNotNull($user->fresh()?->email_verified_at);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'verified-column@example.com',
        ]);
    }

    public function test_important_defaults_are_applied(): void
    {
        $user = User::factory()->create();
        $this->assertSame(UserRole::Client, $user->role);

        $booking = Booking::factory()->create();
        $this->assertSame(BookingStatus::Pending, $booking->fresh()->status);

        $category = ServiceCategory::factory()->create();
        $this->assertTrue($category->is_active);
    }
}
