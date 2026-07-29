<?php

declare(strict_types=1);

use App\Features\ServiceCategories\Controllers\AdminServiceCategoryController;
use App\Features\ServiceCategories\Controllers\PublicServiceCategoryController;
use Illuminate\Support\Facades\Route;

Route::get('/service-categories', [PublicServiceCategoryController::class, 'index'])
    ->name('api.v1.service-categories.index');

Route::get('/service-categories/{slug}', [PublicServiceCategoryController::class, 'show'])
    ->where('slug', '[A-Za-z0-9\-]+')
    ->name('api.v1.service-categories.show');

Route::prefix('admin/service-categories')
    ->middleware(['auth:sanctum', 'active.user', 'admin'])
    ->group(static function (): void {
        Route::get('/', [AdminServiceCategoryController::class, 'index'])
            ->name('api.v1.admin.service-categories.index');

        Route::post('/', [AdminServiceCategoryController::class, 'store'])
            ->name('api.v1.admin.service-categories.store');

        Route::get('/{serviceCategory}', [AdminServiceCategoryController::class, 'show'])
            ->whereNumber('serviceCategory')
            ->name('api.v1.admin.service-categories.show');

        Route::patch('/{serviceCategory}', [AdminServiceCategoryController::class, 'update'])
            ->whereNumber('serviceCategory')
            ->name('api.v1.admin.service-categories.update');

        Route::patch('/{serviceCategory}/status', [AdminServiceCategoryController::class, 'updateStatus'])
            ->whereNumber('serviceCategory')
            ->name('api.v1.admin.service-categories.status');

        Route::delete('/{serviceCategory}', [AdminServiceCategoryController::class, 'destroy'])
            ->whereNumber('serviceCategory')
            ->name('api.v1.admin.service-categories.destroy');

        Route::post('/{id}/restore', [AdminServiceCategoryController::class, 'restore'])
            ->whereNumber('id')
            ->name('api.v1.admin.service-categories.restore');
    });
