<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Snap;

class MidtransController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Handle notification/callback dari Midtrans.
     * Endpoint ini dipanggil oleh server Midtrans setiap ada update status.
     */
    public function notification(Request $request)
    {
        try {
            $notification = new Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type;

            Log::info('Midtrans Notification Received', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'fraud' => $fraudStatus,
                'payment_type' => $paymentType,
            ]);

            // Determine payment status based on Midtrans status
            $paymentStatus = $this->mapTransactionStatus($transactionStatus, $fraudStatus);

            // Try to find Pesanan first
            $pesanan = Pesanan::where('midtrans_order_id', $orderId)->first();
            if ($pesanan) {
                $pesanan->update([
                    'payment_status' => $paymentStatus,
                    'paid_at' => in_array($paymentStatus, ['paid']) ? now() : null,
                ]);

                // Update order status based on payment
                if ($paymentStatus === 'paid') {
                    $pesanan->update(['status' => 'processed']);
                    
                    // === KURANGI STOK SAAT SETTLEMENT ===
                    // Stok produk dikurangi hanya setelah pembayaran berhasil
                    foreach ($pesanan->items as $item) {
                        $produk = \App\Models\Produk::find($item->produk_id);
                        if ($produk && $produk->stok >= $item->jumlah) {
                            $produk->decrement('stok', $item->jumlah);
                            Log::info("Stock reduced: {$produk->nama} - {$item->jumlah} units");
                        }
                    }
                } elseif (in_array($paymentStatus, ['failed', 'expired'])) {
                    $pesanan->update(['status' => 'pending']); // Keep pending, allow retry
                }

                Log::info('Pesanan updated', ['id' => $pesanan->id, 'payment_status' => $paymentStatus]);
                return response()->json(['message' => 'Pesanan notification handled']);
            }

            // Try to find Kunjungan
            $kunjungan = Kunjungan::where('midtrans_order_id', $orderId)->first();
            if ($kunjungan) {
                $kunjungan->update([
                    'payment_status' => $paymentStatus,
                    'paid_at' => in_array($paymentStatus, ['paid']) ? now() : null,
                ]);

                // Update visit status based on payment
                if ($paymentStatus === 'paid') {
                    $kunjungan->update(['status' => 'Dijadwalkan']);
                }

                Log::info('Kunjungan updated', ['id' => $kunjungan->id, 'payment_status' => $paymentStatus]);
                return response()->json(['message' => 'Kunjungan notification handled']);
            }

            Log::warning('Order ID not found in database', ['order_id' => $orderId]);
            return response()->json(['message' => 'Order not found'], 404);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing notification'], 500);
        }
    }

    /**
     * Map Midtrans transaction status to internal payment status.
     */
    private function mapTransactionStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        if ($transactionStatus === 'capture') {
            return ($fraudStatus === 'accept') ? 'paid' : 'pending';
        } elseif ($transactionStatus === 'settlement') {
            return 'paid';
        } elseif ($transactionStatus === 'pending') {
            return 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'cancel'])) {
            return 'failed';
        } elseif ($transactionStatus === 'expire') {
            return 'expired';
        }
        return 'unpaid';
    }

    /**
     * Generate new snap token for retry payment (Pesanan).
     */
    public function retryPaymentPesanan(Request $request, Pesanan $pesanan)
    {
        try {
            if (!in_array($pesanan->payment_status, ['unpaid', 'pending', 'failed', 'expired'])) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json(['error' => 'Pesanan ini sudah dibayar.'], 400);
                }
                return back()->withErrors(['message' => 'Pesanan ini sudah dibayar.']);
            }

            $orderId = 'ORD-' . $pesanan->id . '-' . time();

            $payload = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) $pesanan->total,
                ],
                'customer_details' => [
                    'first_name' => $pesanan->pelanggan->nama ?? 'Customer',
                    'email' => $pesanan->pelanggan->email ?? 'customer@example.com',
                    'phone' => $pesanan->pelanggan->telepon ?? '',
                ],
                'callbacks' => [
                    'finish' => url('/customer/payment/finish'),
                    'unfinish' => url('/customer/payment/unfinish'),
                    'error' => url('/customer/payment/error'),
                ],
            ];

            $snapToken = Snap::getSnapToken($payload);

            $pesanan->update([
                'snap_token' => $snapToken,
                'midtrans_order_id' => $orderId,
                'payment_status' => 'pending',
            ]);

            Log::info('Retry Payment Success', [
                'pesanan_id' => $pesanan->id,
                'order_id' => $orderId,
                'snap_token' => $snapToken,
            ]);

            // Jika request AJAX, kembalikan JSON langsung
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'snap_token' => $snapToken,
                    'order_id' => $orderId,
                    'message' => 'Token pembayaran baru berhasil dibuat.',
                ]);
            }

            // Return dengan flash data untuk Inertia
            return back()->with('flash', [
                'snap_token' => $snapToken,
                'order_id' => $orderId,
                'success' => 'Token pembayaran baru berhasil dibuat. Silakan lanjutkan pembayaran.',
            ]);

        } catch (\Exception $e) {
            Log::error('Retry Payment Error: ' . $e->getMessage());
            
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['error' => 'Gagal membuat pembayaran: ' . $e->getMessage()], 500);
            }
            
            return back()->withErrors(['message' => 'Gagal membuat pembayaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate new snap token for retry payment (Kunjungan).
     */
    public function retryPaymentKunjungan(Kunjungan $kunjungan)
    {
        try {
            if (!in_array($kunjungan->payment_status, ['unpaid', 'pending', 'failed', 'expired'])) {
                return back()->withErrors(['message' => 'Kunjungan ini sudah dibayar.']);
            }

            $orderId = 'KNJ-' . $kunjungan->id . '-' . time();

            $payload = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) $kunjungan->total_biaya,
                ],
                'customer_details' => [
                    'first_name' => $kunjungan->pelanggan->nama ?? 'Customer',
                    'email' => $kunjungan->pelanggan->email ?? 'customer@example.com',
                    'phone' => $kunjungan->pelanggan->telepon ?? '',
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
                'midtrans_order_id' => $orderId,
                'payment_status' => 'pending',
            ]);

            return back()->with('flash', [
                'snap_token' => $snapToken,
                'order_id' => $orderId,
            ]);

        } catch (\Exception $e) {
            Log::error('Retry Payment Kunjungan Error: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal membuat pembayaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle payment finish callback (GET) - User redirected from Midtrans after completing payment.
     */
    public function paymentFinish(Request $request)
    {
        $orderId = $request->query('order_id');
        $transactionStatus = $request->query('transaction_status');
        $statusCode = $request->query('status_code');

        Log::info('Payment Finish Callback', [
            'order_id' => $orderId,
            'status' => $transactionStatus,
            'status_code' => $statusCode,
        ]);

        // Cari Pesanan atau Kunjungan berdasarkan order_id
        $pesanan = Pesanan::where('midtrans_order_id', $orderId)->first();
        if ($pesanan) {
            // Update status berdasarkan transaction_status
            $paymentStatus = $this->mapTransactionStatusFromQuery($transactionStatus);
            $pesanan->update(['payment_status' => $paymentStatus]);
            
            if ($paymentStatus === 'paid') {
                $pesanan->update(['status' => 'processed', 'paid_at' => now()]);
            }

            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'pesanan',
                'orderId' => $orderId,
                'transactionStatus' => $transactionStatus,
                'paymentStatus' => $paymentStatus,
                'data' => $pesanan->load('items.produk'),
                'redirectUrl' => route('customer.pesanan.show', $pesanan->id),
            ]);
        }

        $kunjungan = Kunjungan::where('midtrans_order_id', $orderId)->first();
        if ($kunjungan) {
            $paymentStatus = $this->mapTransactionStatusFromQuery($transactionStatus);
            $kunjungan->update(['payment_status' => $paymentStatus]);
            
            if ($paymentStatus === 'paid') {
                $kunjungan->update(['status' => 'Dijadwalkan', 'paid_at' => now()]);
            }

            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'kunjungan',
                'orderId' => $orderId,
                'transactionStatus' => $transactionStatus,
                'paymentStatus' => $paymentStatus,
                'data' => $kunjungan->load('tipe'),
                'redirectUrl' => route('customer.kunjungan.show', $kunjungan->id),
            ]);
        }

        // Order not found - redirect to home
        return redirect('/')->with('error', 'Pesanan tidak ditemukan.');
    }

    /**
     * Handle payment unfinish callback (GET) - User closed popup before completing.
     */
    public function paymentUnfinish(Request $request)
    {
        $orderId = $request->query('order_id');
        
        Log::info('Payment Unfinish Callback', ['order_id' => $orderId]);

        $pesanan = Pesanan::where('midtrans_order_id', $orderId)->first();
        if ($pesanan) {
            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'pesanan',
                'orderId' => $orderId,
                'transactionStatus' => 'pending',
                'paymentStatus' => 'pending',
                'data' => $pesanan->load('items.produk'),
                'redirectUrl' => route('customer.pesanan.show', $pesanan->id),
            ]);
        }

        $kunjungan = Kunjungan::where('midtrans_order_id', $orderId)->first();
        if ($kunjungan) {
            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'kunjungan',
                'orderId' => $orderId,
                'transactionStatus' => 'pending',
                'paymentStatus' => 'pending',
                'data' => $kunjungan->load('tipe'),
                'redirectUrl' => route('customer.kunjungan.show', $kunjungan->id),
            ]);
        }

        return redirect('/')->with('error', 'Pesanan tidak ditemukan.');
    }

    /**
     * Handle payment error callback (GET) - Payment failed.
     */
    public function paymentError(Request $request)
    {
        $orderId = $request->query('order_id');
        $transactionStatus = $request->query('transaction_status');
        
        Log::info('Payment Error Callback', [
            'order_id' => $orderId,
            'transaction_status' => $transactionStatus,
        ]);

        // Determine payment status from transaction_status
        $paymentStatus = 'failed';
        if ($transactionStatus === 'expire') {
            $paymentStatus = 'expired';
        }

        $pesanan = Pesanan::where('midtrans_order_id', $orderId)->first();
        if ($pesanan) {
            $pesanan->update(['payment_status' => $paymentStatus]);
            $pesanan->load(['items.produk', 'pelanggan']);
            
            Log::info('Found Pesanan for error callback', ['pesanan_id' => $pesanan->id]);
            
            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'pesanan',
                'orderId' => $orderId,
                'transactionStatus' => $transactionStatus ?? 'error',
                'paymentStatus' => $paymentStatus,
                'data' => $pesanan,
                'redirectUrl' => route('customer.pesanan.show', $pesanan->id),
            ]);
        }

        $kunjungan = Kunjungan::where('midtrans_order_id', $orderId)->first();
        if ($kunjungan) {
            $kunjungan->update(['payment_status' => $paymentStatus]);
            $kunjungan->load(['tipe', 'pelanggan']);
            
            Log::info('Found Kunjungan for error callback', ['kunjungan_id' => $kunjungan->id]);
            
            return inertia('Customer/Payment/PaymentResult', [
                'type' => 'kunjungan',
                'orderId' => $orderId,
                'transactionStatus' => $transactionStatus ?? 'error',
                'paymentStatus' => $paymentStatus,
                'data' => $kunjungan,
                'redirectUrl' => route('customer.kunjungan.show', $kunjungan->id),
            ]);
        }

        Log::warning('Order not found in paymentError', ['order_id' => $orderId]);
        
        // Order not found - redirect to pesanan index
        return redirect()->route('customer.pesanan.index')
            ->with('error', 'Pesanan dengan ID ' . $orderId . ' tidak ditemukan.');
    }

    /**
     * Map transaction status from query parameter.
     */
    private function mapTransactionStatusFromQuery(?string $status): string
    {
        return match ($status) {
            'capture', 'settlement' => 'paid',
            'pending' => 'pending',
            'deny', 'cancel' => 'failed',
            'expire' => 'expired',
            default => 'pending',
        };
    }
}
