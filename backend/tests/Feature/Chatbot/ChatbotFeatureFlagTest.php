<?php

declare(strict_types=1);

namespace Tests\Feature\Chatbot;

use Illuminate\Support\Facades\Route;
use Tests\Support\InteractsWithFeatureFlags;
use Tests\TestCase;

final class ChatbotFeatureFlagTest extends TestCase
{
    use InteractsWithFeatureFlags;

    private ?string $previousFeatureValue = null;

    protected function setUp(): void
    {
        $this->previousFeatureValue = getenv(
            'FEATURE_CHATBOT_ENABLED'
        ) ?: null;

        $this->setFeatureFlagEnv('FEATURE_CHATBOT_ENABLED', 'false');

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

    public function test_chatbot_routes_are_not_registered_when_disabled(): void
    {
        $this->assertFalse(
            Route::has('api.v1.chatbot.conversations.store')
        );

        $this->assertFalse(
            Route::has('api.v1.chatbot.conversations.show')
        );

        $this->assertFalse(
            Route::has('api.v1.chatbot.messages.store')
        );
    }
}
