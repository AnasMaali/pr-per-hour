<?php

declare(strict_types=1);

use App\Features\Bookings\Controllers\AdminBookingController;
use App\Features\Bookings\Controllers\ClientBookingController;
use Illuminate\Support\Facades\Route;

Route::prefix('bookings')
    ->middleware(['auth:sanctum', 'active.user'])
    ->group(static function (): void {
        Route::get('/', [ClientBookingController::class, 'index'])
            ->name('api.v1.bookings.index');

        Route::post('/', [ClientBookingController::class, 'store'])
            ->name('api.v1.bookings.store');

        Route::get('/{booking}', [ClientBookingController::class, 'show'])
            ->whereNumber('booking')
            ->name('api.v1.bookings.show');

        Route::patch('/{booking}/cancel', [ClientBookingController::class, 'cancel'])
            ->whereNumber('booking')
            ->name('api.v1.bookings.cancel');
    });

Route::prefix('admin/bookings')
    ->middleware(['auth:sanctum', 'active.user', 'admin'])
    ->group(static function (): void {
        Route::get('/', [AdminBookingController::class, 'index'])
            ->name('api.v1.admin.bookings.index');

        Route::get('/{booking}', [AdminBookingController::class, 'show'])
            ->whereNumber('booking')
            ->name('api.v1.admin.bookings.show');

        Route::patch('/{booking}/status', [AdminBookingController::class, 'updateStatus'])
            ->whereNumber('booking')
            ->name('api.v1.admin.bookings.status');

        Route::patch('/{booking}/meeting-link', [AdminBookingController::class, 'updateMeetingLink'])
            ->whereNumber('booking')
            ->name('api.v1.admin.bookings.meeting-link');

        Route::patch('/{booking}/notes', [AdminBookingController::class, 'updateNotes'])
            ->whereNumber('booking')
            ->name('api.v1.admin.bookings.notes');
    });
