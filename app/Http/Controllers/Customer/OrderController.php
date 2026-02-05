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
        $pesanan->load(['items.produk', 'user', 'ulasan.fotos']);
        
        // Add client_key for Midtrans Snap
        $pesanan->client_key = config('midtrans.client_key');

        return Inertia::render('Customer/Pesanan/Show', [
            'pesanan' => $pesanan,
        ]);
    }

    /**
     * Download the invoice for the specified order.
     */
    public function downloadInvoice(Pesanan $pesanan)
    {
        // Security Check: Ensure the order belongs to the logged-in customer
        if ($pesanan->user_id !== Auth::id()) {
            abort(403, 'AKSES DITOLAK');
        }

        $pesanan->load(['items.produk', 'user']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', ['pesanan' => $pesanan]);
        
        return $pdf->stream('Invoice-INV-' . str_pad($pesanan->id, 5, '0', STR_PAD_LEFT) . '.pdf');
    }

    /**
     * Mark the order as completed by customer.
     */
    public function complete(Pesanan $pesanan)
    {
        if ($pesanan->user_id !== Auth::id()) {
            abort(403, 'AKSES DITOLAK');
        }

        // Only allow if status is currently 'shipped' (or 'dikirim' legacy)
        // Check case-insensitive
        $currentStatus = strtolower($pesanan->status);
        if (!in_array($currentStatus, ['shipped', 'dikirim'])) {
            return back()->with('error', 'Pesanan belum dapat diselesaikan (status belum dikirim).');
        }

        $pesanan->update(['status' => 'completed']);

        return back()->with('success', 'Terima kasih! Pesanan telah diterima dan status diperbarui menjadi Selesai.');
    }
}
