<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\Pelanggan;
use App\Models\Pesanan;
use App\Models\Kunjungan;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ambil Statistik Utama
        $totalProduk = Produk::count();
        $totalPelanggan = Pelanggan::count();
        $totalPesanan = Pesanan::count();
        $totalKunjungan = Kunjungan::count();

        // 2. Ambil Aktivitas Terbaru
        $pesananTerbaru = Pesanan::with('pelanggan')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $pelangganTerbaru = Pelanggan::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 3. Kirim data ke view
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProduk' => $totalProduk,
                'totalPelanggan' => $totalPelanggan,
                'totalPesanan' => $totalPesanan,
                'totalKunjungan' => $totalKunjungan,
            ],
            'pesananTerbaru' => $pesananTerbaru,
            'pelangganTerbaru' => $pelangganTerbaru,
        ]);
    }
}