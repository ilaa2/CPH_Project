<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Pelanggan;
use App\Models\Kunjungan;
use App\Models\Pesanan;
use App\Models\TipeKunjungan; // 👈 1. Pastikan baris ini ada
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        $latestBuah = Produk::where('status', 'Aktif')
                            ->where('id_kategori', 2)
                            ->latest()->take(8)->get();

        $latestSayur = Produk::where('status', 'Aktif')
                             ->where('id_kategori', 1)
                             ->latest()->take(8)->get();

        // 👇 2. Ambil data tipe kunjungan dari database
        $tipeKunjungan = TipeKunjungan::all();

        return Inertia::render('Customer/DashboardCust', [
            'latestBuah' => $latestBuah,
            'latestSayur' => $latestSayur,
            'tipeKunjungan' => $tipeKunjungan, // 👈 3. Kirim datanya sebagai prop
            'produkCount' => Produk::count(),
            'kunjunganCount' => Kunjungan::count(),
            'pelangganCount' => Pelanggan::count(),
            'orderCount' => Pesanan::count(),
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
        ]);
    }
}
