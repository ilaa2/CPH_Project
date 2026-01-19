<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kunjungan;
use App\Models\User;
use App\Models\TipeKunjungan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitBookingController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.kunjungan.jadwal');
    }

    public function jadwal()
    {
        $query = Kunjungan::query()
            ->with(['user', 'tipe'])
            ->join('users', 'kunjungan.user_id', '=', 'users.id')
            ->join('tipe_kunjungan', 'kunjungan.tipe_id', '=', 'tipe_kunjungan.id')
            ->where('kunjungan.status', '!=', 'Dibatalkan')
            ->select('kunjungan.*');

        // Filter pencarian nama
        if (request()->has('search')) {
            $search = request()->input('search');
            $query->where('users.name', 'LIKE', "%{$search}%");
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
        $kunjungan = Kunjungan::with(['user', 'tipe', 'ulasan'])
            ->where('status', '!=', 'Dibatalkan')
            ->get();

        return Inertia::render('Kunjungan/Kalender', [
            'kunjungan' => $kunjungan
        ]);
    }

    public function riwayat()
    {
        $query = Kunjungan::with(['user', 'tipe', 'ulasan.fotos'])->where('status', 'Selesai');

        // Filter tipe kunjungan
        $query->when(request('tipe') && request('tipe') !== 'Semua', function ($q) {
            $q->whereHas('tipe', function ($sq) {
                $sq->where('nama_tipe', request('tipe'));
            });
        });

        $data = $query->get();

        return Inertia::render('Kunjungan/Riwayat', [
            'riwayat' => $data,
            'filters' => request()->only(['tipe']),
        ]);
    }

    public function create()
    {
        $pelanggan = User::where('role', 'customer')->get();
        $tipe = TipeKunjungan::all();

        return Inertia::render('Kunjungan/Create', [
            'pelanggan' => $pelanggan,
            'tipe' => $tipe,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pelanggan_id' => 'required|exists:users,id',
            'tipe_kunjungan_id' => 'required|exists:tipe_kunjungan,id',
            'tanggal' => 'required|date',
            'jam' => 'required',
            'jumlah_dewasa' => 'required|integer|min:0',
            'jumlah_anak' => 'required|integer|min:0',
            'jumlah_balita' => 'required|integer|min:0',
            'total_biaya' => 'required|numeric|min:0',
            'status' => 'required|in:Dijadwalkan,Selesai',
        ]);

        // Validasi kustom: pastikan ada pengunjung
        if ($validated['jumlah_dewasa'] + $validated['jumlah_anak'] + $validated['jumlah_balita'] == 0) {
            return back()->withErrors(['jumlah_dewasa' => 'Jumlah pengunjung tidak boleh nol.'])->withInput();
        }

        Kunjungan::create([
            'user_id' => $validated['pelanggan_id'],
            'tipe_id' => $validated['tipe_kunjungan_id'],
            'tanggal' => $validated['tanggal'],
            'jam' => $validated['jam'],
            'jumlah_dewasa' => $validated['jumlah_dewasa'],
            'jumlah_anak' => $validated['jumlah_anak'],
            'jumlah_balita' => $validated['jumlah_balita'],
            'total_biaya' => $validated['total_biaya'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('admin.kunjungan.jadwal')->with('success', 'Kunjungan berhasil ditambahkan.');
    }

    public function show($id)
    {
        $kunjungan = Kunjungan::with(['user', 'tipe', 'ulasan.fotos'])->findOrFail($id);
        
        return Inertia::render('Kunjungan/Show', [
            'kunjungan' => $kunjungan,
        ]);
    }

    public function edit($id)
    {
        $kunjungan = Kunjungan::with(['user', 'tipe'])->findOrFail($id);
        $pelanggan = User::where('role', 'customer')->get();
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
            'pelanggan_id' => 'sometimes|required|exists:users,id',
            'tipe_id' => 'sometimes|required|exists:tipe_kunjungan,id',
            'tanggal' => 'sometimes|required|date',
            'jam' => 'sometimes|required',
            'jumlah_dewasa' => 'required|integer|min:0',
            'jumlah_anak' => 'required|integer|min:0',
            'jumlah_balita' => 'required|integer|min:0',
            'total_biaya' => 'required|numeric',
            'status' => 'required|string|in:Dijadwalkan,Selesai',
        ]);

        $kunjungan = Kunjungan::findOrFail($id);
        
        // Map pelanggan_id to user_id if present
        $data = $request->all();
        if (isset($data['pelanggan_id'])) {
            $data['user_id'] = $data['pelanggan_id'];
            unset($data['pelanggan_id']);
        }
        
        $kunjungan->update($data);

        return redirect()->route('admin.kunjungan.jadwal')->with('success', 'Data kunjungan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->delete();

        return redirect()->route('admin.kunjungan.jadwal')->with('success', 'Kunjungan berhasil dihapus.');
    }
}
