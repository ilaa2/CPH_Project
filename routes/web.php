<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ====== PUBLIC CONTROLLERS ======
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\BelanjaController;

// ====== ADMIN CONTROLLERS ======
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\VisitBookingController as AdminVisitBookingController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;

// ====== CUSTOMER CONTROLLERS ======
use App\Http\Controllers\Customer\ProductController as CustomerProductController;
use App\Http\Controllers\Customer\CartController as CustomerCartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\VisitBookingController as CustomerVisitBookingController;
use App\Http\Controllers\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;

// ====== MIDTRANS CONTROLLER ======
use App\Http\Controllers\MidtransController;

// ====== LOCATION CONTROLLER ======
use App\Http\Controllers\LocationController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// =====================================================
// === ROUTE UNTUK PUBLIK (Tanpa Login) ===
// =====================================================

Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/tentang-kami', [WelcomeController::class, 'tentangKami'])->name('tentang.kami');

// Route Belanja (Public - Katalog Produk)
Route::get('/customer/belanja', [BelanjaController::class, 'index'])->name('belanja.index');
Route::get('/customer/belanja/{product}', [BelanjaController::class, 'show'])->name('belanja.show');

// Route Kunjungan (Public - Landing Page & Form)
Route::get('/customer/kunjungan', [CustomerVisitBookingController::class, 'landing'])->name('kunjungan.landing');
Route::get('/customer/kunjungan/form', [CustomerVisitBookingController::class, 'index'])->name('kunjungan.index');


// =====================================================
// === ROUTE UNTUK CUSTOMER (Role: customer) ===
// =====================================================

Route::middleware(['auth', 'verified', 'customer'])->prefix('customer')->group(function () {

    // --- Keranjang ---
    Route::post('/cart', [CustomerCartController::class, 'store'])->name('cart.store');
    Route::put('/cart/{cart}', [CustomerCartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CustomerCartController::class, 'destroy'])->name('cart.destroy');

    // --- Kunjungan Customer ---
    Route::get('/kunjungan/check-availability', [CustomerVisitBookingController::class, 'checkAvailability'])->name('kunjungan.check_availability');
    Route::post('/kunjungan/handle-form', [CustomerVisitBookingController::class, 'handleForm'])->name('kunjungan.handle_form');
    Route::get('/kunjungan/konfirmasi', [CustomerVisitBookingController::class, 'showKonfirmasi'])->name('kunjungan.konfirmasi');
    Route::post('/kunjungan/customer', [CustomerVisitBookingController::class, 'store'])->name('customer.kunjungan.store');
    Route::get('/kunjungan/{kunjungan}/payment', [CustomerVisitBookingController::class, 'showPayment'])->name('customer.kunjungan.payment');
    Route::get('/kunjungan/{kunjungan}', [CustomerVisitBookingController::class, 'show'])->name('customer.kunjungan.show');
    Route::get('/kunjungan/{kunjungan}/invoice', [CustomerVisitBookingController::class, 'downloadInvoice'])->name('customer.kunjungan.invoice');
    Route::post('/kunjungan/{kunjungan}/complete', [CustomerVisitBookingController::class, 'complete'])->name('customer.kunjungan.complete');
    Route::post('/kunjungan/{kunjungan}/confirm-payment', [CustomerVisitBookingController::class, 'confirmPayment'])->name('customer.kunjungan.confirm-payment');

    // --- Profil Customer ---
    Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/profile/password', [CustomerProfileController::class, 'updatePassword'])->name('customer.profile.password.update');
    Route::post('/profile/photo', [CustomerProfileController::class, 'updatePhoto'])->name('customer.profile.update-photo');
    Route::delete('/profile', [CustomerProfileController::class, 'destroy'])->name('customer.profile.destroy');

    // --- Pesanan Customer ---
    Route::get('/pesanan', [CustomerOrderController::class, 'index'])->name('customer.pesanan.index');
    Route::get('/pesanan/{pesanan}', [CustomerOrderController::class, 'show'])->name('customer.pesanan.show');
    Route::get('/pesanan/{pesanan}/invoice', [CustomerOrderController::class, 'downloadInvoice'])->name('customer.pesanan.invoice');
    Route::post('/pesanan/{pesanan}/complete', [CustomerOrderController::class, 'complete'])->name('customer.pesanan.complete');

    // --- Ulasan Customer ---
    Route::get('/ulasan/create/{pesanan}', [CustomerReviewController::class, 'create'])->name('customer.ulasan.create');
    Route::post('/ulasan', [CustomerReviewController::class, 'store'])->name('customer.ulasan.store');
    Route::get('/kunjungan/{kunjungan}/ulasan', [CustomerReviewController::class, 'createForKunjungan'])->name('customer.kunjungan.ulasan.create');
    Route::post('/kunjungan/ulasan', [CustomerReviewController::class, 'storeForKunjungan'])->name('customer.kunjungan.ulasan.store');

    // --- Checkout ---
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::get('/method', [CheckoutController::class, 'index'])->name('method');
        Route::post('/method', [CheckoutController::class, 'saveMethod'])->name('saveMethod');
        
        Route::get('/address', [CheckoutController::class, 'address'])->name('address');
        Route::post('/address', [CheckoutController::class, 'saveAddress'])->name('save-address');

        Route::get('/shipping', [CheckoutController::class, 'shipping'])->name('shipping');
        Route::post('/shipping', [CheckoutController::class, 'saveShipping'])->name('saveShipping');

        Route::get('/summary', [CheckoutController::class, 'summary'])->name('summary');
        Route::post('/process', [CheckoutController::class, 'process'])->name('process');
        
        // Handle GET request to /process (e.g., when user clicks back after Midtrans popup)
        Route::get('/process', function () {
            return redirect()->route('customer.pesanan.index')
                ->with('info', 'Pembayaran telah selesai. Lihat riwayat pesanan Anda.');
        })->name('process.redirect');
        
        Route::post('/buy-now', [CheckoutController::class, 'buyNow'])->name('buyNow');
    });
});


// =====================================================
// === ROUTE UNTUK ADMIN (Role: admin) ===
// =====================================================

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // --- Dashboard ---
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // --- Profil Admin ---
    Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [AdminProfileController::class, 'destroy'])->name('profile.destroy');

    // --- Produk CRUD ---
    Route::post('/produk/{id}/duplicate', [AdminProductController::class, 'duplicate'])->name('produk.duplicate');
    Route::post('/produk/{id}/restore', [AdminProductController::class, 'restore'])->name('produk.restore');
    Route::resource('produk', AdminProductController::class)->except(['show']);

    // --- Pelanggan (Customer Data) ---
    Route::resource('pelanggan', AdminCustomerController::class)->except('show');

    // --- Pesanan (Orders) - TANPA DELETE (histori tidak boleh dihapus)
    Route::resource('pesanan', AdminOrderController::class)->except(['destroy']);

    // --- Kunjungan (Visit Bookings) ---
    Route::get('/kunjungan', [AdminVisitBookingController::class, 'index'])->name('kunjungan.index');
    Route::get('/kunjungan/jadwal', [AdminVisitBookingController::class, 'jadwal'])->name('kunjungan.jadwal');
    Route::get('/kunjungan/kalender', [AdminVisitBookingController::class, 'kalender'])->name('kunjungan.kalender');
    Route::get('/kunjungan/riwayat', [AdminVisitBookingController::class, 'riwayat'])->name('kunjungan.riwayat');
    Route::get('/kunjungan/create', [AdminVisitBookingController::class, 'create'])->name('kunjungan.create');
    Route::post('/kunjungan', [AdminVisitBookingController::class, 'store'])->name('kunjungan.store');
    Route::get('/kunjungan/{kunjungan}/edit', [AdminVisitBookingController::class, 'edit'])->name('kunjungan.edit');
    Route::put('/kunjungan/{kunjungan}', [AdminVisitBookingController::class, 'update'])->name('kunjungan.update');
    Route::delete('/kunjungan/{kunjungan}', [AdminVisitBookingController::class, 'destroy'])->name('kunjungan.destroy');

    // --- Ulasan (Reviews) ---
    Route::get('/ulasan', [AdminReviewController::class, 'index'])->name('ulasan.index');
    Route::post('/ulasan/{id}/reply', [AdminReviewController::class, 'reply'])->name('ulasan.reply');
    Route::delete('/ulasan/{id}', [AdminReviewController::class, 'destroy'])->name('ulasan.destroy');

    // --- Laporan (Reports) ---
    Route::get('/laporan', [AdminReportController::class, 'index'])->name('laporan.index');

    // Laporan Data & Export (Bypass Inertia Middleware)
    Route::prefix('laporan')->controller(AdminReportController::class)->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class])->group(function () {
        Route::get('/{type}/json', 'data')->name('laporan.data');
        Route::get('/penjualan/{format}', 'penjualan')->name('laporan.penjualan');
        Route::get('/kunjungan/{format}', 'kunjungan')->name('laporan.kunjungan');
        Route::get('/produk-terlaris/{format}', 'produkTerlaris')->name('laporan.terlaris');
    });
});

// Legacy route redirects for backwards compatibility
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard', fn() => redirect()->route('admin.dashboard'));
    Route::get('/profile', fn() => redirect()->route('admin.profile.edit'));
});


// =====================================================
// === ROUTE LOKASI (API Proxy to RajaOngkir) ===
// =====================================================

Route::prefix('api/locations')->name('api.locations.')->controller(LocationController::class)->group(function () {
    Route::get('/provinces', 'provinces')->name('provinces');
    Route::get('/cities', 'cities')->name('cities');
    Route::get('/districts', 'districts')->name('districts');
    Route::get('/subdistricts', 'subdistricts')->name('subdistricts');
});


// =====================================================
// === MIDTRANS ROUTES ===
// =====================================================

// Midtrans Notification Webhook (No Auth, No CSRF)
Route::post('/midtrans/notification', [MidtransController::class, 'notification'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('midtrans.notification');

// Retry Payment Routes (Customer Auth Required)
Route::middleware(['auth', 'customer'])->prefix('customer')->group(function () {
    Route::post('/pesanan/{pesanan}/retry-payment', [MidtransController::class, 'retryPaymentPesanan'])
        ->name('customer.pesanan.retry-payment');
    Route::post('/kunjungan/{kunjungan}/retry-payment', [MidtransController::class, 'retryPaymentKunjungan'])
        ->name('customer.kunjungan.retry-payment');
});

// Payment Callback Routes (GET - No Auth to allow redirect from Midtrans)
Route::prefix('customer/payment')->name('customer.payment.')->group(function () {
    Route::get('/finish', [MidtransController::class, 'paymentFinish'])->name('finish');
    Route::get('/unfinish', [MidtransController::class, 'paymentUnfinish'])->name('unfinish');
    Route::get('/error', [MidtransController::class, 'paymentError'])->name('error');
});


require __DIR__.'/auth.php';
