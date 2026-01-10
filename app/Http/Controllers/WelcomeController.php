<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Pelanggan;
use App\Models\Kunjungan;
use App\Models\Pesanan;
use App\Models\TipeKunjungan; // 👈 1. Pastikan baris ini ada
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        // Cache data statistik selama 60 menit untuk mengurangi beban database
        $stats = \Illuminate\Support\Facades\Cache::remember('welcome_stats', 60 * 60, function () {
            return [
                'produkCount' => Produk::count(),
                'kunjunganCount' => Kunjungan::count(),
                'pelangganCount' => Pelanggan::count(),
                'orderCount' => Pesanan::count(),
            ];
        });

        return Inertia::render('Customer/DashboardCust', array_merge($stats, [
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
        ]));
    }

    public function tentangKami()
    {
        $galleryPath = public_path('storage/galeri');
        $galleryImages = [];

        if (File::isDirectory($galleryPath)) {
            $files = File::files($galleryPath);
            foreach ($files as $file) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $galleryImages[] = 'storage/galeri/' . $file->getFilename();
                }
            }
        }

        return Inertia::render('Customer/TentangKami/TentangKami', [
            'galleryImages' => $galleryImages,
        ]);
    }
}
