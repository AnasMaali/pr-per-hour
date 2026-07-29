<?php

declare(strict_types=1);

use App\Features\Users\Controllers\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/users')
    ->middleware(['auth:sanctum', 'active.user', 'admin'])
    ->group(static function (): void {
        Route::get('/', [AdminUserController::class, 'index'])
            ->name('api.v1.admin.users.index');

        Route::get('/{user}', [AdminUserController::class, 'show'])
            ->whereNumber('user')
            ->name('api.v1.admin.users.show');

        Route::patch('/{user}/status', [AdminUserController::class, 'updateStatus'])
            ->whereNumber('user')
            ->name('api.v1.admin.users.status');
    });
