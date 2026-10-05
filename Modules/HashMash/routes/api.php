<?php

use Illuminate\Support\Facades\Route;
use Modules\HashMash\Http\Controllers\HashController;

Route::prefix('api')->middleware('api')->group(function () {
    Route::get('/algorithms', [HashController::class, 'algorithms']);
    Route::post('/hash', [HashController::class, 'hash']);
});
