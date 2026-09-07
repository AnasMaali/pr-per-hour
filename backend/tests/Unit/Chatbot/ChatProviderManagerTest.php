<?php

declare(strict_types=1);

namespace Tests\Unit\Chatbot;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\Contracts\StreamingChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderMessage;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;
use App\Features\Chatbot\Exceptions\ChatProviderException;
use App\Features\Chatbot\Exceptions\PartialStreamChatProviderException;
use App\Features\Chatbot\Providers\ChatProviderManager;
use App\Features\Chatbot\Providers\FallbackChatProvider;
use App\Features\Chatbot\Providers\GroqChatProvider;
use App\Features\Chatbot\Support\AnasResponseQualityGuard;
use Illuminate\Container\Container;
use RuntimeException;
use Tests\TestCase;

/**
 * Exercises ChatProviderManager's last-resort emergency path — reached only
 * when FallbackChatProvider itself throws — in isolation from the real
 * application container. FallbackChatProvider is `final`, and HandleChatTurn
 * separately depends on the concrete class via constructor injection, so
 * rebinding FallbackChatProvider::class on the real app container (as a
 * Feature/HTTP test would need to) breaks unrelated container resolution.
 * A throwaway Container passed directly to a manually constructed
 * ChatProviderManager avoids that entirely.
 */
final class ChatProviderManagerTest extends TestCase
{
    private function requestWithHistory(ChatProviderMessage ...$history): ChatProviderRequest
    {
        return new ChatProviderRequest(
            systemPrompt: 'system prompt',
            history: $history,
            model: 'test-model',
            maxOutputTokens: 200,
            timeoutSeconds: 5,
        );
    }

    private function managerWithThrowingFallback(): ChatProviderManager
    {
        $container = new Container;

        $container->bind(FallbackChatProvider::class, function (): ChatProvider {
            return new class implements ChatProvider
            {
                public function generate(ChatProviderRequest $request): ChatProviderResult
                {
                    throw new RuntimeException('Simulated catastrophic fallback failure.');
                }
            };
        });

        return new ChatProviderManager($container, new AnasResponseQualityGuard);
    }

    /**
     * A throwaway container with GroqChatProvider::class bound to a fake
     * streaming implementation, and the real FallbackChatProvider left to
     * auto-resolve normally with its container-resolvable dependency tree.
     */
    private function managerWithFakeStreamingProvider(object $fakeGroqProvider): ChatProviderManager
    {
        $container = new Container;
        $container->bind(GroqChatProvider::class, fn (): object => $fakeGroqProvider);

        return new ChatProviderManager($container, new AnasResponseQualityGuard);
    }

    public function test_emergency_last_resort_is_arabic_gender_neutral_and_reveals_no_internal_details(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $manager = $this->managerWithThrowingFallback();
        $request = $this->requestWithHistory(
            ChatProviderMessage::user('مرحباً، شو الخدمات المتوفرة؟'),
        );

        $result = $manager->generate($request);

        $this->assertTrue($result->fallbackUsed);
        $this->assertStringContainsString('PR Per Hour', $result->content);
        $this->assertStringContainsString('يمكن الاستمرار', $result->content);

        foreach (['تودين', 'تفضلين', 'مهتمة', 'حابة', 'مهتم/ة', 'تريد/ين', 'حابب/ة'] as $genderedForm) {
            $this->assertStringNotContainsString($genderedForm, $result->content);
        }

        foreach (['Groq', 'API', 'quota', 'model', 'unavailable', 'PRIA AI', 'provider', 'technical failure'] as $forbidden) {
            $this->assertStringNotContainsStringIgnoringCase($forbidden, $result->content);
        }
    }

    public function test_emergency_last_resort_is_english_and_reveals_no_internal_details(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $manager = $this->managerWithThrowingFallback();
        $request = $this->requestWithHistory(
            ChatProviderMessage::user('Hello, what services do you offer?'),
        );

        $result = $manager->generate($request);

        $this->assertTrue($result->fallbackUsed);
        $this->assertStringContainsString('PR Per Hour', $result->content);
        $this->assertStringContainsString('continue exploring', $result->content);

        foreach (['Groq', 'API', 'quota', 'model', 'unavailable', 'PRIA AI', 'provider', 'technical failure'] as $forbidden) {
            $this->assertStringNotContainsStringIgnoringCase($forbidden, $result->content);
        }
    }

    public function test_emergency_last_resort_defaults_to_english_with_no_history(): void
    {
        config()->set('chatbot.ai.driver', 'fallback');

        $manager = $this->managerWithThrowingFallback();

        $result = $manager->generate($this->requestWithHistory());

        $this->assertStringContainsString('continue exploring', $result->content);
    }

    // -----------------------------------------------------------------
    // stream()
    // -----------------------------------------------------------------

    public function test_stream_forwards_raw_fragments_from_the_streaming_provider(): void
    {
        config()->set('chatbot.ai.driver', 'groq');

        $fakeProvider = new class implements ChatProvider, StreamingChatProvider
        {
            public function generate(ChatProviderRequest $request): ChatProviderResult
            {
                throw new RuntimeException('unused in this test');
            }

            public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
            {
                $onRawFragment('Hello');
                $onRawFragment(' there.');

                return new ChatProviderResult(
                    content: 'Hello there.',
                    provider: 'groq',
                    model: 'test-model',
                    fallbackUsed: false,
                );
            }
        };

        $manager = $this->managerWithFakeStreamingProvider($fakeProvider);

        $received = [];
        $result = $manager->stream(
            $this->requestWithHistory(ChatProviderMessage::user('Hi')),
            function (string $fragment) use (&$received): void {
                $received[] = $fragment;
            },
        );

        $this->assertSame(['Hello', ' there.'], $received);
        $this->assertSame('Hello there.', $result->content);
        $this->assertFalse($result->fallbackUsed);
    }

    public function test_stream_falls_back_locally_when_the_provider_fails_before_any_content(): void
    {
        config()->set('chatbot.ai.driver', 'groq');

        $fakeProvider = new class implements ChatProvider, StreamingChatProvider
        {
            public function generate(ChatProviderRequest $request): ChatProviderResult
            {
                throw new RuntimeException('unused in this test');
            }

            public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
            {
                throw new ChatProviderException('Simulated failure before any content.');
            }
        };

        $manager = $this->managerWithFakeStreamingProvider($fakeProvider);

        $received = [];
        $result = $manager->stream(
            $this->requestWithHistory(ChatProviderMessage::user('Hello')),
            function (string $fragment) use (&$received): void {
                $received[] = $fragment;
            },
        );

        $this->assertSame([], $received, 'No raw fragment should ever reach the caller for this failure mode.');
        $this->assertTrue($result->fallbackUsed);
        $this->assertStringContainsString("Hi, I'm PRIA AI", $result->content);
    }

    public function test_stream_gracefully_completes_from_partial_content_after_a_mid_stream_failure(): void
    {
        config()->set('chatbot.ai.driver', 'groq');

        $fakeProvider = new class implements ChatProvider, StreamingChatProvider
        {
            public function generate(ChatProviderRequest $request): ChatProviderResult
            {
                throw new RuntimeException('unused in this test');
            }

            public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
            {
                $onRawFragment('يمكن أن يساعد التحليل في تحديد الأنماط. ');

                throw new PartialStreamChatProviderException(
                    'يمكن أن يساعد التحليل في تحديد الأنماط. وبعدها ين',
                );
            }
        };

        $manager = $this->managerWithFakeStreamingProvider($fakeProvider);

        $result = $manager->stream(
            $this->requestWithHistory(ChatProviderMessage::user('شو بتنصحوني؟')),
            function (): void {},
        );

        $this->assertFalse($result->fallbackUsed);
        $this->assertSame('يمكن أن يساعد التحليل في تحديد الأنماط.', $result->content);
    }

    public function test_stream_falls_back_locally_when_partial_content_has_no_complete_sentence(): void
    {
        config()->set('chatbot.ai.driver', 'groq');

        $fakeProvider = new class implements ChatProvider, StreamingChatProvider
        {
            public function generate(ChatProviderRequest $request): ChatProviderResult
            {
                throw new RuntimeException('unused in this test');
            }

            public function stream(ChatProviderRequest $request, callable $onRawFragment): ChatProviderResult
            {
                throw new PartialStreamChatProviderException('وبعدها ين');
            }
        };

        $manager = $this->managerWithFakeStreamingProvider($fakeProvider);

        $result = $manager->stream(
            $this->requestWithHistory(ChatProviderMessage::user('Hi')),
            function (): void {},
        );

        $this->assertTrue($result->fallbackUsed);
        $this->assertStringContainsString("Hi, I'm PRIA AI", $result->content);
    }
}
