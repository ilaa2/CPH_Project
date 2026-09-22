<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\PosTable;
use Illuminate\Http\Request;
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
            'status' => 'required|in:AVAILABLE,OCCUPIED,NEEDS_CLEANING',
        ]);

        $table = PosTable::findOrFail($id);
        $table->update(['status' => $request->status]);

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
