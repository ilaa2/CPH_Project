<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\User;
use App\Models\Pesanan;
use App\Models\Kunjungan;

class DashboardController extends Controller
{
    // Note: Middleware diatur di routes/web.php dengan middleware(['auth', 'verified', 'admin'])
    
    public function index()
    {
        // 1. Ambil Statistik Utama
        $totalProduk = Produk::count();
        $totalPelanggan = User::where('role', 'customer')->count();
        
        // Statistik Pesanan (Hanya Selesai)
        $totalPesananSelesai = Pesanan::whereIn('status', ['Selesai', 'completed'])->count();

        // Statistik Kunjungan (Hanya yang relevan: Selesai + Dijadwalkan)
        $totalKunjungan = Kunjungan::whereIn('status', ['Selesai', 'Dijadwalkan'])->count();

        // 2. Data Widget Tambahan
        $stokMenipis = Produk::where('stok', '<', 5)->take(5)->get();
        $pesananPerluDiproses = Pesanan::with('user')
            ->whereIn('status', ['Diproses', 'processed']) // Hanya yang sudah bayar perlu diproses
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
        // 4. Statistik Grafik (7 Hari Terakhir)
        $endDate = now();
        $startDate = now()->subDays(6);
        
        // Generate array tanggal 7 hari terakhir (default 0)
        $dates = collect();
        for ($i = 0; $i <= 6; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $dates->put($date, 0);
        }

        // Ambil data dari database
        $revenueData = Pesanan::selectRaw('DATE(tanggal) as date, SUM(total) as total')
            ->whereIn('status', ['processed', 'shipped', 'completed', 'Diproses', 'Dikirim', 'Selesai'])
            ->whereDate('tanggal', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');

        // Merge data database ke array tanggal (replace 0 dengan value asli)
        $grafikPendapatan = $dates->map(function ($default, $date) use ($revenueData) {
            return [
                'date' => $date,
                'total' => $revenueData->get($date) ?? 0 // Pakai data DB atau 0
            ];
        })->values();

        // 4.1. Statistik Grafik Kunjungan (7 Hari Terakhir) - NEW
        $visitData = Kunjungan::selectRaw('DATE(tanggal) as date, SUM(jumlah_dewasa + jumlah_anak + jumlah_balita) as total')
            ->where('status', '!=', 'Batal')
            ->whereDate('tanggal', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');

        $grafikKunjungan = $dates->map(function ($default, $date) use ($visitData) {
            return [
                'date' => $date,
                'total' => (int) ($visitData->get($date) ?? 0)
            ];
        })->values();

        // 5. Ambil Aktivitas Terbaru
        $pesananTerbaru = Pesanan::with('user')
            ->where('status', '!=', 'Dibatalkan')
            ->where('status', '!=', 'pending') // Item 11: Jangan tampilkan pending
            ->latest()
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
            'grafikKunjungan' => $grafikKunjungan, // <-- Added
            'pesananTerbaru' => $pesananTerbaru,
            'pelangganTerbaru' => $pelangganTerbaru,
        ]);
    }
}
