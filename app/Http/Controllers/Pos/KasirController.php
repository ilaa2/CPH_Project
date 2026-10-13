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
    private function ensureColumnsExist()
    {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'cash_amount')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN cash_amount INT NOT NULL DEFAULT 0");
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'qris_amount')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN qris_amount INT NOT NULL DEFAULT 0");
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'catatan_koreksi')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN catatan_koreksi TEXT NULL");
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'status')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'");
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'batal_alasan')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN batal_alasan VARCHAR(255) NULL");
            }
        } catch (\Exception $e) {
            // Ignore jika sudah ada
        }
    }

    public function storeOrder(Request $request)
    {
        $this->ensureColumnsExist();

        $request->validate([
            'table_id' => 'required|exists:pos_tables,id',
            'nama_pelanggan' => 'nullable|string|max:100',
            'status_pembayaran' => 'nullable|in:Cash,QRIS,SPLIT,UNPAID',
            'metode_pembayaran' => 'nullable|in:Cash,QRIS,SPLIT',
            'jumlah_bayar' => 'nullable|integer|min:0',
            'cash_amount' => 'nullable|integer|min:0',
            'qris_amount' => 'nullable|integer|min:0',
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

            // Generate Nomor Pesanan Unik: CP-POS-YYYYMMDD-XXX (Anti-Collision & Auto-Increment)
            $todayStr = now()->format('Ymd');
            $prefix = 'CP-POS-' . $todayStr . '-';

            // Ambil nomor pesanan tertinggi hari ini untuk mencegah bentrok duplicate entry
            $lastOrder = PosOrder::where('nomor_pesanan', 'like', $prefix . '%')
                ->orderBy('id', 'desc')
                ->lockForUpdate()
                ->first();

            $nextNum = 1;
            if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->nomor_pesanan, $matches)) {
                $nextNum = ((int) $matches[1]) + 1;
            }

            // Loop guard: pastikan nomor pesanan benar-benar belum ada di database
            do {
                $orderNumber = $prefix . sprintf('%03d', $nextNum);
                $exists = PosOrder::where('nomor_pesanan', $orderNumber)->exists();
                if ($exists) {
                    $nextNum++;
                }
            } while ($exists);

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
                    'harga_satuan' => $food->harga,
                    'subtotal' => $itemSubtotal,
                    'catatan' => $item['catatan'] ?? null,
                    'is_served' => 0,
                    'status' => 'ACTIVE',
                ];
            }

            // Tentukan status pembayaran awal
            $selectedStatus = $request->status_pembayaran ?: ($request->metode_pembayaran ?: 'UNPAID');
            $paymentStatus = in_array($selectedStatus, ['Cash', 'QRIS', 'SPLIT']) ? 'PAID' : 'UNPAID';
            $metodePembayaran = in_array($selectedStatus, ['Cash', 'QRIS', 'SPLIT']) ? $selectedStatus : 'Cash';

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

            // If paid directly (Cash/QRIS/SPLIT), create PosPayment record
            if ($paymentStatus === 'PAID') {
                $cashAmount = (int) ($request->cash_amount ?? 0);
                $qrisAmount = (int) ($request->qris_amount ?? 0);

                if ($metodePembayaran === 'SPLIT') {
                    $totalBayar = $cashAmount + $qrisAmount;
                    $kembalianVal = max(0, $totalBayar - $subtotal);
                } elseif ($metodePembayaran === 'QRIS') {
                    $totalBayar = $qrisAmount > 0 ? $qrisAmount : (($request->filled('jumlah_bayar') && (int)$request->jumlah_bayar > 0) ? (int)$request->jumlah_bayar : $subtotal);
                    $qrisAmount = $totalBayar;
                    $kembalianVal = max(0, $totalBayar - $subtotal);
                } else {
                    $totalBayar = $cashAmount > 0 ? $cashAmount : (($request->filled('jumlah_bayar') && (int)$request->jumlah_bayar > 0) ? (int)$request->jumlah_bayar : $subtotal);
                    $cashAmount = $totalBayar;
                    $kembalianVal = max(0, $totalBayar - $subtotal);
                }

                PosPayment::create([
                    'order_id' => $order->id,
                    'cashier_id' => Auth::id(),
                    'metode_pembayaran' => $metodePembayaran,
                    'jumlah_bayar' => $totalBayar,
                    'cash_amount' => $cashAmount,
                    'qris_amount' => $qrisAmount,
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
        $this->ensureColumnsExist();

        $request->validate([
            'order_id' => 'required|exists:pos_orders,id',
            'metode_pembayaran' => 'required|in:Cash,QRIS,SPLIT',
            'jumlah_bayar' => 'nullable|integer|min:0',
            'cash_amount' => 'nullable|integer|min:0',
            'qris_amount' => 'nullable|integer|min:0',
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

            $metode = $request->metode_pembayaran;
            $cashAmount = (int) ($request->cash_amount ?? 0);
            $qrisAmount = (int) ($request->qris_amount ?? 0);

            if ($metode === 'SPLIT') {
                $totalBayar = $cashAmount + $qrisAmount;
            } elseif ($metode === 'QRIS') {
                $totalBayar = $qrisAmount > 0 ? $qrisAmount : ((int)$request->jumlah_bayar ?: $order->total);
                $qrisAmount = $totalBayar;
            } else {
                $totalBayar = $cashAmount > 0 ? $cashAmount : ((int)$request->jumlah_bayar ?: $order->total);
                $cashAmount = $totalBayar;
            }

            if ($totalBayar < $order->total) {
                DB::rollBack();
                return back()->with('error', 'Jumlah pembayaran (Rp ' . number_format($totalBayar, 0, ',', '.') . ') kurang dari total tagihan (Rp ' . number_format($order->total, 0, ',', '.') . ').');
            }

            $kembalian = max(0, $totalBayar - $order->total);

            // Save Payment Record
            PosPayment::create([
                'order_id' => $order->id,
                'cashier_id' => Auth::id(),
                'metode_pembayaran' => $metode,
                'jumlah_bayar' => $totalBayar,
                'cash_amount' => $cashAmount,
                'qris_amount' => $qrisAmount,
                'kembalian' => $kembalian,
                'paid_at' => now(),
                'status' => 'SUCCESS',
            ]);

            // Update Order Status: PAYMENT = PAID, ORDER = COMPLETED
            $order->update([
                'metode_pembayaran' => $metode,
                'payment_status' => 'PAID',
                'order_status' => 'COMPLETED',
            ]);

            // Update Table Status -> AVAILABLE (meja langsung kosong & siap untuk customer berikutnya)
            $table = PosTable::find($order->table_id);
            if ($table && in_array($table->status, ['OCCUPIED', 'NEEDS_CLEANING'])) {
                $table->update(['status' => 'AVAILABLE']);
            }

            DB::commit();

            return back()->with('success', 'Pembayaran berhasil! Kembalian: Rp ' . number_format($kembalian, 0, ',', '.') . '. Meja ' . ($table ? $table->nomor_meja : '') . ' kini kosong & siap digunakan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Tambah Menu ke Pesanan Aktif (Meja sudah pesan dan mau nambah makanan/minuman)
     */
    public function addItemsToOrder(Request $request, $id)
    {
        $this->ensureColumnsExist();

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.food_id' => 'required|exists:pos_foods,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.catatan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($order->order_status === 'CANCELLED') {
                DB::rollBack();
                return back()->with('error', 'Pesanan yang sudah dibatalkan tidak dapat ditambah menu!');
            }

            $addedSubtotal = 0;
            $newAddedItems = [];

            foreach ($request->items as $item) {
                $food = PosFood::findOrFail($item['food_id']);

                if ($food->status !== 'Aktif') {
                    DB::rollBack();
                    return back()->with('error', 'Menu "' . $food->nama . '" sedang tidak aktif!');
                }

                $itemSubtotal = $food->harga * $item['jumlah'];
                $addedSubtotal += $itemSubtotal;

                $createdItem = $order->items()->create([
                    'food_id' => $food->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $food->harga,
                    'subtotal' => $itemSubtotal,
                    'catatan' => $item['catatan'] ?? null,
                    'is_served' => 0,
                    'status' => 'ACTIVE',
                ]);
                $createdItem->load('food');
                $newAddedItems[] = $createdItem;
            }

            $order->subtotal += $addedSubtotal;
            $order->total += $addedSubtotal;

            // Jika sebelumnya COMPLETED atau PAID, jika ada menu tambahan maka status dapur kembali PROCESSING
            if ($order->order_status === 'COMPLETED') {
                $order->order_status = 'PROCESSING';
                // Jika meja tadi NEEDS_CLEANING, ubah kembali jadi OCCUPIED
                if ($order->table) {
                    $order->table->update(['status' => 'OCCUPIED']);
                }
            }

            $order->save();
            $order->load(['table', 'cashier', 'items.food', 'payment']);

            DB::commit();

            return back()->with('success', 'Berhasil menambahkan menu ke No. Antrian ' . ($order->table ? $order->table->nomor_meja : '') . '!')
                ->with('latestOrder', $order)
                ->with('newAddedItems', $newAddedItems);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambah menu: ' . $e->getMessage());
        }
    }

    /**
     * Batal Item Tertentu dalam Pesanan (Cancel per menu)
     */
    public function cancelOrderItem(Request $request, $id)
    {
        $this->ensureColumnsExist();

        $request->validate([
            'alasan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $item = PosOrderItem::with('order.table', 'food')->where('id', $id)->lockForUpdate()->firstOrFail();
            $order = $item->order;

            if ($item->status === 'CANCELLED') {
                DB::rollBack();
                return back()->with('error', 'Item ini sudah dibatalkan sebelumnya.');
            }

            // Tandai item sebagai CANCELLED
            $item->update([
                'status' => 'CANCELLED',
                'batal_alasan' => $request->alasan ?: 'Dibatalkan oleh kasir/pelanggan',
            ]);

            // Kurangi subtotal & total order
            $order->subtotal = max(0, $order->subtotal - $item->subtotal);
            $order->total = max(0, $order->total - $item->subtotal);
            $order->save();

            // Cek apakah masih ada item aktif
            $activeCount = $order->items()->where('status', 'ACTIVE')->count();
            if ($activeCount === 0) {
                $order->update(['order_status' => 'CANCELLED']);
                if ($order->table) {
                    $order->table->update(['status' => 'AVAILABLE']);
                }
            }

            DB::commit();

            return back()->with('success', 'Menu ' . ($item->food ? $item->food->nama : '') . ' berhasil dibatalkan. Total tagihan diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membatalkan item: ' . $e->getMessage());
        }
    }

    /**
     * Batal Seluruh Pesanan (Cancel pesanan)
     */
    public function cancelOrder(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            // Batalkan semua item
            $order->items()->update(['status' => 'CANCELLED', 'batal_alasan' => 'Pesanan dibatalkan']);

            // Jika ada pembayaran, tandai FAILED
            if ($order->payment) {
                $order->payment->update(['status' => 'FAILED']);
            }

            $order->update([
                'order_status' => 'CANCELLED',
            ]);

            // Free table
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

    /**
     * Tampilan Monitor & Kelola Status Pesanan (Pengganti Layar Dapur untuk Kasir)
     */
    public function monitor()
    {
        $this->ensureColumnsExist();

        $tables = PosTable::with(['activeOrder.items.food', 'activeOrder.cashier', 'activeOrder.payment'])
            ->orderBy('nomor_meja', 'asc')
            ->get();

        $activeOrders = PosOrder::with(['table', 'cashier', 'items.food', 'payment'])
            ->where(function($q) {
                $q->whereIn('order_status', ['NEW', 'PROCESSING', 'READY'])
                  ->orWhere('payment_status', 'UNPAID')
                  ->orWhere(function($sub) {
                      $sub->where('order_status', 'COMPLETED')
                          ->whereDate('updated_at', now()->today());
                  });
            })
            ->where('order_status', '!=', 'CANCELLED')
            ->latest()
            ->take(60)
            ->get();

        return Inertia::render('POS/OrderMonitor', [
            'tables' => $tables,
            'activeOrders' => $activeOrders,
        ]);
    }

    /**
     * Selesaikan Pesanan dari Kasir
     */
    public function completeOrder(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            // Tandai semua item aktif menjadi sudah diantar
            $order->items()->where('status', 'ACTIVE')->update(['is_served' => 1]);

            $order->update([
                'order_status' => 'COMPLETED'
            ]);

            // Jika pesanan sudah lunas, langsung kosongkan nomor antrian
            if ($order->payment_status === 'PAID' && $order->table) {
                $order->table->update(['status' => 'AVAILABLE']);
            }

            DB::commit();

            return back()->with('success', 'Pesanan ' . $order->nomor_pesanan . ' (No. Antrian ' . ($order->table ? $order->table->nomor_meja : '') . ') berhasil diselesaikan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyelesaikan pesanan: ' . $e->getMessage());
        }
    }

    /**
     * Reset / Kosongkan Meja Antrian
     */
    public function resetTable(Request $request, $id)
    {
        try {
            $table = PosTable::findOrFail($id);
            $table->update(['status' => 'AVAILABLE']);

            return back()->with('success', 'Nomor Antrian ' . $table->nomor_meja . ' kini KOSONG & siap digunakan kembali.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mereset nomor antrian: ' . $e->getMessage());
        }
    }

    /**
     * Checklist / Toggle Status Menu Diantar dari Kasir
     */
    public function toggleOrderItemServed(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $item = PosOrderItem::findOrFail($id);
            $item->update(['is_served' => $item->is_served ? 0 : 1]);

            $order = $item->order;
            if ($order) {
                $activeItems = $order->items()->where('status', 'ACTIVE')->get();
                $allServed = $activeItems->count() > 0 && $activeItems->every(fn($i) => (bool)$i->is_served);

                if ($allServed && $order->order_status !== 'COMPLETED') {
                    $order->update(['order_status' => 'COMPLETED']);
                    if ($order->payment_status === 'PAID' && $order->table) {
                        $order->table->update(['status' => 'AVAILABLE']);
                    }
                }
            }

            DB::commit();

            return back()->with('success', 'Status menu ' . ($item->food ? $item->food->nama : '') . ' diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui status menu: ' . $e->getMessage());
        }
    }
}
