<?php

declare(strict_types=1);

use App\Features\Auth\Controllers\CurrentUserController;
use App\Features\Auth\Controllers\ForgotPasswordController;
use App\Features\Auth\Controllers\LoginController;
use App\Features\Auth\Controllers\LogoutController;
use App\Features\Auth\Controllers\RegisterController;
use App\Features\Auth\Controllers\RequestEmailVerificationCodeController;
use App\Features\Auth\Controllers\ResetPasswordController;
use App\Features\Auth\Controllers\UpdateProfileController;
use App\Features\Auth\Controllers\VerifyEmailCodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(static function (): void {
    Route::post('/register', RegisterController::class)
        ->middleware('throttle:auth')
        ->name('api.v1.auth.register');

    Route::post('/login', LoginController::class)
        ->middleware('throttle:auth')
        ->name('api.v1.auth.login');

    Route::post('/email/verification-code', RequestEmailVerificationCodeController::class)
        ->middleware('throttle:auth-email-verification-code')
        ->name('api.v1.auth.email.verification-code');

    Route::post('/email/verify', VerifyEmailCodeController::class)
        ->middleware('throttle:auth-email-verify')
        ->name('api.v1.auth.email.verify');

    Route::post('/password/forgot', ForgotPasswordController::class)
        ->middleware('throttle:auth-password-forgot')
        ->name('api.v1.auth.password.forgot');

    Route::post('/password/reset', ResetPasswordController::class)
        ->middleware('throttle:auth-password-reset')
        ->name('api.v1.auth.password.reset');

    Route::middleware(['auth:sanctum', 'active.user'])->group(static function (): void {
        Route::post('/logout', LogoutController::class)
            ->name('api.v1.auth.logout');

        Route::get('/me', CurrentUserController::class)
            ->name('api.v1.auth.me');

        Route::patch('/profile', UpdateProfileController::class)
            ->name('api.v1.auth.profile');
    });
});
