<?php

declare(strict_types=1);

use App\Features\Services\Controllers\AdminServiceController;
use App\Features\Services\Controllers\PublicServiceController;
use Illuminate\Support\Facades\Route;

Route::get('/services', [PublicServiceController::class, 'index'])
    ->name('api.v1.services.index');

Route::get('/services/{slug}', [PublicServiceController::class, 'show'])
    ->where('slug', '[A-Za-z0-9\-]+')
    ->name('api.v1.services.show');

Route::prefix('admin/services')
    ->middleware(['auth:sanctum', 'active.user', 'admin'])
    ->group(static function (): void {
        Route::get('/', [AdminServiceController::class, 'index'])
            ->name('api.v1.admin.services.index');

        Route::post('/', [AdminServiceController::class, 'store'])
            ->name('api.v1.admin.services.store');

        Route::get('/{service}', [AdminServiceController::class, 'show'])
            ->whereNumber('service')
            ->name('api.v1.admin.services.show');

        Route::patch('/{service}', [AdminServiceController::class, 'update'])
            ->whereNumber('service')
            ->name('api.v1.admin.services.update');

        Route::patch('/{service}/status', [AdminServiceController::class, 'updateStatus'])
            ->whereNumber('service')
            ->name('api.v1.admin.services.status');

        Route::delete('/{service}', [AdminServiceController::class, 'destroy'])
            ->whereNumber('service')
            ->name('api.v1.admin.services.destroy');

        Route::post('/{id}/restore', [AdminServiceController::class, 'restore'])
            ->whereNumber('id')
            ->name('api.v1.admin.services.restore');
    });
