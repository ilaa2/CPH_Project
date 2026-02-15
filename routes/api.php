<?php

use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// RajaOngkir routes removed (Controller deleted)

// Biteship API
Route::prefix('biteship')->group(function () {
    Route::get('/maps/areas', [App\Http\Controllers\Api\BiteshipController::class, 'searchArea']);
    Route::post('/rates', [App\Http\Controllers\Api\BiteshipController::class, 'checkRates']);
});
