<?php

declare(strict_types=1);

namespace Tests\Feature\Chatbot;

use App\Enums\ChatConversationStatus;
use App\Enums\ChatSender;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\InteractsWithFeatureFlags;
use Tests\TestCase;

final class ChatbotApiTest extends TestCase
{
    use InteractsWithFeatureFlags;
    use RefreshDatabase;

    private ?string $previousFeatureValue = null;

    protected function setUp(): void
    {
        $this->previousFeatureValue = getenv(
            'FEATURE_CHATBOT_ENABLED'
        ) ?: null;

        $this->setFeatureFlagEnv('FEATURE_CHATBOT_ENABLED', 'true');

        parent::setUp();
    }

    protected function tearDown(): void
    {
        $this->restoreFeatureFlagEnv(
            'FEATURE_CHATBOT_ENABLED',
            $this->previousFeatureValue,
        );

        parent::tearDown();
    }

    public function test_guest_can_start_anonymous_conversation(): void
    {
        $response = $this->postJson(
            '/api/v1/chatbot/conversations',
            [],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'message',
                'Conversation started.',
            )
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.visitor_name', null)
            ->assertJsonPath('data.messages', [])
            ->assertJsonStructure([
                'data' => [
                    'conversation_token',
                    'status',
                    'visitor_name',
                    'messages',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.user_id')
            ->assertJsonMissingPath('data.visitor_email')
            ->assertJsonMissingPath('data.deleted_at');

        $this->assertSame(
            1,
            ChatConversation::query()->count(),
        );

        $conversation = ChatConversation::query()->firstOrFail();

        $this->assertNull($conversation->user_id);
        $this->assertNull($conversation->visitor_name);
        $this->assertNull($conversation->visitor_email);
        $this->assertSame(
            ChatConversationStatus::Open,
            $conversation->status,
        );
    }

    public function test_guest_identity_is_optional_and_email_is_normalized(): void
    {
        $this->postJson(
            '/api/v1/chatbot/conversations',
            [
                'visitor_name' => '  Jane Visitor  ',
                'visitor_email' => '  JANE@EXAMPLE.COM  ',
            ],
        )->assertCreated()
            ->assertJsonPath(
                'data.visitor_name',
                'Jane Visitor',
            );

        $conversation = ChatConversation::query()->firstOrFail();

        $this->assertSame(
            'Jane Visitor',
            $conversation->visitor_name,
        );

        $this->assertSame(
            'jane@example.com',
            $conversation->visitor_email,
        );
    }

    public function test_guest_can_send_and_read_messages_with_token(): void
    {
        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
            [
                'visitor_name' => 'Visitor',
            ],
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        $this->assertNotSame('', $token);

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => '  What services do you offer?  ',
            ],
        )
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'message',
                'Message received.',
            )
            ->assertJsonPath(
                'data.message.sender',
                'visitor',
            )
            ->assertJsonPath(
                'data.message.message',
                'What services do you offer?',
            )
            ->assertJsonPath(
                'data.reply.sender',
                'bot',
            )
            ->assertJsonStructure([
                'data' => [
                    'message' => ['sender', 'message', 'created_at'],
                    'reply' => ['sender', 'message', 'created_at'],
                ],
            ])
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.message.id')
            ->assertJsonMissingPath('data.message.conversation_id')
            ->assertJsonMissingPath('data.reply.id')
            ->assertJsonMissingPath('data.reply.conversation_id');

        $visitorMessage = ChatMessage::query()
            ->where('sender', ChatSender::Visitor)
            ->firstOrFail();

        $this->assertSame(
            'What services do you offer?',
            $visitorMessage->message,
        );

        $botMessage = ChatMessage::query()
            ->where('sender', ChatSender::Bot)
            ->firstOrFail();

        $this->assertNotSame('', trim($botMessage->message));

        $this->getJson(
            "/api/v1/chatbot/conversations/{$token}",
        )
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'data.messages.0.sender',
                'visitor',
            )
            ->assertJsonPath(
                'data.messages.0.message',
                'What services do you offer?',
            )
            ->assertJsonPath(
                'data.messages.1.sender',
                'bot',
            )
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.user_id');
    }

    public function test_authenticated_client_conversation_is_owned_by_user(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson(
            '/api/v1/chatbot/conversations',
            [
                'visitor_name' => 'Should Be Ignored',
                'visitor_email' => 'ignored@example.com',
            ],
        )->assertCreated();

        $token = (string) $response->json(
            'data.conversation_token',
        );

        $conversation = ChatConversation::query()->firstOrFail();

        $this->assertSame(
            $user->id,
            $conversation->user_id,
        );

        $this->assertNull($conversation->visitor_name);
        $this->assertNull($conversation->visitor_email);

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => 'Tell me about AI consulting.',
            ],
        )
            ->assertCreated()
            ->assertJsonPath(
                'data.message.sender',
                'client',
            )
            ->assertJsonPath(
                'data.reply.sender',
                'bot',
            );

        $this->assertSame(
            ChatSender::Client,
            ChatMessage::query()
                ->where('sender', ChatSender::Client)
                ->firstOrFail()
                ->sender,
        );

        $this->assertTrue(
            ChatMessage::query()
                ->where('sender', ChatSender::Bot)
                ->exists(),
        );
    }

    public function test_client_cannot_access_another_clients_conversation(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($owner);

        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        Sanctum::actingAs($other);

        $this->getJson(
            "/api/v1/chatbot/conversations/{$token}",
        )
            ->assertNotFound()
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_NOT_FOUND',
            );

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => 'Unauthorized message.',
            ],
        )
            ->assertNotFound()
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_NOT_FOUND',
            );

        $this->assertSame(
            0,
            ChatMessage::query()->count(),
        );
    }

    public function test_guest_cannot_access_client_conversation(): void
    {
        $owner = User::factory()->create();

        Sanctum::actingAs($owner);

        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        $this->app['auth']->forgetGuards();

        $this->getJson(
            "/api/v1/chatbot/conversations/{$token}",
        )
            ->assertNotFound()
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_NOT_FOUND',
            );
    }

    public function test_invalid_conversation_token_returns_generic_not_found(): void
    {
        $this->getJson(
            '/api/v1/chatbot/conversations/not-a-real-token',
        )
            ->assertNotFound()
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_NOT_FOUND',
            )
            ->assertJsonPath(
                'message',
                'Conversation not found.',
            );

        $this->postJson(
            '/api/v1/chatbot/conversations/not-a-real-token/messages',
            [
                'message' => 'Hello',
            ],
        )
            ->assertNotFound()
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_NOT_FOUND',
            );
    }

    public function test_closed_conversation_rejects_new_messages(): void
    {
        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        $conversation = ChatConversation::query()->firstOrFail();

        $conversation->status = ChatConversationStatus::Closed;
        $conversation->save();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => 'Hello?',
            ],
        )
            ->assertStatus(409)
            ->assertJsonPath(
                'error_code',
                'CHAT_CONVERSATION_CLOSED',
            );

        $this->assertSame(
            0,
            ChatMessage::query()->count(),
        );
    }

    public function test_chatbot_rejects_protected_fields(): void
    {
        $this->postJson(
            '/api/v1/chatbot/conversations',
            [
                'user_id' => 999,
                'status' => 'closed',
            ],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'user_id',
                'status',
            ]);

        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => 'Hello',
                'sender' => 'admin',
                'conversation_id' => 999,
            ],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'sender',
                'conversation_id',
            ]);
    }

    public function test_chatbot_validates_message_and_honeypot(): void
    {
        $start = $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $token = (string) $start->json(
            'data.conversation_token',
        );

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => '',
            ],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);

        $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages",
            [
                'message' => str_repeat('a', 2001),
            ],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);

        $this->postJson(
            '/api/v1/chatbot/conversations',
            [
                'website' => 'spam.example',
            ],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['website']);
    }

    public function test_chatbot_routes_use_chatbot_rate_limiter(): void
    {
        config()->set('api.rate_limits.chatbot', 2);

        $this->withServerVariables([
            'REMOTE_ADDR' => '203.0.113.55',
        ]);

        $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertCreated();

        $this->postJson(
            '/api/v1/chatbot/conversations',
        )->assertStatus(429);
    }
}
