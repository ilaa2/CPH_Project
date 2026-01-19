<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\Kunjungan; // Import the Kunjungan model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Import DB Facade
use Inertia\Inertia;

class PesananControllerCust extends Controller
{
    /**
     * Display a listing of the customer's orders and visits.
     * Menampilkan daftar semua pesanan dan kunjungan milik pelanggan.
     */
    public function index()
    {
        $userId = Auth::id();

        // Fetch all product order history for this customer
        // Ambil semua riwayat pesanan produk, HANYA untuk user ini
        $pesananProduk = Pesanan::with(['items.produk', 'ulasan'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        // Fetch all visit history for this customer
        $pesananKunjungan = Kunjungan::with(['tipe', 'ulasan'])
            ->where('user_id', $userId)
            ->orderByDesc('tanggal')
            ->get();


        // Ubah 'Index' menjadi 'Riwayat'
        return Inertia::render('Customer/Pesanan/Riwayat', [
            'riwayatProduk' => $pesananProduk,
            'riwayatKunjungan' => $pesananKunjungan,
        ]);
    }

    /**
     * Display the specified order for the customer.
     * Menampilkan detail satu pesanan milik pelanggan.
     */
    public function show(Pesanan $pesanan)
    {
        // Security Check: Ensure the order belongs to the logged-in customer
        // Pastikan pesanan yang diakses adalah milik user yang sedang login.
        if ($pesanan->user_id !== Auth::id()) {
            abort(403, 'AKSES DITOLAK');
        }

        // Load necessary relationships
        // Load data relasi yang dibutuhkan (items dan produk di dalamnya)
        $pesanan->load(['items.produk', 'user']);
        
        // Add client_key for Midtrans Snap
        $pesanan->client_key = config('midtrans.client_key');

        // Render the Inertia view
        // Kirim data ke view Inertia
        return Inertia::render('Customer/Pesanan/Show', [
            'pesanan' => $pesanan,
        ]);
    }
}
