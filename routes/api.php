<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HashController;

Route::get('/algorithms', [HashController::class, 'algorithms']);
Route::post('/hash', [HashController::class, 'hash']);
