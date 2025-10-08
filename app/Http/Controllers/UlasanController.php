<?php

namespace App\Http\Controllers;

use App\Models\Ulasan;
use App\Models\UlasanFoto;
use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UlasanController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter'); // 'produk' atau 'kunjungan'

        $ulasanQuery = Ulasan::with([
            'pelanggan:id,nama,foto_profil',
            'pesanan',
            'kunjungan.tipe', // Memuat relasi 'tipe' dari 'kunjungan'
            'fotos' // Memuat foto ulasan
        ])
            ->when($filter === 'produk', function ($query) {
                $query->whereNotNull('pesanan_id');
            })
            ->when($filter === 'kunjungan', function ($query) {
                $query->whereNotNull('kunjungan_id');
            })
            ->orderBy('tanggal', 'desc');

        $ulasan = $ulasanQuery->get()->map(function ($item) {
            $subject = 'N/A';
            $type = 'Tidak Diketahui';

            if ($item->pesanan) {
                $type = 'Produk';
                $subject = 'Pesanan #' . $item->pesanan->nomor_pesanan;
            } elseif ($item->kunjungan) {
                $type = 'Kunjungan';
                // Pastikan relasi 'tipe' ada sebelum diakses
                $subject = $item->kunjungan->tipe ? $item->kunjungan->tipe->nama_tipe : 'Kunjungan';
            }

            return [
                'id' => $item->id,
                'nama' => $item->pelanggan->nama,
                'foto_profil' => $item->pelanggan->foto_profil ? asset('storage/' . $item->pelanggan->foto_profil) : null,
                'komentar' => $item->komentar,
                'rating' => $item->rating,
                'tanggal' => $item->tanggal,
                'foto_ulasan' => $item->fotos->map(function ($foto) {
                    return asset('storage/' . $foto->foto_path);
                })->toArray(),
                'type' => $type,
                'subject' => $subject,
            ];
        });

        return Inertia::render('Ulasan/Index', [
            'ulasanList' => $ulasan,
            'currentFilter' => $filter,
        ]);
    }

    public function welcome()
    {
        $testimonials = Ulasan::with('pelanggan:id,nama')
            ->orderBy('tanggal', 'desc')
            ->take(10) // ambil maksimal 10 terbaru
            ->get()
            ->map(function ($item) {
                return [
                    'text' => $item->komentar,
                    'name' => $item->pelanggan->nama,
                    'rating' => $item->rating,
                    'role' => 'Pelanggan'
                ];
            });

        return Inertia::render('Welcome', [
            'testimonials' => $testimonials
        ]);
    }

    public function destroy($id)
    {
        Ulasan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Ulasan berhasil dihapus.');
    }

    public function indexCust()
    {
        $ulasan = Ulasan::with('pelanggan:id,nama,foto_profil', 'fotos') // Eager load customer and photos data
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($item) {
                $subject = 'N/A';
                $type = 'Tidak Diketahui';

                if ($item->pesanan_id) {
                    $type = 'Produk';
                    // You might want to load pesanan relation to get more details
                    $subject = 'Ulasan Produk';
                } elseif ($item->kunjungan_id) {
                    $type = 'Kunjungan';
                    // You might want to load kunjungan relation to get more details
                    $subject = 'Ulasan Kunjungan';
                }

                return [
                    'id' => $item->id,
                    'nama' => $item->pelanggan->nama,
                    'foto_profil' => $item->pelanggan->foto_profil ? asset('storage/' . $item->pelanggan->foto_profil) : null,
                    'komentar' => $item->komentar,
                    'rating' => $item->rating,
                    'tanggal' => $item->tanggal,
                    'foto_ulasan' => $item->fotos->map(function ($foto) {
                        return asset('storage/' . $foto->foto_path);
                    })->toArray(),
                    'type' => $type,
                    'subject' => $subject, // Simplified subject
                ];
            });

        return Inertia::render('Customer/Ulasan/Index', [
            'ulasanList' => $ulasan
        ]);
    }

    public function createCust($id)
    {
        // Logika untuk menampilkan form pembuatan ulasan
        // Anda mungkin perlu mengambil data pesanan di sini
        return Inertia::render('Customer/Ulasan/Create', [
            'pesanan_id' => $id
        ]);
    }

    public function storeCust(Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'required|string',
            'pesanan_id' => 'required|exists:pesanan,id',
            'foto_ulasan' => 'nullable|array', // Validasi bahwa ini adalah array
            'foto_ulasan.*' => 'image|mimes:jpg,jpeg,png|max:2048', // Validasi setiap item dalam array
        ]);

        $ulasan = Ulasan::create([
            'pesanan_id' => $request->pesanan_id,
            'pelanggan_id' => auth('pelanggan')->id(),
            'rating' => $request->rating,
            'komentar' => $request->komentar,
            'tanggal' => now(),
        ]);

        if ($request->hasFile('foto_ulasan')) {
            foreach ($request->file('foto_ulasan') as $foto) {
                $path = $foto->store('ulasan-fotos', 'public');
                UlasanFoto::create([
                    'ulasan_id' => $ulasan->id,
                    'foto_path' => $path,
                ]);
            }
        }

        return redirect()->route('customer.pesanan.index')->with('success', 'Ulasan berhasil dikirim.');
    }

    // -- Ulasan untuk Kunjungan --

    public function createForKunjungan(Kunjungan $kunjungan)
    {
        // Pastikan hanya pelanggan yang bersangkutan yang bisa memberi ulasan
        if ($kunjungan->pelanggan_id !== auth('pelanggan')->id()) {
            abort(403);
        }

        return Inertia::render('Customer/Ulasan/CreateForKunjungan', [
            'kunjungan' => $kunjungan,
        ]);
    }

    public function storeForKunjungan(Request $request)
    {
        $request->validate([
            'kunjungan_id' => 'required|exists:kunjungan,id',
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'required|string',
            'foto_ulasan' => 'nullable|array',
            'foto_ulasan.*' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Cek apakah kunjungan ini milik pelanggan yang sedang login
        $kunjungan = Kunjungan::findOrFail($request->kunjungan_id);
        if ($kunjungan->pelanggan_id !== auth('pelanggan')->id()) {
            abort(403);
        }

        $ulasan = Ulasan::create([
            'kunjungan_id' => $request->kunjungan_id,
            'pelanggan_id' => auth('pelanggan')->id(),
            'rating' => $request->rating,
            'komentar' => $request->komentar,
            'tanggal' => now(),
        ]);

        if ($request->hasFile('foto_ulasan')) {
            foreach ($request->file('foto_ulasan') as $foto) {
                $path = $foto->store('ulasan-fotos', 'public');
                UlasanFoto::create([
                    'ulasan_id' => $ulasan->id,
                    'foto_path' => $path,
                ]);
            }
        }

        return redirect()->route('kunjungan.riwayat')->with('success', 'Ulasan untuk kunjungan berhasil dikirim.');
    }
}
