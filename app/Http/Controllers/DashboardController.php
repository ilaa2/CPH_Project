<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\User;
use App\Models\Pesanan;
use App\Models\Kunjungan;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ambil Statistik Utama
        $totalProduk = Produk::count();
        $totalPelanggan = User::where('role', 'customer')->count();
        
        // Statistik Pesanan (Hanya Selesai)
        $totalPesananSelesai = Pesanan::where('status', 'Selesai')->count();

        // Statistik Kunjungan (Hanya yang relevan: Selesai + Dijadwalkan)
        $totalKunjungan = Kunjungan::whereIn('status', ['Selesai', 'Dijadwalkan'])->count();

        // 2. Data Widget Tambahan
        $stokMenipis = Produk::where('stok', '<', 5)->take(5)->get();
        $pesananPerluDiproses = Pesanan::with('user')
            ->whereIn('status', ['Diproses', 'pending'])
            ->orderBy('created_at', 'asc') // Urutkan dari yang terlama agar segera diproses
            ->take(5)
            ->get();

        // 3. Ambil Kunjungan Hari Ini (Prioritas)
        $kunjunganHariIni = Kunjungan::with(['user', 'tipe'])
            ->whereDate('tanggal', now()->today())
            ->where('status', 'Dijadwalkan')
            ->orderBy('jam', 'asc')
            ->get()
            ->map(function ($k) {
                $k->nama_pelanggan = $k->user ? ($k->user->name ?? 'Guest') : 'Guest';
                return $k;
            });

        // 4. Statistik Grafik (7 Hari Terakhir)
        $grafikPendapatan = Pesanan::selectRaw('DATE(tanggal) as date, SUM(total) as total')
            ->where('status', 'Selesai')
            ->where('tanggal', '>=', now()->subDays(6))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 5. Ambil Aktivitas Terbaru
        $pesananTerbaru = Pesanan::with('user')
            ->where('status', '!=', 'Dibatalkan')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($p) {
                $p->nama_pelanggan = $p->user ? ($p->user->name ?? 'Guest') : 'Guest';
                return $p;
            });

        $pelangganTerbaru = User::where('role', 'customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Transform Pesanan Perlu Diproses
        $pesananPerluDiproses->transform(function ($p) {
            $p->nama_pelanggan = $p->user ? ($p->user->name ?? 'Guest') : 'Guest';
            return $p;
        });

        // 6. Kirim data ke view
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProduk' => $totalProduk,
                'totalPelanggan' => $totalPelanggan,
                'totalPesananSelesai' => $totalPesananSelesai,
                'totalKunjungan' => $totalKunjungan,
            ],
            'stokMenipis' => $stokMenipis,
            'pesananPerluDiproses' => $pesananPerluDiproses,
            'kunjunganHariIni' => $kunjunganHariIni,
            'grafikPendapatan' => $grafikPendapatan,
            'pesananTerbaru' => $pesananTerbaru,
            'pelangganTerbaru' => $pelangganTerbaru,
        ]);
    }
}