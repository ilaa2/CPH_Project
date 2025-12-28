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
use App\Http\Controllers\Customer\KunjunganControllerCust;
use App\Http\Controllers\CartController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\CheckoutController;
use App\Models\Transaction;
use App\Http\Controllers\Customer\PesananControllerCust;

use App\Http\Controllers\DashboardController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// === ROUTE UNTUK PUBLIK & PELANGGAN ===
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/tentang-kami', [WelcomeController::class, 'tentangKami'])->name('tentang.kami');


Route::middleware(['auth:pelanggan', 'verified'])->prefix('customer')->group(function () {
    // Route Belanja
    Route::get('/belanja', [BelanjaController::class, 'index'])->name('belanja.index');
    Route::get('/belanja/{product}', [BelanjaController::class, 'show'])->name('belanja.show');

    // Route Keranjang
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::put('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');


    Route::get('/kunjungan', [KunjunganControllerCust::class, 'index'])->name('kunjungan.index');
    Route::post('/kunjungan/handle-form', [KunjunganControllerCust::class, 'handleForm'])->name('kunjungan.handle_form');
    Route::get('/kunjungan/konfirmasi', [KunjunganControllerCust::class, 'showKonfirmasi'])->name('kunjungan.konfirmasi');
    Route::post('/kunjungan/customer', [KunjunganControllerCust::class, 'store'])->name('customer.kunjungan.store');

    // --- KUMPULAN ROUTE PROFIL ---
    Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/profile/password', [CustomerProfileController::class, 'updatePassword'])->name('customer.profile.password.update');
    Route::delete('/profile', [CustomerProfileController::class, 'destroy'])->name('customer.profile.destroy');

    // Route Pesanan Customer
    Route::resource('pesanan', PesananControllerCust::class)->only(['index', 'show']);

        // Grup Route untuk Checkout
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index'); // Select Method (Step 1)
        Route::post('/method', [CheckoutController::class, 'saveMethod'])->name('saveMethod'); // Save Method
        
        Route::get('/address', [CheckoutController::class, 'address'])->name('address'); // Input Address (Step 2 - Delivery Only)
        Route::post('/address', [CheckoutController::class, 'saveAddress'])->name('saveAddress'); // Save Address

        Route::get('/shipping', [CheckoutController::class, 'shipping'])->name('shipping'); // Select Shipping (Step 3 - Delivery Only)
        Route::post('/shipping', [CheckoutController::class, 'saveShipping'])->name('saveShipping'); // Save Shipping

        Route::get('/summary', [CheckoutController::class, 'summary'])->name('summary'); // Summary (Step 4/2)
        Route::post('/process', [CheckoutController::class, 'process'])->name('process'); // Process Payment
        
        Route::post('/buy-now', [CheckoutController::class, 'buyNow'])->name('buyNow');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Admin
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CRUD Resources
    Route::resource('produk', ProdukController::class)->except(['show', 'edit']);
    Route::resource('pelanggan', PelangganController::class)->except('show');
    Route::resource('kunjungan', KunjunganController::class)->except(['index', 'show']);
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

    // Laporan
    Route::prefix('laporan')->controller(LaporanController::class)->group(function () {
        Route::get('/', 'index')->name('laporan.index');
        Route::get('/penjualan/{format}', 'penjualan')->name('laporan.penjualan');
        Route::get('/kunjungan/{format}', 'kunjungan')->name('laporan.kunjungan');
        Route::get('/produk-terlaris/{format}', 'produkTerlaris')->name('laporan.terlaris');
    });

});


// Route Lokasi (API Proxy to RajaOngkir) - Exposed to Ziggy
Route::prefix('api/locations')->name('api.locations.')->controller(\App\Http\Controllers\LocationController::class)->group(function () {
    Route::get('/provinces', 'provinces')->name('provinces');
    Route::get('/cities', 'cities')->name('cities');
    Route::get('/districts', 'districts')->name('districts');
    Route::get('/subdistricts', 'subdistricts')->name('subdistricts');
});


require __DIR__.'/auth.php';

