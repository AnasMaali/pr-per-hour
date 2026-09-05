<?php

declare(strict_types=1);

namespace Tests\Feature\Chatbot;

use App\Enums\ChatSender;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\Support\InteractsWithFeatureFlags;
use Tests\TestCase;

final class ChatbotAiProviderTest extends TestCase
{
    use InteractsWithFeatureFlags;
    use RefreshDatabase;

    private ?string $previousFeatureValue = null;

    protected function setUp(): void
    {
        $this->previousFeatureValue = getenv('FEATURE_CHATBOT_ENABLED') ?: null;

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

    private function configureGroq(int $historyLimit = 3): void
    {
        config()->set('chatbot.ai.driver', 'groq');
        config()->set('chatbot.groq.api_key', 'test-secret-key');
        config()->set('chatbot.groq.base_url', 'https://api.groq.test/openai/v1');
        config()->set('chatbot.ai.model', 'test-model-x');
        config()->set('chatbot.ai.max_output_tokens', 321);
        config()->set('chatbot.ai.history_messages', $historyLimit);
        config()->set('chatbot.ai.timeout_seconds', 5);
    }

    private function startConversation(array $payload = []): array
    {
        $response = $this->postJson(
            '/api/v1/chatbot/conversations',
            $payload,
        )->assertCreated();

        return [
            'token' => (string) $response->json('data.conversation_token'),
        ];
    }

    public function test_groq_provider_receives_system_prompt_bounded_history_and_correct_request_shape(): void
    {
        $this->configureGroq(historyLimit: 2);

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'Here is how PR Per Hour can help.']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation([
            'visitor_name' => 'Jane Visitor',
            'visitor_email' => 'jane@example.com',
        ]);

        $conversation = ChatConversation::query()->firstOrFail();

        // Seed older messages so the history window (limit = 2) must be bounded:
        // the oldest one below is expected to fall outside the window.
        ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'sender' => ChatSender::Visitor,
            'message' => 'OLD_MESSAGE_SHOULD_BE_EXCLUDED',
        ]);

        ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'sender' => ChatSender::Bot,
            'message' => 'OLD_BOT_REPLY_SHOULD_BE_INCLUDED',
        ]);

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'What services do you offer?'],
        )->assertCreated();

        Http::assertSent(function (Request $request): bool {
            $body = $request->data();

            self::assertSame('Bearer test-secret-key', $request->header('Authorization')[0]);
            self::assertSame('test-model-x', $body['model']);
            self::assertSame(321, $body['max_tokens']);
            self::assertSame('none', $body['reasoning_effort']);

            $messages = $body['messages'];

            self::assertSame('system', $messages[0]['role']);
            self::assertStringContainsString('PR Per Hour', $messages[0]['content']);
            self::assertStringContainsString('Anas', $messages[0]['content']);

            // history_messages = 2, so only the 2 most recent messages are sent:
            // the earlier visitor message falls outside the bounded window.
            $historyMessages = array_slice($messages, 1);
            self::assertCount(2, $historyMessages);

            self::assertSame('assistant', $historyMessages[0]['role']);
            self::assertSame('OLD_BOT_REPLY_SHOULD_BE_INCLUDED', $historyMessages[0]['content']);

            self::assertSame('user', $historyMessages[1]['role']);
            self::assertSame('What services do you offer?', $historyMessages[1]['content']);

            $raw = json_encode($body);
            self::assertStringNotContainsString('OLD_MESSAGE_SHOULD_BE_EXCLUDED', $raw);
            self::assertStringNotContainsString('Jane Visitor', $raw);
            self::assertStringNotContainsString('jane@example.com', $raw);

            return true;
        });
    }

    public function test_groq_success_returns_assistant_text_and_persists_bot_reply(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => '  Thanks for reaching out to PR Per Hour!  ']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $response
            ->assertJsonPath('data.message.sender', 'visitor')
            ->assertJsonPath('data.reply.sender', 'bot')
            ->assertJsonPath('data.reply.message', 'Thanks for reaching out to PR Per Hour!');

        $this->assertSame(
            'Thanks for reaching out to PR Per Hour!',
            ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail()->message,
        );

        // Exactly one external AI generation call per user turn.
        Http::assertSentCount(1);
    }

    public function test_missing_groq_api_key_falls_back_safely_and_keeps_visitor_message(): void
    {
        $this->configureGroq();
        config()->set('chatbot.groq.api_key', '');

        Http::fake();

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.reply.sender', 'bot');

        Http::assertNothingSent();

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Visitor)->exists(),
        );

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Bot)->exists(),
        );
    }

    public function test_groq_429_response_uses_fallback(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response(['error' => 'rate limited'], 429),
        ]);

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.reply.sender', 'bot');

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Bot)->exists(),
        );

        // A provider failure falls back locally — never a second HTTP call.
        Http::assertSentCount(1);
    }

    public function test_groq_500_response_uses_fallback(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response(['error' => 'server error'], 500),
        ]);

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.reply.sender', 'bot');

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Bot)->exists(),
        );
    }

    public function test_groq_connection_timeout_uses_fallback_and_keeps_visitor_message(): void
    {
        $this->configureGroq();

        Http::fake(function (): never {
            throw new ConnectionException('Connection timed out.');
        });

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.message.sender', 'visitor')
            ->assertJsonPath('data.reply.sender', 'bot');

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Visitor)->exists(),
        );

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Bot)->exists(),
        );
    }

    public function test_malformed_groq_payload_uses_fallback(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response(['unexpected' => 'shape'], 200),
        ]);

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.reply.sender', 'bot');

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Bot)->exists(),
        );
    }

    public function test_groq_response_with_blank_assistant_content_uses_fallback(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => '   ']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )
            ->assertCreated()
            ->assertJsonPath('data.reply.sender', 'bot');
    }

    public function test_groq_response_strips_think_reasoning_block_from_visible_content(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => [
                        'role' => 'assistant',
                        'content' => "<think>\nLet me plan the reply step by step...\n</think>\nThanks for reaching out to PR Per Hour!",
                    ]],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $response->assertJsonPath('data.reply.message', 'Thanks for reaching out to PR Per Hour!');

        $raw = $response->getContent();
        $this->assertIsString($raw);
        $this->assertStringNotContainsString('<think>', $raw);
        $this->assertStringNotContainsString('plan the reply', $raw);
    }

    public function test_groq_response_with_only_an_unclosed_think_block_uses_fallback(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => [
                        'role' => 'assistant',
                        'content' => '<think>Reasoning that got cut off before any real answer',
                    ]],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $response->assertJsonPath('data.reply.sender', 'bot');

        $raw = $response->getContent();
        $this->assertIsString($raw);
        $this->assertStringNotContainsString('<think>', $raw);
        $this->assertStringNotContainsString('Reasoning that got cut off', $raw);
    }

    public function test_closed_conversation_still_rejects_messages_when_ai_enabled(): void
    {
        $this->configureGroq();
        Http::fake();

        $start = $this->startConversation();

        $conversation = ChatConversation::query()->firstOrFail();
        $conversation->status = \App\Enums\ChatConversationStatus::Closed;
        $conversation->save();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello?'],
        )
            ->assertStatus(409)
            ->assertJsonPath('error_code', 'CHAT_CONVERSATION_CLOSED');

        Http::assertNothingSent();

        $this->assertSame(0, ChatMessage::query()->count());
    }

    public function test_response_never_exposes_internal_ids_or_provider_metadata(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'usage' => ['total_tokens' => 42],
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'Reply text.']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $response
            ->assertJsonMissingPath('data.message.id')
            ->assertJsonMissingPath('data.message.conversation_id')
            ->assertJsonMissingPath('data.message.user_id')
            ->assertJsonMissingPath('data.reply.id')
            ->assertJsonMissingPath('data.reply.conversation_id')
            ->assertJsonMissingPath('data.reply.provider')
            ->assertJsonMissingPath('data.reply.model')
            ->assertJsonMissingPath('data.reply.usage')
            ->assertJsonMissingPath('data.reply.fallback_used');

        $raw = $response->getContent();
        $this->assertIsString($raw);
        $this->assertStringNotContainsString('test-secret-key', $raw);
    }

    // -----------------------------------------------------------------
    // Response quality guard: exactly one AI call per turn, always
    // -----------------------------------------------------------------

    public function test_unsupported_realtime_claim_is_rewritten_deterministically_in_a_single_request(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'يمكن للإدارة متابعة المؤشرات بشكل لحظي.']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'شو ممكن نتابع الأداء؟'],
        )->assertCreated();

        $replyMessage = (string) $response->json('data.reply.message');

        $this->assertStringNotContainsString('بشكل لحظي', $replyMessage);
        $this->assertStringContainsString('آلية تحديث', $replyMessage);

        $this->assertSame(
            $replyMessage,
            ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail()->message,
        );

        // Deterministic rewrite happens in-process; never a second AI call.
        Http::assertSentCount(1);
    }

    public function test_mixed_latin_cyrillic_token_is_repaired_locally_in_a_single_request(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'هذا cepвис رائع لمساعدتك في تحليل بياناتك.']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'شو بتنصحني اعمل؟'],
        )->assertCreated();

        $replyMessage = (string) $response->json('data.reply.message');

        $this->assertStringNotContainsString('cepвис', $replyMessage);
        $this->assertStringContainsString('الخدمة', $replyMessage);

        $this->assertSame(
            $replyMessage,
            ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail()->message,
        );

        // Local token repair happens in-process; never a second AI call.
        Http::assertSentCount(1);
    }

    public function test_unrecoverable_unexpected_script_falls_back_locally_in_a_single_request(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'A στρατηγική analysis is what you need.']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $replyMessage = (string) $response->json('data.reply.message');

        // The safe local fallback reply, never the corrupted draft.
        $this->assertStringNotContainsString('στρατηγική', $replyMessage);
        $this->assertStringContainsString('PR Per Hour', $replyMessage);

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Visitor)->exists(),
        );

        $this->assertSame(
            $replyMessage,
            ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail()->message,
        );

        // No repair round-trip: the LLM is never asked to fix its own output.
        Http::assertSentCount(1);
    }

    public function test_fallback_may_greet_on_the_first_turn(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'مرحباً'],
        )->assertCreated();

        $this->assertStringContainsString(
            'أهلاً',
            (string) $response->json('data.reply.message'),
        );
    }

    public function test_fallback_does_not_greet_again_mid_conversation(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'مرحباً'],
        )->assertCreated();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'شو الخدمات المتوفرة؟'],
        )->assertCreated();

        $replyMessage = (string) $response->json('data.reply.message');

        $this->assertStringNotContainsString('أهلاً', $replyMessage);
        $this->assertStringContainsString('PR Per Hour', $replyMessage);

        // The visitor's messages from both turns are still persisted.
        $this->assertSame(
            2,
            ChatMessage::query()->where('sender', ChatSender::Visitor)->count(),
        );
    }

    public function test_english_fallback_does_not_greet_again_mid_conversation(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $start = $this->startConversation();

        $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'What services do you offer?'],
        )->assertCreated();

        $replyMessage = (string) $response->json('data.reply.message');

        $this->assertStringNotContainsString("Hi, I'm Anas", $replyMessage);
        $this->assertStringContainsString('PR Per Hour', $replyMessage);
    }

    public function test_public_api_response_never_exposes_quality_guard_diagnostics(): void
    {
        $this->configureGroq();

        Http::fake([
            'api.groq.test/*' => Http::response([
                'model' => 'test-model-x',
                'choices' => [
                    ['message' => ['role' => 'assistant', 'content' => 'Thanks for reaching out to PR Per Hour!']],
                ],
            ], 200),
        ]);

        $start = $this->startConversation();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$start['token']}/messages",
            ['message' => 'Hello'],
        )->assertCreated();

        $raw = $response->getContent();
        $this->assertIsString($raw);

        foreach (['issues', 'accepted', 'unexpected_script', 'unexpected_script_repaired', 'unsupported_realtime_claim', 'blank_response', 'quality'] as $forbidden) {
            $this->assertStringNotContainsString($forbidden, $raw);
        }
    }
}
