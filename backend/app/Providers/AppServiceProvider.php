<?php

declare(strict_types=1);

namespace App\Providers;

use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\Policies\BookingPolicy;
use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\ContactMessages\Policies\ContactMessagePolicy;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\ServiceCategories\Policies\ServiceCategoryPolicy;
use App\Features\Services\Models\Service;
use App\Features\Services\Policies\ServicePolicy;
use App\Features\Users\Models\User;
use App\Features\Users\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(ServiceCategory::class, ServiceCategoryPolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(ContactMessage::class, ContactMessagePolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $max = (int) config('api.rate_limits.api', 60);

            return Limit::perMinute($max)->by(
                (string) ($request->user()?->getAuthIdentifier() ?: $request->ip()),
            );
        });

        RateLimiter::for('auth', function (Request $request): Limit {
            $max = (int) config('api.rate_limits.auth', 5);
            $email = strtolower(trim((string) $request->input('email', '')));
            $key = $email !== ''
                ? $email.'|'.$request->ip()
                : (string) $request->ip();

            return Limit::perMinute($max)->by($key);
        });

        RateLimiter::for('contact', function (Request $request): Limit {
            $max = (int) config('api.rate_limits.contact', 5);

            return Limit::perMinute($max)->by((string) $request->ip());
        });

        RateLimiter::for('chatbot', function (Request $request): Limit {
            $max = (int) config('api.rate_limits.chatbot', 20);

            return Limit::perMinute($max)->by(
                (string) ($request->user()?->getAuthIdentifier() ?: $request->ip()),
            );
        });

        RateLimiter::for('auth-email-verification-code', function (Request $request): Limit {
            return $this->emailIpLimit(
                $request,
                (int) config('api.rate_limits.auth_email_verification_code', 5),
            );
        });

        RateLimiter::for('auth-email-verify', function (Request $request): Limit {
            return $this->emailIpLimit(
                $request,
                (int) config('api.rate_limits.auth_email_verify', 10),
            );
        });

        RateLimiter::for('auth-password-forgot', function (Request $request): Limit {
            return $this->emailIpLimit(
                $request,
                (int) config('api.rate_limits.auth_password_forgot', 5),
            );
        });

        RateLimiter::for('auth-password-reset', function (Request $request): Limit {
            return $this->emailIpLimit(
                $request,
                (int) config('api.rate_limits.auth_password_reset', 10),
            );
        });
    }

    private function emailIpLimit(Request $request, int $max): Limit
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $key = $email !== ''
            ? hash('sha256', $email).'|'.$request->ip()
            : (string) $request->ip();

        return Limit::perMinute(max(1, $max))->by($key);
    }
}
