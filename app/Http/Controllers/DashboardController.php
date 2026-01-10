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
        
        // Statistik Pesanan (Hanya Selesai)
        $totalPesananSelesai = Pesanan::where('status', 'Selesai')->count();

        // Statistik Kunjungan (Hanya yang relevan: Selesai + Dijadwalkan)
        $totalKunjungan = Kunjungan::whereIn('status', ['Selesai', 'Dijadwalkan'])->count();

        // 2. Data Widget Tambahan
        $stokMenipis = Produk::where('stok', '<', 5)->take(5)->get();
        $pesananPerluDiproses = Pesanan::with('pelanggan')
            ->whereIn('status', ['Diproses', 'pending'])
            ->orderBy('created_at', 'asc') // Urutkan dari yang terlama agar segera diproses
            ->take(5)
            ->get();

        // 3. Ambil Aktivitas Terbaru
        $pesananTerbaru = Pesanan::with('pelanggan')
            ->where('status', '!=', 'Dibatalkan')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $pelangganTerbaru = Pelanggan::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Kirim data ke view
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProduk' => $totalProduk,
                'totalPelanggan' => $totalPelanggan,
                'totalPesananSelesai' => $totalPesananSelesai,
                'totalKunjungan' => $totalKunjungan,
            ],
            'stokMenipis' => $stokMenipis,
            'pesananPerluDiproses' => $pesananPerluDiproses,
            'pesananTerbaru' => $pesananTerbaru,
            'pelangganTerbaru' => $pelangganTerbaru,
        ]);
    }
}