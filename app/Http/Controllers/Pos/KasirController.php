<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\PosFood;
use App\Models\PosFoodCategory;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\PosPayment;
use App\Models\PosTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KasirController extends Controller
{
    /**
     * Tampilkan Halaman Utama POS Kasir
     */
    public function index()
    {
        // 1. Auto-seed Pempek Palantea jika belum ada di database
        try {
            if (!PosFood::where('nama', 'like', '%Pempek%')->exists()) {
                $snackCat = PosFoodCategory::where('nama_kategori', 'Snack')->first();
                $catId = $snackCat ? $snackCat->id : 4;
                PosFood::create([
                    'category_id' => $catId,
                    'nama' => 'Pempek Palantea (Isi 6 Pcs)',
                    'deskripsi' => '★ Menu Baru - Pempek asli ikan tenggiri disajikan dengan kuah cuko segar (Isi 6 pcs)',
                    'harga' => 30000,
                    'gambar' => 'pos_foods/pempek_palantea.png',
                    'status' => 'Aktif',
                ]);
            }
        } catch (\Throwable $e) {}

        // 2. Pastikan kolom is_served ada di pos_order_items
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'is_served')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN is_served TINYINT(1) NOT NULL DEFAULT 0");
            }
        } catch (\Throwable $e) {}

        $tables = PosTable::with(['activeOrder.items.food', 'activeOrder.cashier', 'activeOrder.payment'])
            ->orderBy('nomor_meja', 'asc')
            ->get();

        $categories = PosFoodCategory::with(['foods' => function ($query) {
            $query->where('status', 'Aktif')->orderBy('nama', 'asc');
        }])->where('status', 'Aktif')->get();

        $activeOrders = PosOrder::with(['table', 'cashier', 'items.food', 'payment'])
            ->whereIn('order_status', ['NEW', 'PROCESSING', 'READY'])
            ->orWhere(function ($query) {
                $query->where('order_status', 'COMPLETED')
                    ->whereDate('updated_at', now()->today());
            })
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('POS/Kasir', [
            'tables' => $tables,
            'categories' => $categories,
            'activeOrders' => $activeOrders,
        ]);
    }

    /**
     * Buat Pesanan Baru dari Kasir
     */
    public function storeOrder(Request $request)
    {
        $request->validate([
            'table_id' => 'required|exists:pos_tables,id',
            'nama_pelanggan' => 'nullable|string|max:100',
            'status_pembayaran' => 'nullable|in:Cash,QRIS,UNPAID',
            'metode_pembayaran' => 'nullable|in:Cash,QRIS',
            'jumlah_bayar' => 'nullable|integer|min:0',
            'items' => 'required|array|min:1',
            'items.*.food_id' => 'required|exists:pos_foods,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.catatan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string|max:500',
        ], [
            'table_id.required' => 'Pilih nomor antrian terlebih dahulu.',
            'items.required' => 'Pesanan tidak boleh kosong.',
            'items.min' => 'Minimal pilih 1 item makanan/minuman.',
        ]);

        try {
            DB::beginTransaction();

            // Pessimistic Locking untuk mencegah double order pada nomor antrian sama
            $table = PosTable::where('id', $request->table_id)->lockForUpdate()->first();

            if (!$table || $table->status !== 'AVAILABLE') {
                DB::rollBack();
                return back()->with('error', 'Nomor Antrian ' . ($table ? $table->nomor_meja : '') . ' sedang terisi atau perlu dibersihkan!');
            }

            // Generate Nomor Pesanan Unik: CP-POS-YYYYMMDD-XXX
            $todayStr = now()->format('Ymd');
            $countToday = PosOrder::whereDate('created_at', now()->today())->count() + 1;
            $orderNumber = 'CP-POS-' . $todayStr . '-' . sprintf('%03d', $countToday);

            // Hitung Total
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $food = PosFood::findOrFail($item['food_id']);

                if ($food->status !== 'Aktif') {
                    DB::rollBack();
                    return back()->with('error', 'Menu "' . $food->nama . '" sedang tidak aktif!');
                }

                $itemSubtotal = $food->harga * $item['jumlah'];
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'food_id' => $food->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $food->harga, // Snapshot harga saat transaksi
                    'subtotal' => $itemSubtotal,
                    'catatan' => $item['catatan'] ?? null,
                ];
            }

            // Tentukan status pembayaran awal (PAID jika pilih Cash/QRIS, UNPAID jika pilih Belum Dibayar)
            $selectedStatus = $request->status_pembayaran ?: ($request->metode_pembayaran ?: 'UNPAID');
            $paymentStatus = in_array($selectedStatus, ['Cash', 'QRIS']) ? 'PAID' : 'UNPAID';
            $metodePembayaran = in_array($selectedStatus, ['Cash', 'QRIS']) ? $selectedStatus : 'Cash';

            // Create Order
            $order = PosOrder::create([
                'nomor_pesanan' => $orderNumber,
                'nama_pelanggan' => $request->nama_pelanggan ?: 'Pelanggan',
                'table_id' => $table->id,
                'cashier_id' => Auth::id(),
                'order_status' => 'NEW',
                'payment_status' => $paymentStatus,
                'metode_pembayaran' => $metodePembayaran,
                'subtotal' => $subtotal,
                'diskon' => 0,
                'total' => $subtotal,
                'catatan' => $request->catatan,
            ]);

            // If paid directly (Cash/QRIS), create PosPayment record
            if ($paymentStatus === 'PAID') {
                $jumlahBayarVal = ($request->filled('jumlah_bayar') && (int)$request->jumlah_bayar > 0)
                    ? max($subtotal, (int)$request->jumlah_bayar)
                    : $subtotal;
                $kembalianVal = $metodePembayaran === 'Cash' ? max(0, $jumlahBayarVal - $subtotal) : 0;

                PosPayment::create([
                    'order_id' => $order->id,
                    'cashier_id' => Auth::id(),
                    'metode_pembayaran' => $metodePembayaran,
                    'jumlah_bayar' => $jumlahBayarVal,
                    'kembalian' => $kembalianVal,
                    'paid_at' => now(),
                    'status' => 'SUCCESS',
                ]);
            }

            // Create Order Items
            foreach ($itemsData as $item) {
                $order->items()->create($item);
            }

            // Update Table Status -> OCCUPIED
            $table->update(['status' => 'OCCUPIED']);

            $order->load(['table', 'cashier', 'items.food', 'payment']);

            DB::commit();

            return back()->with('success', 'Pesanan ' . $orderNumber . ' (No. Antrian ' . $table->nomor_meja . ') berhasil dikirim ke Dapur!')
                ->with('latestOrder', $order);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membuat pesanan: ' . $e->getMessage());
        }
    }

    /**
     * Proses Pembayaran Kasir (Setelah customer selesai makan/pesan)
     */
    public function processPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:pos_orders,id',
            'metode_pembayaran' => 'required|in:Cash,QRIS',
            'jumlah_bayar' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $request->order_id)->lockForUpdate()->first();

            if (!$order) {
                DB::rollBack();
                return back()->with('error', 'Pesanan tidak ditemukan.');
            }

            if ($order->payment_status === 'PAID') {
                DB::rollBack();
                return back()->with('error', 'Pesanan ini sudah dibayar sebelumnya.');
            }

            if ($request->jumlah_bayar < $order->total) {
                DB::rollBack();
                return back()->with('error', 'Jumlah pembayaran kurang dari total tagihan (Rp ' . number_format($order->total, 0, ',', '.') . ').');
            }

            $kembalian = $request->jumlah_bayar - $order->total;

            // Save Payment Record
            PosPayment::create([
                'order_id' => $order->id,
                'cashier_id' => Auth::id(),
                'metode_pembayaran' => $request->metode_pembayaran,
                'jumlah_bayar' => $request->jumlah_bayar,
                'kembalian' => $kembalian,
                'paid_at' => now(),
                'status' => 'SUCCESS',
            ]);

            // Update Order Status: PAYMENT = PAID, ORDER = COMPLETED
            $order->update([
                'metode_pembayaran' => $request->metode_pembayaran,
                'payment_status' => 'PAID',
                'order_status' => 'COMPLETED',
            ]);

            // Update Table Status -> NEEDS_CLEANING
            $table = PosTable::find($order->table_id);
            if ($table) {
                $table->update(['status' => 'NEEDS_CLEANING']);
            }

            DB::commit();

            return back()->with('success', 'Pembayaran berhasil! Kembalian: Rp ' . number_format($kembalian, 0, ',', '.') . '. Meja ' . ($table ? $table->nomor_meja : '') . ' kini perlu dibersihkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Batal Pesanan (Jika belum diproses/bayar)
     */
    public function cancelOrder(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status === 'PAID') {
                DB::rollBack();
                return back()->with('error', 'Pesanan yang sudah dibayar tidak dapat dibatalkan!');
            }

            $order->update(['order_status' => 'CANCELLED']);

            // Free table if no other active order
            $table = PosTable::find($order->table_id);
            if ($table) {
                $table->update(['status' => 'AVAILABLE']);
            }

            DB::commit();

            return back()->with('success', 'Pesanan ' . $order->nomor_pesanan . ' berhasil dibatalkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membatalkan pesanan: ' . $e->getMessage());
        }
    }

    /**
     * Fetch active tables & orders as JSON for polling
     */
    public function jsonState()
    {
        $tables = PosTable::with(['activeOrder.items.food', 'activeOrder.cashier', 'activeOrder.payment'])
            ->orderBy('nomor_meja', 'asc')
            ->get();

        $activeOrders = PosOrder::with(['table', 'cashier', 'items.food', 'payment'])
            ->whereIn('order_status', ['NEW', 'PROCESSING', 'READY'])
            ->latest()
            ->get();

        return response()->json([
            'tables' => $tables,
            'activeOrders' => $activeOrders,
        ]);
    }
}
