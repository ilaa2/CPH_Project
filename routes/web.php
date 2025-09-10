<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\SetelanController;
use App\Http\Controllers\BantuanController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\KunjunganController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\UlasanController;
use App\Models\Produk;
use App\Models\TipeKunjungan;

use App\Http\Controllers\BelanjaController;
use App\Http\Controllers\Cust\KunjunganControllerCust;
use App\Http\Controllers\CartController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// === ROUTE UNTUK PUBLIK & PELANGGAN ===
Route::get('/', [WelcomeController::class, 'index'])->name('home');


Route::middleware(['auth:pelanggan', 'verified'])->prefix('customer')->group(function () {
    // Route Belanja
    Route::get('/belanja', [BelanjaController::class, 'index'])->name('belanja.index');
    Route::get('/belanja/{product}', [BelanjaController::class, 'show'])->name('belanja.show');

    // Route Keranjang
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::put('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');


    Route::get('/kunjungan', [KunjunganControllerCust::class, 'index'])->name('kunjungan.index');
    Route::post('/kunjungan/handle-form', [KunjunganControllerCust::class, 'handleForm'])->name('kunjungan.handle_form');
    Route::get('/kunjungan/konfirmasi', [KunjunganControllerCust::class, 'showKonfirmasi'])->name('kunjungan.konfirmasi');
    Route::post('/kunjungan', [KunjunganControllerCust::class, 'store'])->name('kunjungan.store');

    // --- KUMPULAN ROUTE PROFIL ---
    Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/profile/password', [CustomerProfileController::class, 'updatePassword'])->name('customer.profile.password.update');
    Route::delete('/profile', [CustomerProfileController::class, 'destroy'])->name('customer.profile.destroy');

});


// === ROUTE UNTUK ADMIN PANEL ===

// Route Autentikasi default (untuk admin)
require __DIR__.'/auth.php';

// Grup untuk semua route admin yang memerlukan login
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard Admin
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CRUD Resources
    Route::resource('produk', ProdukController::class)->except('show');
    Route::resource('pelanggan', PelangganController::class)->except('show');
    Route::resource('kunjungan', KunjunganController::class)->except(['index', 'show', 'store']);
    Route::resource('pesanan', PesananController::class);

    // Halaman Lainnya
    Route::get('/setelan', [SetelanController::class, 'index'])->name('setelan.index');
    Route::get('/bantuan', [BantuanController::class, 'index'])->name('bantuan.index');
    Route::get('/ulasan', [UlasanController::class, 'index'])->name('ulasan.index');
    Route::delete('/ulasan/{id}', [UlasanController::class, 'destroy'])->name('ulasan.destroy');

    // Kunjungan (halaman daftar)
    Route::get('/kunjungan', [KunjunganController::class, 'index'])->name('kunjunganAdmin.index');
    Route::get('/kunjungan/jadwal', [KunjunganController::class, 'jadwal'])->name('kunjungan.jadwal');
    Route::get('/kunjungan/kalender', [KunjunganController::class, 'kalender'])->name('kunjungan.kalender');
    Route::get('/kunjungan/riwayat', [KunjunganController::class, 'riwayat'])->name('kunjungan.riwayat');
    Route::post('/kunjungan', [KunjunganController::class, 'riwayat'])->name('kunjunganAdmin.store');
    // Laporan
    Route::prefix('laporan')->controller(LaporanController::class)->group(function () {
        Route::get('/', 'index')->name('laporan.index');
        Route::get('/penjualan/{format}', 'penjualan')->name('laporan.penjualan');
        Route::get('/kunjungan/{format}', 'kunjungan')->name('laporan.kunjungan');
        Route::get('/produk-terlaris/{format}', 'produkTerlaris')->name('laporan.terlaris');
    });

});
