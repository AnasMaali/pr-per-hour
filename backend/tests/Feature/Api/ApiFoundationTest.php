<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tests\TestCase;

final class ApiFoundationTest extends TestCase
{
    public function test_health_endpoint_returns_success_structure(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'healthy')
            ->assertJsonPath('data.service', 'pr-per-hour-api')
            ->assertJsonPath('data.version', 'v1')
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['status', 'service', 'version', 'timestamp'],
            ]);

        $json = $response->json();
        $this->assertIsString($json['data']['timestamp'] ?? null);
        $this->assertArrayNotHasKey('APP_KEY', $json);
        $this->assertStringNotContainsString('password', strtolower(json_encode($json) ?: ''));
        $this->assertStringNotContainsString('vendor', strtolower(json_encode($json) ?: ''));
    }

    public function test_health_includes_request_id_header(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk();
        $this->assertNotEmpty($response->headers->get('X-Request-ID'));
        $this->assertTrue(Str::isUuid((string) $response->headers->get('X-Request-ID')));
    }

    public function test_valid_incoming_request_id_is_preserved(): void
    {
        $requestId = 'client-req-12345';

        $response = $this->withHeader('X-Request-ID', $requestId)
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('X-Request-ID', $requestId);
    }

    public function test_invalid_incoming_request_id_is_replaced(): void
    {
        $response = $this->withHeader('X-Request-ID', 'bad id with spaces!!!')
            ->getJson('/api/v1/health');

        $response->assertOk();
        $header = (string) $response->headers->get('X-Request-ID');
        $this->assertNotSame('bad id with spaces!!!', $header);
        $this->assertTrue(Str::isUuid($header));
    }

    public function test_oversized_request_id_is_replaced(): void
    {
        $oversized = str_repeat('a', 100);

        $response = $this->withHeader('X-Request-ID', $oversized)
            ->getJson('/api/v1/health');

        $response->assertOk();
        $header = (string) $response->headers->get('X-Request-ID');
        $this->assertNotSame($oversized, $header);
        $this->assertTrue(Str::isUuid($header));
    }

    public function test_default_locale_is_english(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'en')
            ->assertJsonPath('message', 'API is healthy.');
    }

    public function test_x_locale_ar_resolves_arabic(): void
    {
        $response = $this->withHeader('X-Locale', 'ar')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('message', 'واجهة البرمجة تعمل بشكل سليم.');
    }

    public function test_x_locale_en_resolves_english(): void
    {
        $response = $this->withHeader('X-Locale', 'en')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'en')
            ->assertJsonPath('message', 'API is healthy.');
    }

    public function test_accept_language_ar_ps_resolves_ar(): void
    {
        $response = $this->withHeader('Accept-Language', 'ar-PS,ar;q=0.9')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'ar');
    }

    public function test_accept_language_en_us_resolves_en(): void
    {
        $response = $this->withHeader('Accept-Language', 'en-US,en;q=0.8')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'en');
    }

    public function test_unsupported_locale_falls_back_to_en(): void
    {
        $response = $this->withHeader('X-Locale', 'fr')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'en');
    }

    public function test_x_locale_takes_priority_over_accept_language(): void
    {
        $response = $this
            ->withHeader('X-Locale', 'en')
            ->withHeader('Accept-Language', 'ar-PS')
            ->getJson('/api/v1/health');

        $response->assertOk()
            ->assertHeader('Content-Language', 'en')
            ->assertJsonPath('message', 'API is healthy.');
    }

    public function test_unknown_api_route_returns_json_404_in_english(): void
    {
        $response = $this->getJson('/api/v1/does-not-exist');

        $response->assertNotFound()
            ->assertHeader('Content-Language', 'en')
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'The requested resource was not found.')
            ->assertJsonPath('error_code', 'NOT_FOUND');

        $this->assertNotEmpty($response->headers->get('X-Request-ID'));
        $this->assertIsString($response->json('request_id'));
    }

    public function test_unknown_api_route_returns_json_404_in_arabic(): void
    {
        $response = $this->withHeader('X-Locale', 'ar')
            ->getJson('/api/v1/does-not-exist');

        $response->assertNotFound()
            ->assertHeader('Content-Language', 'ar')
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'المورد المطلوب غير موجود.')
            ->assertJsonPath('error_code', 'NOT_FOUND');
    }

    public function test_validation_exception_uses_standard_error_format(): void
    {
        Route::middleware('api')
            ->post('/api/v1/__foundation-validation-probe', function () {
                request()->validate([
                    'email' => ['required', 'email'],
                ]);
            });

        $response = $this->postJson('/api/v1/__foundation-validation-probe', []);

        $response->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('error_code', 'VALIDATION_FAILED')
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['email'],
                'error_code',
                'request_id',
            ]);
    }

    public function test_named_rate_limiters_are_registered(): void
    {
        foreach (['api', 'auth', 'contact', 'chatbot'] as $name) {
            $this->assertTrue(
                RateLimiter::limiter($name) !== null,
                "Expected rate limiter [{$name}] to be registered.",
            );
        }
    }

    public function test_web_root_still_returns_html_welcome(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $this->assertStringContainsString('text/html', (string) $response->headers->get('Content-Type'));
    }
}
