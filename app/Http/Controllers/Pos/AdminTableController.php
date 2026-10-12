<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\PosTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminTableController extends Controller
{
    /**
     * Tampilkan Manajemen Meja POS (01-30)
     */
    public function index()
    {
        $tables = PosTable::with(['activeOrder.cashier'])
            ->orderBy('nomor_meja', 'asc')
            ->get();

        return Inertia::render('POS/Admin/TableIndex', [
            'tables' => $tables,
        ]);
    }

    /**
     * Update Status Meja Manual oleh Admin
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:AVAILABLE,OCCUPIED,NEEDS_CLEANING,UNAVAILABLE',
        ]);

        $table = PosTable::findOrFail($id);

        try {
            $table->update(['status' => $request->status]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Self-healing jika tipe kolom di MySQL hosting masih ENUM lama
            if (str_contains($e->getMessage(), 'Data truncated') || str_contains($e->getMessage(), '1265')) {
                DB::statement("ALTER TABLE pos_tables MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'");
                $table->update(['status' => $request->status]);
            } else {
                throw $e;
            }
        }

        return back()->with('success', 'Status Meja ' . $table->nomor_meja . ' berhasil diubah menjadi ' . $request->status . '.');
    }

    /**
     * Reset Semua Meja Menjadi AVAILABLE
     */
    public function resetAll()
    {
        PosTable::query()->update(['status' => 'AVAILABLE']);

        return back()->with('success', 'Seluruh 30 meja berhasil di-reset menjadi AVAILABLE!');
    }
}
