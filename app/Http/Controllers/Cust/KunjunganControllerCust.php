<?php

namespace App\Http\Controllers\Cust;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TipeKunjungan;
use App\Models\Kunjungan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia; // Jangan lupa import Inertia

class KunjunganControllerCust extends Controller
{
    /**
     * Menampilkan halaman formulir awal untuk membuat kunjungan.
     */
    public function index()
    {
        // Menghapus data sesi lama jika ada, agar form selalu bersih
        session()->forget('form_data_kunjungan');

        $tipeKunjungan = TipeKunjungan::all();

        return Inertia::render('Customer/Kunjungan', [
            'tipeKunjungan' => $tipeKunjungan,
        ]);
    }

    /**
     * Memvalidasi data dari form awal dan menyimpannya di sesi.
     * Kemudian mengarahkan ke halaman konfirmasi.
     */
    public function handleForm(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap'      => 'required|string|max:255',
            'no_hp'             => 'required|string|max:15',
            'tanggal_kunjungan' => 'required|date|after_or_equal:today',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'jumlah_pengunjung' => 'required|integer|min:1',
        ]);

        // Simpan data yang valid ke dalam session untuk dibawa ke halaman konfirmasi
        session()->put('form_data_kunjungan', $validated);

        return redirect()->route('kunjungan.konfirmasi');
    }

    /**
     * Menampilkan halaman konfirmasi dengan data dari sesi.
     */
    public function showKonfirmasi()
    {
        // Ambil data dari sesi
        $dataFromSession = session()->get('form_data_kunjungan');

        // Jika tidak ada data di sesi (misal, user langsung akses URL), kembalikan ke form awal
        if (!$dataFromSession) {
            return redirect()->route('kunjungan.index');
        }

        $detailTipe = TipeKunjungan::find($dataFromSession['tipe_kunjungan_id']);

        // Kalkulasi biaya
        $biayaPerOrang = 15000; // Anda bisa ubah ini
        $totalBiaya = $biayaPerOrang * $dataFromSession['jumlah_pengunjung'];

        // Siapkan data lengkap untuk dikirim ke view React
        $dataKunjungan = array_merge($dataFromSession, [
            'nama_tipe'   => $detailTipe->nama_tipe,
            'total_biaya' => $totalBiaya,
        ]);

        return Inertia::render('Customer/KunjunganKonfirmasi', [
            'dataKunjungan' => $dataKunjungan,
        ]);
    }

    /**
     * Menyimpan data kunjungan final ke database.
     */
    public function store(Request $request)
    {
        // Validasi ulang data yang dikirim dari halaman konfirmasi
        $validated = $request->validate([
            'nama_lengkap'      => 'required|string|max:255',
            'no_hp'             => 'required|string|max:15',
            'tanggal_kunjungan' => 'required|date',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'jumlah_pengunjung' => 'required|integer|min:1',
            'total_biaya'       => 'required|numeric',
        ]);

        $tipeKunjungan = TipeKunjungan::find($validated['tipe_kunjungan_id']);

        Kunjungan::create([
            'pelanggan_id'      => Auth::guard('pelanggan')->id(), // Mengambil ID pelanggan yang login
            'tipe_id'           => $validated['tipe_kunjungan_id'],
            'judul'             => $tipeKunjungan->nama_tipe,
            'deskripsi'         => 'Kunjungan oleh ' . $validated['nama_lengkap'],
            'tanggal'           => $validated['tanggal_kunjungan'],
            'jam'               => '09:00:00', // Jam default
            'jumlah_pengunjung' => $validated['jumlah_pengunjung'],
            'total_biaya'       => $validated['total_biaya'],
            'status'            => 'Dijadwalkan',
        ]);

        // Hapus data dari sesi setelah berhasil disimpan
        session()->forget('form_data_kunjungan');

        return redirect()->route('kunjungan.index')
            ->with('success', 'Kunjungan Anda telah berhasil dijadwalkan!');
    }

    /**
     * Menampilkan detail satu kunjungan milik pelanggan.
     */
    public function show(Kunjungan $kunjungan)
    {
        // Pastikan kunjungan ini milik pelanggan yang sedang login
        if ($kunjungan->pelanggan_id !== Auth::guard('pelanggan')->id()) {
            abort(403, 'AKSES DITOLAK');
        }

        // Load relasi yang dibutuhkan
        $kunjungan->load(['tipe', 'ulasan']);

        return Inertia::render('Customer/Kunjungan/Show', [
            'kunjungan' => $kunjungan,
        ]);
    }
}
