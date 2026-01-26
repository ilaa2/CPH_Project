<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RajaOngkirController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// RajaOngkir Location API
Route::prefix('rajaongkir')->group(function () {
    Route::get('/provinces', [RajaOngkirController::class, 'provinces']);
    Route::get('/cities/{provinceId}', [RajaOngkirController::class, 'cities']);
    Route::get('/subdistricts/{cityId}', [RajaOngkirController::class, 'subdistricts']);
});

// Biteship API
Route::prefix('biteship')->group(function () {
    Route::get('/maps/areas', [App\Http\Controllers\Api\BiteshipController::class, 'searchArea']);
    Route::post('/rates', [App\Http\Controllers\Api\BiteshipController::class, 'checkRates']);
});
