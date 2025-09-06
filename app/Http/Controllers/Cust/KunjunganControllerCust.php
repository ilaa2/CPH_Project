<?php

namespace App\Http\Controllers\Cust;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TipeKunjungan;
use App\Models\Kunjungan;
use Illuminate\Support\Facades\Auth;

class KunjunganControllerCust extends Controller
{
    // ... method index() dan handleForm() tidak perlu diubah ...

    public function showKonfirmasi()
    {
        $validated = session()->get('form_data_kunjungan');
        if (!$validated) {
            return redirect()->route('customer.kunjungan.index');
        }
        $detailTipe = TipeKunjungan::find($validated['tipe_kunjungan_id']);

        // ==========================================================
        // UBAH PERHITUNGAN BIAYA DI SINI
        // ==========================================================
        $biayaPerOrang = 15000; // Tetapkan biaya per orang
        $totalBiaya = $biayaPerOrang * $validated['jumlah_pengunjung'];

        $validated['nama_tipe'] = $detailTipe->nama_tipe;
        $validated['biaya_per_orang'] = $biayaPerOrang;
        $validated['total_biaya'] = $totalBiaya;
        // ==========================================================

        return inertia('Customer/KunjunganKonfirmasi', [
            'dataKunjungan' => $validated,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap'      => 'required|string|max:255',
            'no_hp'             => 'required|string|max:15',
            'tanggal_kunjungan' => 'required|date|after_or_equal:today',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'jumlah_pengunjung' => 'required|integer|min:1',
        ]);

        // ==========================================================
        // UBAH PERHITUNGAN BIAYA DI SINI JUGA
        // ==========================================================
        $biayaPerOrang = 15000;
        $totalBiaya = $biayaPerOrang * $validated['jumlah_pengunjung'];

        $tipeKunjungan = TipeKunjungan::find($validated['tipe_kunjungan_id']);
        // ==========================================================

        Kunjungan::create([
            'pelanggan_id'      => Auth::guard('pelanggan')->id(),
            'tipe_id'           => $validated['tipe_kunjungan_id'],
            'judul'             => $tipeKunjungan->nama_tipe,
            'deskripsi'         => 'Kunjungan oleh ' . $validated['nama_lengkap'],
            'tanggal'           => $validated['tanggal_kunjungan'],
            'jam'               => '09:00:00',
            'jumlah_pengunjung' => $validated['jumlah_pengunjung'],
            'total_biaya'       => $totalBiaya, // Gunakan total biaya yang baru
            'status'            => 'dijadwalkan',
        ]);

        session()->forget('form_data_kunjungan');
        return redirect()->route('customer.kunjungan.index')
            ->with('success', 'Kunjungan Anda telah berhasil dijadwalkan!');
    }
}
