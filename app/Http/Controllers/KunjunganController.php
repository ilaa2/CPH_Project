<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\Pelanggan;
use App\Models\TipeKunjungan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KunjunganController extends Controller
{
    public function index()
    {
        return Inertia::render('Kunjungan/Index');
    }

    public function jadwal()
    {
        $data = Kunjungan::with(['pelanggan', 'tipe'])->orderBy('tanggal', 'asc')->get();

        return Inertia::render('Kunjungan/Jadwal', [
            'kunjungan' => $data,
        ]);
    }

    public function kalender()
    {
    $kunjungan = Kunjungan::with('pelanggan')->get();

    return Inertia::render('Kunjungan/Kalender', [
        'kunjungan' => $kunjungan
    ]);
    }


    public function riwayat()
    {
        $data = Kunjungan::with(['pelanggan', 'tipe', 'ulasan'])->where('status', 'Selesai')->get();

        return Inertia::render('Kunjungan/Riwayat', [
            'riwayat' => $data,
        ]);
    }

    public function create()
    {
        $pelanggan = Pelanggan::all();
        $tipe = TipeKunjungan::all();

        return Inertia::render('Kunjungan/Create', [
            'pelanggan' => $pelanggan,
            'tipe' => $tipe,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pelanggan_id' => 'required|exists:pelanggans,id',
            'tipe_id' => 'required|exists:tipe_kunjungan,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal' => 'required|date',
            'jam' => 'required',
            'jumlah_pengunjung' => 'required|integer|min:1',
            'total_biaya' => 'required|numeric|min:0',
            'status' => 'required|in:Dijadwalkan,Selesai,Dibatalkan',
        ]);

        Kunjungan::create($request->all());

        return redirect()->route('kunjungan.jadwal')->with('success', 'Kunjungan berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->delete();

        return redirect()->route('kunjungan.jadwal')->with('success', 'Kunjungan berhasil dihapus.');
    }

    public function edit($id)
    {
        $kunjungan = Kunjungan::with(['pelanggan', 'tipe'])->findOrFail($id);
        $pelanggan = Pelanggan::all();
        $tipe = TipeKunjungan::all();

        return Inertia::render('Kunjungan/Edit', [
            'kunjungan' => $kunjungan,
            'pelanggan' => $pelanggan,
            'tipe' => $tipe,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'pelanggan_id' => 'required|exists:pelanggans,id',
            'tipe_id' => 'required|exists:tipe_kunjungan,id', // ✅ Tambah validasi tipe
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal' => 'required|date',
            'jam' => 'required',
            'jumlah_pengunjung' => 'required|integer|min:1',
            'total_biaya' => 'required|numeric',
            'status' => 'required|string|in:Dijadwalkan,Selesai,Dibatalkan',
        ]);

        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->update($request->all());

        return redirect()->route('kunjungan.jadwal')->with('success', 'Data kunjungan berhasil diperbarui.');
    }
}
