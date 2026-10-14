<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\PosOrder;
use App\Models\PosTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KitchenController extends Controller
{
    /**
     * Tampilkan Kitchen Display System (KDS) Dapur
     */
    public function index()
    {
        // Pastikan kolom is_served ada di database hosting
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'is_served')) {
                DB::statement("ALTER TABLE pos_order_items ADD COLUMN is_served TINYINT(1) NOT NULL DEFAULT 0");
            }
        } catch (\Throwable $e) {}

        $newOrders = PosOrder::with(['table', 'cashier', 'items.food'])
            ->where('order_status', 'NEW')
            ->orderBy('created_at', 'asc')
            ->get();

        // Ambil pesanan yang sedang diproses (termasuk legacy READY jika ada)
        $processingOrders = PosOrder::with(['table', 'cashier', 'items.food'])
            ->whereIn('order_status', ['PROCESSING', 'READY'])
            ->orderBy('updated_at', 'asc')
            ->get();

        // Pesanan yang sudah selesai hari ini (untuk riwayat dapur)
        $completedOrders = PosOrder::with(['table', 'cashier', 'items.food', 'payment'])
            ->where('order_status', 'COMPLETED')
            ->whereDate('updated_at', now()->today())
            ->orderBy('updated_at', 'desc')
            ->take(30)
            ->get();

        $readyOrders = [];

        $tablesNeedingCleaning = PosTable::with(['orders' => function ($q) {
            $q->latest()->limit(1);
        }])
            ->where('status', 'NEEDS_CLEANING')
            ->orderBy('nomor_meja', 'asc')
            ->get();

        return Inertia::render('POS/Kitchen', [
            'newOrders' => $newOrders,
            'processingOrders' => $processingOrders,
            'readyOrders' => $readyOrders,
            'completedOrders' => $completedOrders,
            'tablesNeedingCleaning' => $tablesNeedingCleaning,
        ]);
    }

    /**
     * Update Status Order (NEW -> PROCESSING -> COMPLETED)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        // Fitur Antar Sebagian: Toggle status per-item menu
        if ($request->has('toggle_item_id')) {
            return $this->toggleItemServed($request->toggle_item_id);
        }

        $request->validate([
            'order_status' => 'required|in:PROCESSING,READY,COMPLETED',
        ]);

        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            // Memulai proses masak
            if ($request->order_status === 'PROCESSING' && !in_array($order->order_status, ['NEW', 'COMPLETED'])) {
                DB::rollBack();
                return back()->with('error', 'Status pesanan tidak dapat diubah ke Diproses.');
            }

            // Jika dikembalikan dari COMPLETED ke PROCESSING
            if ($request->order_status === 'PROCESSING' && $order->order_status === 'COMPLETED') {
                if ($order->table && $order->table->status === 'NEEDS_CLEANING') {
                    $order->table->update(['status' => 'OCCUPIED']);
                }
            }

            if ($request->order_status === 'COMPLETED' && !in_array($order->order_status, ['READY', 'PROCESSING'])) {
                DB::rollBack();
                return back()->with('error', 'Pesanan belum siap untuk diselesaikan.');
            }

            $order->update(['order_status' => $request->order_status]);

            // Jika pesanan ditandai COMPLETED, tandai semua item sudah disajikan
            if (in_array($request->order_status, ['READY', 'COMPLETED'])) {
                try {
                    $order->items()->update(['is_served' => true]);
                } catch (\Throwable $e) {}
            }

            // Jika pesanan diselesaikan oleh Dapur/Staff dan sudah lunas, nomor antrian siap dibersihkan/dikembalikan
            if ($request->order_status === 'COMPLETED' && $order->table) {
                if ($order->payment_status === 'PAID') {
                    $order->table->update(['status' => 'NEEDS_CLEANING']);
                }
            }

            DB::commit();

            $statusText = $request->order_status === 'PROCESSING' ? 'mulai diproses' : 'telah diserahkan / selesai';
            return back()->with('success', 'Pesanan No. Antrian ' . ($order->table->nomor_meja ?? '') . ' ' . $statusText . '!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengubah status pesanan: ' . $e->getMessage());
        }
    }

    /**
     * Tandai Item Tertentu Selesai Dimasak / Sudah Diantar Duluan
     * Jika semua item sudah diantar, pesanan OTOMATIS SELESAI!
     */
    public function toggleItemServed($itemId)
    {
        try {
            $item = \App\Models\PosOrderItem::with(['food', 'order.table'])->findOrFail($itemId);

            // Self-healing jika kolom is_served belum ada di MySQL hosting
            try {
                $item->is_served = !$item->is_served;
                $item->save();
            } catch (\Illuminate\Database\QueryException $e) {
                if (str_contains($e->getMessage(), 'is_served') || str_contains($e->getMessage(), '1054')) {
                    DB::statement("ALTER TABLE pos_order_items ADD COLUMN is_served TINYINT(1) NOT NULL DEFAULT 0");
                    $item->is_served = !$item->is_served;
                    $item->save();
                } else {
                    throw $e;
                }
            }

            $order = $item->order;
            $allCount = $order->items()->count();
            $servedCount = $order->items()->where('is_served', true)->count();
            $tableNum = $order->table ? $order->table->nomor_meja : '';

            // JIKA SEMUA ITEM SUDAH DIANTAR: OTOMATIS SELESAIKAN PESANAN!
            if ($item->is_served && $allCount > 0 && $servedCount === $allCount) {
                $order->update(['order_status' => 'COMPLETED']);
                if ($order->table && $order->payment_status === 'PAID') {
                    $order->table->update(['status' => 'NEEDS_CLEANING']);
                }
                $msg = "🎉 Semua menu No. Antrian {$tableNum} selesai diantar! Pesanan otomatis diselesaikan.";
                return back()->with('success', $msg);
            }

            // JIKA DIBATALKAN DARI COMPLETED (Koki membatalkan checklist di modal riwayat)
            if (!$item->is_served && $order->order_status === 'COMPLETED') {
                $order->update(['order_status' => 'PROCESSING']);
                if ($order->table && $order->table->status === 'NEEDS_CLEANING') {
                    $order->table->update(['status' => 'OCCUPIED']);
                }
                $msg = "↩️ {$item->food->nama} dikembalikan ke antrian masak No. {$tableNum}.";
                return back()->with('success', $msg);
            }

            $msg = $item->is_served
                ? "🍽️ {$item->food->nama} ({$item->jumlah}x) diantar ke No. Antrian {$tableNum}! ({$servedCount}/{$allCount} item selesai)"
                : "↩️ {$item->food->nama} dikembalikan ke antrian masak.";

            return back()->with('success', $msg);
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui status hidangan: ' . $e->getMessage());
        }
    }

    /**
     * Dapur/Staff membersihkan meja (NEEDS_CLEANING -> AVAILABLE)
     */
    public function cleanTable(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $table = PosTable::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($table->status !== 'NEEDS_CLEANING') {
                DB::rollBack();
                return back()->with('error', 'Meja ' . $table->nomor_meja . ' tidak dalam status perlu dibersihkan.');
            }

            $table->update(['status' => 'AVAILABLE']);

            DB::commit();

            return back()->with('success', 'Meja ' . $table->nomor_meja . ' telah dibersihkan dan siap digunakan kembali!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengubah status meja: ' . $e->getMessage());
        }
    }

    /**
     * Endpoint API JSON untuk Polling KDS (Real-time update tiap 5 detik)
     */
    public function jsonState()
    {
        $newOrders = PosOrder::with(['table', 'cashier', 'items.food'])
            ->where('order_status', 'NEW')
            ->orderBy('created_at', 'asc')
            ->get();

        $processingOrders = PosOrder::with(['table', 'cashier', 'items.food'])
            ->where('order_status', 'PROCESSING')
            ->orderBy('updated_at', 'asc')
            ->get();

        $readyOrders = PosOrder::with(['table', 'cashier', 'items.food'])
            ->where('order_status', 'READY')
            ->orderBy('updated_at', 'desc')
            ->take(20)
            ->get();

        $tablesNeedingCleaning = PosTable::where('status', 'NEEDS_CLEANING')
            ->orderBy('nomor_meja', 'asc')
            ->get();

        return response()->json([
            'newOrders' => $newOrders,
            'processingOrders' => $processingOrders,
            'readyOrders' => $readyOrders,
            'tablesNeedingCleaning' => $tablesNeedingCleaning,
            'totalNew' => $newOrders->count(),
        ]);
    }
}
