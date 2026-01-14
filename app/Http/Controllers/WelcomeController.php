<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Pelanggan;
use App\Models\Kunjungan;
use App\Models\Pesanan;
use App\Models\Ulasan;
use App\Models\TipeKunjungan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        // Cache data statistik selama 60 menit
        $stats = Cache::remember('welcome_stats', 60 * 60, function () {
            return [
                'produkCount' => Produk::count(),
                'kunjunganCount' => Kunjungan::count(),
                'pelangganCount' => Pelanggan::count(),
                'orderCount' => Pesanan::count(),
            ];
        });

        // Get best seller products
        $bestSellerProducts = Cache::remember('best_seller_products', 30 * 60, function () {
            return Produk::with('kategori')
                ->where('status', 'Tersedia')
                ->where('stok', '>', 0)
                ->inRandomOrder()
                ->take(12) // Increase count for grid
                ->get();
        });

        // Get latest products (for "New Arrivals" or Mixed feed)
        $latestProducts = Cache::remember('latest_products', 30 * 60, function () {
            return Produk::with('kategori')
                ->where('status', 'Tersedia')
                ->latest()
                ->take(8)
                ->get();
        });

        // Get Flash Sale Products (Simulated with random products for now)
        $flashSaleProducts = Cache::remember('flash_sale_products', 15 * 60, function () {
            return Produk::with('kategori')
                ->where('status', 'Tersedia')
                ->inRandomOrder()
                ->take(6)
                ->get()
                ->map(function($product) {
                    // Simulate discount for flash sale display
                    $product->original_price = $product->harga * 1.2; // 20% markup as original
                    $product->discount_percentage = 20;
                    return $product;
                });
        });

        // Get testimonials
        $testimonials = Cache::remember('home_testimonials', 30 * 60, function () {
            return Ulasan::where('rating', '>=', 4)
                ->with('pelanggan:id,nama')
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($ulasan) {
                    return [
                        'id' => $ulasan->id,
                        'nama' => $ulasan->pelanggan->nama ?? 'Pelanggan',
                        'komentar' => $ulasan->komentar,
                        'rating' => $ulasan->rating,
                    ];
                });
        });

        return Inertia::render('Customer/DashboardCust', array_merge($stats, [
            'bestSellerProducts' => $bestSellerProducts,
            'latestProducts' => $latestProducts,
            'flashSaleProducts' => $flashSaleProducts,
            'testimonials' => $testimonials,
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
        ]));
    }

    public function tentangKami()
    {
        // Specific dashboard photos for the gallery
        $dashboardGalleryPhotos = [
            'storage/dashboard/20251022_081008.jpg',
            'storage/dashboard/20251022_175528.jpg',
            'storage/dashboard/20251026_071024.jpg',
            'storage/dashboard/20251028_161308.jpg',
            'storage/dashboard/20251028_174458.jpg',
            'storage/dashboard/20251028_175553.jpg',
            'storage/dashboard/20251029_055603.jpg',
            'storage/dashboard/20251029_055619.jpg',
            'storage/dashboard/20251029_055718.jpg',
            'storage/dashboard/20251029_055746.jpg',
            'storage/dashboard/20251029_055956.jpg',
            'storage/dashboard/20251115_094441.jpg',
            'storage/dashboard/20251115_094530.jpg',
            'storage/dashboard/20251124_085606.jpg',
            'storage/dashboard/20251201_094635.jpg',
        ];

        return Inertia::render('Customer/TentangKami/TentangKami', [
            'galleryImages' => $dashboardGalleryPhotos,
        ]);
    }
}
