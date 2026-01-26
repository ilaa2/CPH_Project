<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Generate new snap token for retry payment (Pesanan).
     */
    public function retryPaymentPesanan(Request $request, Pesanan $pesanan)
    {
        // Verify ownership
        if ($pesanan->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if payment is already completed
        if ($pesanan->payment_status === 'paid') {
            return redirect()->route('customer.pesanan.show', $pesanan->id)
                ->with('info', 'Pesanan sudah dibayar.');
        }

        try {
            // Generate new order ID for retry
            $newOrderId = 'PSN-' . strtoupper(Str::random(6)) . '-' . time();

            $user = Auth::user();
            
            $itemDetails = $pesanan->items->map(function ($item) {
                return [
                    'id' => 'PROD-' . $item->produk_id,
                    'name' => $item->produk->nama ?? 'Produk',
                    'price' => (int) ($item->subtotal / $item->jumlah),
                    'quantity' => $item->jumlah,
                ];
            })->toArray();

            // Add shipping cost if exists
            if ($pesanan->biaya_pengiriman > 0) {
                $itemDetails[] = [
                    'id' => 'SHIPPING',
                    'name' => 'Biaya Pengiriman',
                    'price' => (int) $pesanan->biaya_pengiriman,
                    'quantity' => 1,
                ];
            }

            $payload = [
                'transaction_details' => [
                    'order_id' => $newOrderId,
                    'gross_amount' => (int) $pesanan->total,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                ],
                'item_details' => $itemDetails,
                'callbacks' => [
                    'finish' => url('/customer/payment/finish'),
                    'unfinish' => url('/customer/payment/unfinish'),
                    'error' => url('/customer/payment/error'),
                ],
            ];

            $snapToken = Snap::getSnapToken($payload);
            
            $pesanan->update([
                'snap_token' => $snapToken,
                'midtrans_order_id' => $newOrderId,
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
            ]);

        } catch (\Exception $e) {
            Log::error('Retry Payment Pesanan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran.',
            ], 500);
        }
    }

    /**
     * Generate new snap token for retry payment (Kunjungan).
     */
    public function retryPaymentKunjungan(Kunjungan $kunjungan)
    {
        // Verify ownership
        if ($kunjungan->user_id !== Auth::id()) {
            abort(403);
        }

        if ($kunjungan->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Kunjungan sudah dibayar.',
            ]);
        }

        try {
            $newOrderId = 'KNJ-' . strtoupper(Str::random(6)) . '-' . time();

            $user = Auth::user();
            $kunjungan->load('tipe');

            $payload = [
                'transaction_details' => [
                    'order_id' => $newOrderId,
                    'gross_amount' => (int) $kunjungan->total_biaya,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                ],
                'item_details' => [
                    [
                        'id' => 'KUNJUNGAN-' . $kunjungan->tipe_id,
                        'name' => 'Kunjungan ' . ($kunjungan->tipe->nama_tipe ?? 'Edukatif'),
                        'price' => (int) $kunjungan->total_biaya,
                        'quantity' => 1,
                    ]
                ],
                'callbacks' => [
                    'finish' => url('/customer/payment/finish'),
                    'unfinish' => url('/customer/payment/unfinish'),
                    'error' => url('/customer/payment/error'),
                ],
            ];

            $snapToken = Snap::getSnapToken($payload);
            
            $kunjungan->update([
                'snap_token' => $snapToken,
                'midtrans_order_id' => $newOrderId,
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
            ]);

        } catch (\Exception $e) {
            Log::error('Retry Payment Kunjungan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran.',
            ], 500);
        }
    }
}
