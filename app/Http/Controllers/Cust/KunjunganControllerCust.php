<?php

namespace App\Http\Controllers\Cust;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TipeKunjungan;
use App\Models\Kunjungan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
            'jumlah_dewasa'     => 'required|integer|min:1',
            'jumlah_anak'       => 'required|integer|min:0',
            'jumlah_balita'     => 'required|integer|min:0',
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

        // Kalkulasi biaya di backend, meniru logika frontend
        $totalBiaya = $this->calculateTotalCost($detailTipe, $dataFromSession);

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
            'jumlah_dewasa'     => 'required|integer|min:1',
            'jumlah_anak'       => 'required|integer|min:0',
            'jumlah_balita'     => 'required|integer|min:0',
        ]);

        $tipeKunjungan = TipeKunjungan::find($validated['tipe_kunjungan_id']);

        // PERHITUNGAN ULANG BIAYA DI BACKEND (PENTING UNTUK KEAMANAN)
        $finalTotalBiaya = $this->calculateTotalCost($tipeKunjungan, $validated);

        Kunjungan::create([
            'pelanggan_id'      => Auth::guard('pelanggan')->id(),
            'tipe_id'           => $validated['tipe_kunjungan_id'],
            'judul'             => $tipeKunjungan->nama_tipe . ' oleh ' . $validated['nama_lengkap'],
            'deskripsi'         => 'Kunjungan oleh ' . $validated['nama_lengkap'],
            'tanggal'           => $validated['tanggal_kunjungan'],
            'jam'               => '09:00:00', // Jam default
            'jumlah_dewasa'     => $validated['jumlah_dewasa'],
            'jumlah_anak'       => $validated['jumlah_anak'],
            'jumlah_balita'     => $validated['jumlah_balita'],
            'total_biaya'       => $finalTotalBiaya,
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

    /**
     * Helper function untuk menghitung total biaya.
     * Logika ini harus sama persis dengan yang ada di frontend.
     */
    private function calculateTotalCost(TipeKunjungan $tipe, array $data): float
    {
        $biaya = 0;
        $jumlah_dewasa = $data['jumlah_dewasa'] ?? 0;
        $jumlah_anak = $data['jumlah_anak'] ?? 0;

        if ($tipe->nama_tipe === 'Sewa Tempat') {
            $totalOrangBayar = $jumlah_dewasa + $jumlah_anak;
            $biaya = $totalOrangBayar * 10000;
        } elseif ($tipe->nama_tipe === 'Kunjungan Sekolah') {
            if ($jumlah_anak < 30) {
                $biaya = 300000;
            } else {
                $biaya = $jumlah_anak * 10000;
            }
        } else {
            // Fallback ke logika default jika ada tipe lain
            $totalPengunjung = $jumlah_dewasa + $jumlah_anak + ($data['jumlah_balita'] ?? 0);
            $biaya = $totalPengunjung * ($tipe->biaya ?? 0);
        }

        return $biaya;
    }
}
