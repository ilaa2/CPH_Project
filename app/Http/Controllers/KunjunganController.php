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
        return redirect()->route('kunjungan.jadwal');
    }

    public function jadwal()
    {
        $query = Kunjungan::query()
            ->with(['pelanggan', 'tipe'])
            ->join('pelanggans', 'kunjungan.pelanggan_id', '=', 'pelanggans.id')
            ->join('tipe_kunjungan', 'kunjungan.tipe_id', '=', 'tipe_kunjungan.id')
            ->select('kunjungan.*');

        // Filter pencarian nama
        if (request()->has('search')) {
            $search = request()->input('search');
            $query->where('pelanggans.nama', 'LIKE', "%{$search}%");
        }

        // Filter tipe kunjungan
        $query->when(request('tipe') && request('tipe') !== 'Semua', function ($q) {
            return $q->where('tipe_kunjungan.nama_tipe', request('tipe'));
        });

        $data = $query->orderBy('tanggal', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Kunjungan/Jadwal', [
            'kunjungan' => $data,
            'filters' => request()->only(['search', 'tipe']),
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
        $validated = $request->validate([
            'pelanggan_id' => 'required|exists:pelanggans,id',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'tanggal' => 'required|date',
            'jam' => 'required',
            'jumlah_dewasa' => 'required|integer|min:0',
            'jumlah_anak' => 'required|integer|min:0',
            'jumlah_balita' => 'required|integer|min:0',
            'total_biaya' => 'required|numeric|min:0',
            'status' => 'required|in:Dijadwalkan,Selesai,Dibatalkan',
        ]);

        $tipeKunjungan = TipeKunjungan::find($validated['tipe_kunjungan_id']);

        // Validasi kustom: pastikan ada pengunjung
        if ($validated['jumlah_dewasa'] + $validated['jumlah_anak'] + $validated['jumlah_balita'] == 0) {
            return back()->withErrors(['jumlah_dewasa' => 'Jumlah pengunjung tidak boleh nol.'])->withInput();
        }
        
        // Di admin, kita memercayai total_biaya yang diinputkan (untuk override),
        // namun kita tetap bisa melakukan kalkulasi ulang untuk verifikasi jika perlu.
        // Untuk saat ini, kita langsung gunakan dari request.

        Kunjungan::create([
            'pelanggan_id' => $validated['pelanggan_id'],
            'tipe_id' => $validated['tipe_kunjungan_id'],
            'tanggal' => $validated['tanggal'],
            'jam' => $validated['jam'],
            'jumlah_dewasa' => $validated['jumlah_dewasa'],
            'jumlah_anak' => $validated['jumlah_anak'],
            'jumlah_balita' => $validated['jumlah_balita'],
            'total_biaya' => $validated['total_biaya'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('kunjungan.jadwal')->with('success', 'Kunjungan berhasil ditambahkan.');
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

        if ($tipe->nama_tipe === 'Umum') {
            $totalOrangBayar = $jumlah_dewasa + $jumlah_anak;
            $biaya = $totalOrangBayar * 10000;
        } elseif ($tipe->nama_tipe === 'Outing Class') {
            if ($jumlah_anak > 0 && $jumlah_anak < 30) {
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
            'tanggal' => $validated['tanggal_kunjungan'],
            'jam' => '09:00:00', // Jam default, bisa disesuaikan
            'jumlah_pengunjung' => $jumlahPengunjung,
            'jumlah_dewasa' => $dewasa,
            'jumlah_anak' => $anak,
            'jumlah_balita' => $balita,
            'total_biaya' => $totalBiaya,
            'status' => 'Dijadwalan',
        ]);

        return redirect()->back()->with('success', 'Jadwal kunjungan Anda berhasil dibuat! Kami akan segera menghubungi Anda untuk konfirmasi.');
    }
}
