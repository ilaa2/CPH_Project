<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\Pelanggan;
use App\Models\TipeKunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    public function handleForm(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'tanggal_kunjungan' => 'required|date|after_or_equal:today',
            'jumlah_dewasa' => 'required|integer|min:0',
            'jumlah_anak' => 'required|integer|min:0',
            'jumlah_balita' => 'required|integer|min:0',
        ]);

        $pelanggan = Auth::guard('pelanggan')->user();
        if (!$pelanggan) {
            return redirect()->route('customer.login')->with('error', 'Anda harus login untuk membuat jadwal kunjungan.');
        }

        // Update info kontak pelanggan jika ada perubahan
        if ($pelanggan->nama !== $validated['nama_lengkap'] || $pelanggan->telepon !== $validated['no_hp']) {
            $pelanggan->nama = $validated['nama_lengkap'];
            $pelanggan->telepon = $validated['no_hp'];
            $pelanggan->save();
        }

        $tipeKunjungan = TipeKunjungan::findOrFail($validated['tipe_kunjungan_id']);
        $totalBiaya = 0;
        $dewasa = $validated['jumlah_dewasa'];
        $anak = $validated['jumlah_anak'];
        $balita = $validated['jumlah_balita'];
        $jumlahPengunjung = $dewasa + $anak + $balita;

        if ($jumlahPengunjung < 1) {
            return back()->withErrors(['jumlah_dewasa' => 'Jumlah pengunjung minimal 1 orang.'])->withInput();
        }

        // Logika perhitungan biaya (disamakan dengan frontend)
        if ($tipeKunjungan->nama_tipe === 'Umum') {
            $totalOrangBayar = $dewasa + $anak;
            $totalBiaya = $totalOrangBayar * 10000;
        } else if ($tipeKunjungan->nama_tipe === 'Outing Class') {
            if ($anak > 0 && $anak < 30) {
                $totalBiaya = 300000;
            } else {
                $totalBiaya = $anak * 10000;
            }
        } else {
            $totalBiaya = $jumlahPengunjung * ($tipeKunjungan->biaya ?: 0);
        }

        Kunjungan::create([
            'pelanggan_id' => $pelanggan->id,
            'tipe_id' => $validated['tipe_kunjungan_id'],
            'judul' => 'Kunjungan Online oleh ' . $pelanggan->nama,
            'deskripsi' => 'Kunjungan dijadwalkan melalui form online oleh pelanggan.',
            'tanggal' => $validated['tanggal_kunjungan'],
            'jam' => '09:00:00', // Jam default, bisa disesuaikan
            'jumlah_pengunjung' => $jumlahPengunjung,
            'jumlah_dewasa' => $dewasa,
            'jumlah_anak' => $anak,
            'jumlah_balita' => $balita,
            'total_biaya' => $totalBiaya,
            'status' => 'Dijadwalkan',
        ]);

        return redirect()->back()->with('success', 'Jadwal kunjungan Anda berhasil dibuat! Kami akan segera menghubungi Anda untuk konfirmasi.');
    }
}
