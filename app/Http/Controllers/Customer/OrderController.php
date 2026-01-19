<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\Kunjungan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the customer's orders and visits.
     * Menampilkan daftar semua pesanan dan kunjungan milik pelanggan.
     */
    public function index()
    {
        $userId = Auth::id();

        // Fetch all product order history for this customer
        $pesananProduk = Pesanan::with(['items.produk', 'ulasan'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        // Fetch all visit history for this customer
        $pesananKunjungan = Kunjungan::with(['tipe', 'ulasan'])
            ->where('user_id', $userId)
            ->orderByDesc('tanggal')
            ->get();

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
        if ($pesanan->user_id !== Auth::id()) {
            abort(403, 'AKSES DITOLAK');
        }

        // Load necessary relationships
        $pesanan->load(['items.produk', 'user']);
        
        // Add client_key for Midtrans Snap
        $pesanan->client_key = config('midtrans.client_key');

        return Inertia::render('Customer/Pesanan/Show', [
            'pesanan' => $pesanan,
        ]);
    }
}
