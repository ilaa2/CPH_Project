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
            'tablesNeedingCleaning' => $tablesNeedingCleaning,
        ]);
    }

    /**
     * Update Status Order (NEW -> PROCESSING -> READY)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'order_status' => 'required|in:PROCESSING,READY,COMPLETED',
        ]);

        try {
            DB::beginTransaction();

            $order = PosOrder::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($request->order_status === 'PROCESSING' && $order->order_status !== 'NEW') {
                DB::rollBack();
                return back()->with('error', 'Status pesanan tidak dapat diubah ke Diproses.');
            }

            if ($request->order_status === 'READY' && $order->order_status !== 'PROCESSING') {
                DB::rollBack();
                return back()->with('error', 'Pesanan harus diproses terlebih dahulu sebelum ditandai Siap.');
            }

            if ($request->order_status === 'COMPLETED' && !in_array($order->order_status, ['READY', 'PROCESSING'])) {
                DB::rollBack();
                return back()->with('error', 'Pesanan belum siap untuk diselesaikan.');
            }

            $order->update(['order_status' => $request->order_status]);

            // Jika pesanan diselesaikan oleh Dapur/Staff, tandai nomor antrian perlu dikembalikan / diselesaikan
            if ($request->order_status === 'COMPLETED' && $order->table) {
                $order->table->update(['status' => 'NEEDS_CLEANING']);
            }

            DB::commit();

            $statusText = $request->order_status === 'PROCESSING' ? 'mulai diproses' : ($request->order_status === 'READY' ? 'siap disajikan' : 'telah diserahkan / selesai');
            return back()->with('success', 'Pesanan No. Antrian ' . $order->table->nomor_meja . ' ' . $statusText . '!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengubah status pesanan: ' . $e->getMessage());
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
