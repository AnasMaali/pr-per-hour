<?php

declare(strict_types=1);

use App\Features\ContactMessages\Controllers\AdminContactMessageController;
use App\Features\ContactMessages\Controllers\PublicContactMessageController;
use Illuminate\Support\Facades\Route;

Route::post('/contact-messages', [PublicContactMessageController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('api.v1.contact-messages.store');

Route::prefix('admin/contact-messages')
    ->middleware(['auth:sanctum', 'active.user', 'admin'])
    ->group(static function (): void {
        Route::get('/', [AdminContactMessageController::class, 'index'])
            ->name('api.v1.admin.contact-messages.index');

        Route::get('/{contactMessage}', [AdminContactMessageController::class, 'show'])
            ->whereNumber('contactMessage')
            ->name('api.v1.admin.contact-messages.show');

        Route::patch('/{contactMessage}/status', [AdminContactMessageController::class, 'updateStatus'])
            ->whereNumber('contactMessage')
            ->name('api.v1.admin.contact-messages.status');

        Route::delete('/{contactMessage}', [AdminContactMessageController::class, 'destroy'])
            ->whereNumber('contactMessage')
            ->name('api.v1.admin.contact-messages.destroy');

        Route::post('/{id}/restore', [AdminContactMessageController::class, 'restore'])
            ->whereNumber('id')
            ->name('api.v1.admin.contact-messages.restore');
    });
