<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All application API routes are versioned under /api/v1.
|
*/

Route::prefix('v1')->group(base_path('routes/api/v1.php'));

Route::fallback(static function (): never {
    abort(404);
});
