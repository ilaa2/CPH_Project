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

        $data = $query->orderBy('kunjungan.tanggal', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Kunjungan/Jadwal', [
            'kunjungan' => $data,
            'filters' => request()->all(['search', 'tipe']),
            'pelangganList' => User::where('role', 'customer')->get(),
            'tipeKunjunganList' => TipeKunjungan::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'tipe_id' => 'required|exists:tipe_kunjungan,id',
            'tanggal' => 'required|date',
            'jam' => 'required',
            'jumlah_dewasa' => 'required|integer|min:0',
            'jumlah_anak' => 'required|integer|min:0',
            'jumlah_balita' => 'required|integer|min:0',
            'status' => 'required|string',
        ]);

        $tipe = TipeKunjungan::findOrFail($request->tipe_id);
        
        // Kalkulasi Total Biaya (Dewasa 15k, Anak 10k, Balita Gratis)
        $biaya = 0;
        if ($tipe->nama_tipe === 'Umum') {
            $biaya = ($request->jumlah_dewasa * 15000) + ($request->jumlah_anak * 10000);
        } elseif ($tipe->nama_tipe === 'Outing Class') {
             // Logic Outing Class (Tetap/Sesuaikan jika perlu, asumsi logic customer)
             if ($request->jumlah_anak < 30) {
                $biaya = 300000;
             } else {
                $biaya = $request->jumlah_anak * 10000;
             }
        } else {
            // Default use tipe price for all valid attributes (or apply split if needed)
            // Asumsi tipe lain mengikuti harga tiket flat per orang (kecuali balita)
            $totalPerson = $request->jumlah_dewasa + $request->jumlah_anak;
            $biaya = $totalPerson * $tipe->harga_tiket;
        }
        
        $totalBiaya = $biaya;

        Kunjungan::create([
            'user_id' => $request->user_id,
            'tipe_id' => $request->tipe_id,
            'tanggal' => $request->tanggal,
            'jam' => $request->jam,
            'jumlah_dewasa' => $request->jumlah_dewasa,
            'jumlah_anak' => $request->jumlah_anak,
            'jumlah_balita' => $request->jumlah_balita,
            'total_biaya' => $totalBiaya,
            'status' => $request->status,
            'payment_status' => 'paid', // Admin create assumed paid/manual
        ]);

        return redirect()->back()->with('success', 'Kunjungan berhasil dijadwalkan.');
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

        $data = $query->orderBy('tanggal', 'desc')->get();

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

        return redirect()->back()->with('success', 'Data kunjungan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->delete();

        return redirect()->route('admin.kunjungan.jadwal')->with('success', 'Kunjungan berhasil dihapus.');
    }

    /**
     * Download Invoice Kunjungan (PDF) untuk Admin.
     */
    public function invoice($id)
    {
        $kunjungan = Kunjungan::with(['tipe', 'user'])->findOrFail($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice_kunjungan', [
            'kunjungan' => $kunjungan
        ]);

        return $pdf->stream('invoice-kunjungan-' . $kunjungan->id . '.pdf');
    }
}
