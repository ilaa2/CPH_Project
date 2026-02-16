<?php
/**
 * Fix Payment Status - One-time script
 * Updates pesanan that were paid in Midtrans but not updated in database.
 * 
 * Upload to public/ folder, run once, then DELETE.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    Illuminate\Http\Request::capture()
);

use App\Models\Pesanan;
use Midtrans\Config;
use Midtrans\Transaction;

Config::$serverKey = config('midtrans.server_key');
Config::$isProduction = config('midtrans.is_production');

echo "<h1>Fix Payment Status</h1>";

// Find all pending/unpaid pesanan that have midtrans_order_id
$pendingOrders = Pesanan::whereIn('payment_status', ['pending', 'unpaid'])
    ->whereNotNull('midtrans_order_id')
    ->get();

echo "<p>Found " . $pendingOrders->count() . " pending orders with Midtrans ID</p>";

foreach ($pendingOrders as $pesanan) {
    echo "<hr>";
    echo "<p><strong>Pesanan #{$pesanan->id}</strong> - Order ID: {$pesanan->midtrans_order_id}</p>";
    
    try {
        // Check status directly from Midtrans API
        $status = Transaction::status($pesanan->midtrans_order_id);
        $transactionStatus = $status->transaction_status ?? 'unknown';
        
        echo "<p>Midtrans Status: <strong>{$transactionStatus}</strong></p>";
        
        if (in_array($transactionStatus, ['settlement', 'capture'])) {
            // Payment was successful! Update database
            $pesanan->update([
                'payment_status' => 'paid',
                'status' => 'processed',
                'paid_at' => now(),
            ]);
            
            // Reduce stock
            foreach ($pesanan->items as $item) {
                $produk = \App\Models\Produk::find($item->produk_id);
                if ($produk && $produk->stok >= $item->jumlah) {
                    $produk->decrement('stok', $item->jumlah);
                    echo "<p style='color:blue'>📦 Stok {$produk->nama} dikurangi {$item->jumlah}</p>";
                }
            }
            
            echo "<p style='color:green'>✅ Updated to PAID + PROCESSED!</p>";
        } elseif ($transactionStatus === 'pending') {
            echo "<p style='color:orange'>⏳ Still pending in Midtrans</p>";
        } elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            $pesanan->update(['payment_status' => 'failed']);
            echo "<p style='color:red'>❌ Payment failed/expired, updated status</p>";
        } else {
            echo "<p style='color:gray'>➖ Status: {$transactionStatus}</p>";
        }
    } catch (\Exception $e) {
        echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
    }
}

echo "<hr><h2>Done!</h2>";
echo "<p><strong>⚠️ HAPUS FILE INI SETELAH SELESAI!</strong></p>";
echo "<p><a href='?delete=1'>Klik untuk hapus script ini</a></p>";

if (isset($_GET['delete'])) {
    unlink(__FILE__);
    echo "<p style='color:green'>✅ Script dihapus!</p>";
}
