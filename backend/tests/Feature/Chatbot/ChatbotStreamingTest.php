<?php

declare(strict_types=1);

namespace Tests\Feature\Chatbot;

use App\Enums\ChatConversationStatus;
use App\Enums\ChatSender;
use App\Features\Chatbot\Contracts\GroqStreamTransport;
use App\Features\Chatbot\Models\ChatConversation;
use App\Features\Chatbot\Models\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\FakeGroqStreamTransport;
use Tests\Support\InteractsWithFeatureFlags;
use Tests\TestCase;

final class ChatbotStreamingTest extends TestCase
{
    use InteractsWithFeatureFlags;
    use RefreshDatabase;

    private ?string $previousFeatureValue = null;

    private FakeGroqStreamTransport $transport;

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

    private function configureGroq(): void
    {
        config()->set('chatbot.ai.driver', 'groq');
        config()->set('chatbot.groq.api_key', 'test-secret-key');
        config()->set('chatbot.groq.base_url', 'https://api.groq.test/openai/v1');
        config()->set('chatbot.ai.model', 'test-model-x');
        config()->set('chatbot.ai.max_output_tokens', 321);
        config()->set('chatbot.ai.timeout_seconds', 5);
    }

    /**
     * @param  list<string>  $contentDeltas
     * @param  list<int>  $delayMicrosecondsBeforeChunk  optional per-chunk
     *         delay, parallel to $contentDeltas, to simulate genuine
     *         upstream pacing in timing-sensitive tests
     */
    private function fakeGroqStream(array $contentDeltas, array $delayMicrosecondsBeforeChunk = []): void
    {
        $chunks = [];

        foreach ($contentDeltas as $delta) {
            $chunks[] = 'data: '.json_encode(
                ['choices' => [['delta' => ['content' => $delta]]]],
                JSON_UNESCAPED_UNICODE,
            )."\n\n";
        }

        $chunks[] = "data: [DONE]\n\n";

        $this->transport = new FakeGroqStreamTransport($chunks, $delayMicrosecondsBeforeChunk);
        $this->app->instance(GroqStreamTransport::class, $this->transport);
    }

    private function fakeGroqStreamFailure(int $status): void
    {
        $this->transport = new FakeGroqStreamTransport([], status: $status, succeeded: true);
        $this->app->instance(GroqStreamTransport::class, $this->transport);
    }

    private function startConversation(): string
    {
        $response = $this->postJson(
            '/api/v1/chatbot/conversations',
            [],
        )->assertCreated();

        return (string) $response->json('data.conversation_token');
    }

    /**
     * @return list<array{event: string, data: array<string, mixed>}>
     */
    private function parseSseEvents(string $raw): array
    {
        $events = [];

        foreach (explode("\n\n", trim($raw)) as $block) {
            if (trim($block) === '') {
                continue;
            }

            $event = null;
            $data = null;

            foreach (explode("\n", $block) as $line) {
                if (str_starts_with($line, 'event:')) {
                    $event = trim(substr($line, 6));
                } elseif (str_starts_with($line, 'data:')) {
                    $data = json_decode(trim(substr($line, 5)), true);
                }
            }

            if ($event !== null) {
                $events[] = ['event' => $event, 'data' => $data ?? []];
            }
        }

        return $events;
    }

    public function test_streaming_route_requires_a_valid_conversation_token(): void
    {
        $this->configureGroq();

        $response = $this->postJson(
            '/api/v1/chatbot/conversations/not-a-real-token/messages/stream',
            ['message' => 'Hello'],
        );

        $response->assertStatus(404)->assertJsonPath('error_code', 'CHAT_CONVERSATION_NOT_FOUND');
    }

    public function test_streaming_route_rejects_a_closed_conversation(): void
    {
        $this->configureGroq();
        $token = $this->startConversation();

        $conversation = ChatConversation::query()->firstOrFail();
        $conversation->status = ChatConversationStatus::Closed;
        $conversation->save();

        $response = $this->postJson(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );

        $response->assertStatus(409)->assertJsonPath('error_code', 'CHAT_CONVERSATION_CLOSED');
    }

    public function test_dashboard_realtime_streaming_answer_bypasses_groq_transport(): void
    {
        $this->configureGroq();

        $this->fakeGroqStream([
            'THIS EXTERNAL REALTIME ANSWER MUST NEVER BE USED.',
        ]);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            [
                'message' =>
                    'هل اللوحة بتكون real-time؟',
            ],
        );

        $events = $this->parseSseEvents(
            $response->streamedContent(),
        );

        $this->assertSame(
            0,
            $this->transport->callCount,
        );

        $visible = '';

        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $visible .= (string) (
                    $event['data']['content']
                    ?? ''
                );
            }
        }

        $this->assertStringContainsString(
            'مصدر البيانات',
            $visible,
        );

        $this->assertStringContainsString(
            'آلية الربط',
            $visible,
        );

        $this->assertStringNotContainsString(
            'THIS EXTERNAL REALTIME ANSWER',
            $visible,
        );

        $done = end($events);

        $this->assertSame(
            'done',
            $done['event'],
        );

        $this->assertStringContainsString(
            'Dashboards & Decision Support',
            $done['data']['message']['message'],
        );
    }

    public function test_authoritative_streaming_answer_bypasses_groq_transport(): void
    {
        $this->configureGroq();

        // Deliberately register a transport that would produce the wrong
        // answer if called. The authoritative fast-path must leave callCount
        // at zero.
        $this->fakeGroqStream([
            'THIS EXTERNAL RESPONSE MUST NEVER BE USED.',
        ]);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'مين المؤسس؟'],
        );

        $events = $this->parseSseEvents(
            $response->streamedContent(),
        );

        $this->assertSame(
            0,
            $this->transport->callCount,
        );

        $rawVisible = '';
        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $rawVisible .= (string) (
                    $event['data']['content'] ?? ''
                );
            }
        }

        $this->assertStringContainsString(
            'فاتنة معالي',
            $rawVisible,
        );

        $this->assertStringNotContainsString(
            'THIS EXTERNAL RESPONSE',
            $rawVisible,
        );

        $done = end($events);

        $this->assertSame(
            'done',
            $done['event'],
        );

        $this->assertStringContainsString(
            'المؤسس والمستشار الرئيسي',
            $done['data']['message']['message'],
        );
    }

    public function test_visitor_message_persists_before_generation_and_the_stream_emits_start_delta_and_done(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['Thanks for reaching out ', 'to PR Per Hour!']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );

        $response->assertOk();
        $events = $this->parseSseEvents($response->streamedContent());
        $eventNames = array_column($events, 'event');

        $this->assertSame('start', $eventNames[0]);
        $this->assertContains('delta', $eventNames);
        $this->assertSame('done', end($eventNames));

        $this->assertTrue(
            ChatMessage::query()->where('sender', ChatSender::Visitor)->exists(),
            'The visitor message must be persisted.',
        );

        $doneEvent = end($events);
        $this->assertSame('Thanks for reaching out to PR Per Hour!', $doneEvent['data']['message']['message']);

        $botMessage = ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail();
        $this->assertSame('Thanks for reaching out to PR Per Hour!', $botMessage->message);

        $this->assertSame(1, $this->transport->callCount);
    }

    public function test_final_bot_message_is_persisted_exactly_once(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['One reply, split across a few. ', 'Delta fragments arriving. ', 'From Groq.']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );
        $response->assertOk();
        // A StreamedResponse's callback only actually executes once its
        // content is consumed — streamedContent() is what does that in a
        // test (assertOk() alone checks only the status line).
        $response->streamedContent();

        $this->assertSame(1, ChatMessage::query()->where('sender', ChatSender::Bot)->count());
        $this->assertSame(1, ChatMessage::query()->where('sender', ChatSender::Visitor)->count());
    }

    public function test_realtime_claim_is_softened_in_the_persisted_and_final_streamed_text(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['يمكن للإدارة متابعة المؤشرات بشكل لحظي.']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'شو ممكن نتابع الأداء؟'],
        );

        $events = $this->parseSseEvents($response->streamedContent());
        $doneEvent = end($events);
        $finalText = $doneEvent['data']['message']['message'];

        $this->assertStringNotContainsString('بشكل لحظي', $finalText);
        $this->assertStringContainsString('آلية تحديث', $finalText);

        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $this->assertStringNotContainsString('بشكل لحظي', $event['data']['content']);
            }
        }

        $botMessage = ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail();
        $this->assertSame($finalText, $botMessage->message);
    }

    public function test_canonical_name_corruption_is_normalized_in_the_streamed_output(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['مسؤول التكنولوجيا هو أناس مالي.']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'احكيلي عن خبرات فريق PR Per Hour بشكل عام.'],
        );

        $events = $this->parseSseEvents($response->streamedContent());
        $doneEvent = end($events);
        $finalText = $doneEvent['data']['message']['message'];

        $this->assertStringContainsString('أنس معالي', $finalText);
        $this->assertStringNotContainsString('أناس مالي', $finalText);

        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $this->assertStringNotContainsString('أناس مالي', $event['data']['content']);
            }
        }
    }

    public function test_mixed_script_corruption_never_reaches_streamed_output(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['This is a great cepвис for your business.']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );

        $events = $this->parseSseEvents($response->streamedContent());

        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $this->assertStringNotContainsString('cepвис', $event['data']['content']);
            }
        }

        $doneEvent = end($events);
        $this->assertStringNotContainsString('cepвис', $doneEvent['data']['message']['message']);
        $this->assertStringContainsString('service', $doneEvent['data']['message']['message']);
    }

    public function test_provider_failure_before_any_content_uses_local_fallback_with_no_delta_events(): void
    {
        $this->configureGroq();
        $this->fakeGroqStreamFailure(500);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );

        $response->assertOk();
        $events = $this->parseSseEvents($response->streamedContent());
        $eventNames = array_column($events, 'event');

        $this->assertSame('start', $eventNames[0]);
        $this->assertSame('done', end($eventNames));

        $doneEvent = end($events);
        $this->assertNotEmpty($doneEvent['data']['message']['message']);

        $this->assertSame(1, ChatMessage::query()->where('sender', ChatSender::Bot)->count());
        $this->assertSame(1, $this->transport->callCount);
    }

    public function test_stream_never_exposes_provider_or_internal_details(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream(['Thanks for reaching out to PR Per Hour!']);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );

        $raw = $response->streamedContent();

        foreach ([
            'Groq',
            'test-secret-key',
            'test-model-x',
            'quality',
            'issues',
            'accepted',
            'ChatProviderException',
            'conversation_id',
            'user_id',
            'fallback_used',
        ] as $forbidden) {
            $this->assertStringNotContainsString($forbidden, $raw);
        }
    }

    public function test_mid_stream_failure_inside_think_block_never_leaks_reasoning(): void
    {
        $this->configureGroq();

        $chunks = [
            'data: '.json_encode(
                ['choices' => [['delta' => ['content' => 'Safe visible answer. ']]]],
                JSON_UNESCAPED_UNICODE,
            )."\n\n",
            'data: '.json_encode(
                ['choices' => [['delta' => [
                    'content' => '<think>SECRET INTERNAL REASONING. Still thinking',
                ]]]],
                JSON_UNESCAPED_UNICODE,
            )."\n\n",
        ];

        $this->transport = new FakeGroqStreamTransport(
            chunks: $chunks,
            status: 0,
            succeeded: false,
            error: 'Simulated connection loss.',
        );

        $this->app->instance(
            GroqStreamTransport::class,
            $this->transport,
        );

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Tell me about your services.'],
        );

        $raw = $response->streamedContent();
        $events = $this->parseSseEvents($raw);

        $this->assertStringNotContainsString(
            'SECRET INTERNAL REASONING',
            $raw,
        );

        $this->assertStringNotContainsString(
            '<think>',
            $raw,
        );

        $doneEvent = end($events);

        $this->assertIsArray($doneEvent);
        $this->assertSame('done', $doneEvent['event']);
        $this->assertSame(
            'Safe visible answer.',
            $doneEvent['data']['message']['message'],
        );

        $botMessage = ChatMessage::query()
            ->where('sender', ChatSender::Bot)
            ->firstOrFail();

        $this->assertSame(
            'Safe visible answer.',
            $botMessage->message,
        );

        $this->assertStringNotContainsString(
            'SECRET INTERNAL REASONING',
            $botMessage->message,
        );
    }

    // -----------------------------------------------------------------
    // Monotonic output invariant: once a delta is visible, later
    // processing must never need to change its semantic content. See
    // SafeStreamChunker for the lookbehind that makes this true.
    // -----------------------------------------------------------------

    public function test_concatenated_visible_deltas_equal_the_final_persisted_message_for_a_normal_stream(): void
    {
        $this->configureGroq();
        $this->fakeGroqStream([
            'أنسب نقطة بداية هي ',
            '**Data Analysis & Business Intelligence**. ',
            'يمكن للتحليل أن يساعد في تحديد الأنماط.',
        ]);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'شو الخدمة الأنسب؟'],
        );

        $events = $this->parseSseEvents($response->streamedContent());

        $concatenatedDeltas = '';
        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                $concatenatedDeltas .= $event['data']['content'];
            }
        }

        $doneEvent = end($events);
        $finalText = $doneEvent['data']['message']['message'];

        $this->assertSame($finalText, $concatenatedDeltas);

        $botMessage = ChatMessage::query()->where('sender', ChatSender::Bot)->firstOrFail();
        $this->assertSame($finalText, $botMessage->message);
    }

    public function test_a_realtime_claim_split_across_groq_deltas_is_never_visible_before_correction_even_past_the_safety_valve(): void
    {
        $this->configureGroq();

        // Padding forces the safety valve to consider a cut before "بشكل"
        // has a chance to be followed by "لحظي" in the same fragment —
        // exactly the scenario the lookbehind protects against, exercised
        // through the real Groq SSE parsing path (not just the chunker
        // in isolation).
        $padding = str_repeat('كلمة ', 60);

        $this->fakeGroqStream([
            $padding.'يمكن متابعة المؤشرات بشكل ',
            'لحظي. ',
            'وهذا مفيد جدا لفريق العمل.',
        ]);

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'شو ممكن نتابع الأداء؟'],
        );

        $events = $this->parseSseEvents($response->streamedContent());

        $concatenatedDeltas = '';
        foreach ($events as $event) {
            if ($event['event'] === 'delta') {
                // The specific assertion the whole lookbehind exists for:
                // this exact substring must never appear in ANY single
                // delta, not even transiently.
                $this->assertStringNotContainsString('بشكل لحظي', $event['data']['content']);
                $concatenatedDeltas .= $event['data']['content'];
            }
        }

        // Nor across the concatenation of everything shown so far at any
        // point — i.e. it was never split so as to only "look" combined
        // once later text arrived.
        $this->assertStringNotContainsString('بشكل لحظي', $concatenatedDeltas);
        $this->assertStringContainsString('آلية تحديث', $concatenatedDeltas);

        $doneEvent = end($events);
        $finalText = $doneEvent['data']['message']['message'];

        // The done event does not need to *repair* anything — it matches
        // what was already visible.
        $this->assertSame($finalText, $concatenatedDeltas);
    }

    // -----------------------------------------------------------------
    // Transport timing: proves upstream fragment gaps are observable
    // downstream (as separate SSE-frame flushes) BEFORE "done" is
    // emitted, end to end through HandleStreamingChatTurn's own
    // buffering (SafeStreamChunker, emit()'s ob_flush()/flush()) — not
    // just that the raw transport is incremental in isolation (see
    // CurlGroqStreamTransportTest for that).
    // -----------------------------------------------------------------

    public function test_upstream_fragment_delays_are_observable_downstream_before_the_done_event(): void
    {
        $this->configureGroq();

        // 120ms gaps: comfortably distinguishable from "everything
        // arrived at once" under CI scheduling jitter, without making
        // the test slow.
        $delayMicroseconds = 120_000;

        $this->fakeGroqStream(
            ['First clause arrives. ', 'Second clause arrives. ', 'Third clause arrives.'],
            [0, $delayMicroseconds, $delayMicroseconds],
        );

        $token = $this->startConversation();

        $response = $this->post(
            "/api/v1/chatbot/conversations/{$token}/messages/stream",
            ['message' => 'Hello'],
        );
        $response->assertOk();

        // Mirrors TestResponse::streamedContent()'s own mechanism (see
        // vendor Illuminate\Testing\TestResponse), except each flushed
        // buffer is timestamped instead of only concatenated — proving
        // WHEN each SSE frame was actually flushed, not just what the
        // final concatenated content was.
        $timedChunks = [];
        ob_start(function (string $buffer) use (&$timedChunks): string {
            if ($buffer !== '') {
                $timedChunks[] = ['t' => microtime(true), 'buffer' => $buffer];
            }

            return '';
        });
        $response->sendContent();
        ob_end_clean();

        $this->assertNotEmpty($timedChunks, 'The streamed response produced no output.');

        $raw = implode('', array_column($timedChunks, 'buffer'));
        $events = $this->parseSseEvents($raw);
        $this->assertContains('done', array_column($events, 'event'));

        $firstDeltaAt = null;
        $doneAt = null;

        foreach ($timedChunks as $chunk) {
            if ($firstDeltaAt === null && str_contains($chunk['buffer'], 'event: delta')) {
                $firstDeltaAt = $chunk['t'];
            }

            if (str_contains($chunk['buffer'], 'event: done')) {
                $doneAt = $chunk['t'];
            }
        }

        $this->assertNotNull($firstDeltaAt, 'No delta event chunk was observed.');
        $this->assertNotNull($doneAt, 'No done event chunk was observed.');

        // Two configured 120ms delays mean at least ~240ms genuinely
        // separates the first observable delta from "done" if delivery
        // is truly incremental. A generous 100ms floor absorbs CI
        // scheduling jitter while still catching the "one final burst"
        // regression this test exists for: a transport (or a buggy
        // rewrite of it) that only surfaces content once the whole
        // upstream response is in would show this gap as ~0 regardless
        // of the configured delays.
        $this->assertGreaterThan(
            0.1,
            $doneAt - $firstDeltaAt,
            'The first delta and the done event were flushed too close together — upstream fragment delays were '.
            'not observable downstream before completion. A test that only inspects content after streaming ends '.
            'would not catch this.',
        );
    }
}
