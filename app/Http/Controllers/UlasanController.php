<?php

namespace App\Http\Controllers;

use App\Models\Ulasan;
use App\Models\UlasanFoto;
use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UlasanController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter'); // 'produk' atau 'kunjungan'

        $ulasanQuery = Ulasan::with([
            'user:id,name,avatar',
            'pesanan',
            'produk', // Load produk relationship
            'kunjungan.tipe', // Memuat relasi 'tipe' dari 'kunjungan'
            'fotos' // Memuat foto ulasan
        ])
            ->when($filter === 'produk', function ($query) {
                $query->whereNotNull('pesanan_id');
            })
            ->when($filter === 'kunjungan', function ($query) {
                $query->whereNotNull('kunjungan_id');
            })
            ->when($request->input('kunjungan_id'), function ($query, $id) {
                $query->where('kunjungan_id', $id);
            })
            ->when($request->input('user_id'), function ($query, $id) {
                $query->where('user_id', $id);
            })
            ->orderBy('tanggal', 'desc');

        $ulasan = $ulasanQuery->get()->map(function ($item) {
            $subject = 'N/A';
            $type = 'Tidak Diketahui';

            if ($item->produk) {
                $type = 'Produk';
                $subject = $item->produk->nama . ' (Pesanan #' . $item->pesanan->nomor_pesanan . ')';
            } elseif ($item->pesanan) {
                $type = 'Produk'; // Fallback for old data
                 $subject = 'Pesanan #' . $item->pesanan->nomor_pesanan;
            } elseif ($item->kunjungan) {
                $type = 'Kunjungan';
                // Pastikan relasi 'tipe' ada sebelum diakses
                $subject = $item->kunjungan->tipe ? $item->kunjungan->tipe->nama_tipe : 'Kunjungan';
            }

            return [
                'id' => $item->id,
                'nama' => $item->user->name,
                'foto_profil' => $item->user->avatar ? asset('storage/' . $item->user->avatar) : null,
                'komentar' => $item->komentar,
                'rating' => $item->rating,
                'tanggal' => $item->tanggal,
                'foto_ulasan' => $item->fotos->map(function ($foto) {
                    return asset('storage/' . $foto->foto_path);
                })->toArray(),
                'type' => $type,
                'subject' => $subject,
                'balasan' => $item->balasan,
                'tanggal_balasan' => $item->tanggal_balasan,
            ];
        });

        return Inertia::render('Ulasan/Index', [
            'ulasanList' => $ulasan,
            'currentFilter' => $filter,
        ]);
    }

    public function welcome()
    {
        $testimonials = Ulasan::with('user:id,name')
            ->orderBy('tanggal', 'desc')
            ->take(10) // ambil maksimal 10 terbaru
            ->get()
            ->map(function ($item) {
                return [
                    'text' => $item->komentar,
                    'name' => $item->user->name,
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
        $ulasanQuery = Ulasan::with('user:id,name,avatar', 'fotos', 'pesanan', 'kunjungan.tipe')
            ->orderBy('tanggal', 'desc');

        $semuaUlasan = $ulasanQuery->get();

        $ulasanList = $semuaUlasan->map(function ($item) {
            $subject = 'N/A';
            $type = 'Tidak Diketahui';

            if ($item->pesanan) {
                $type = 'Produk';
                $subject = 'Pesanan #' . $item->pesanan->nomor_pesanan;
            } elseif ($item->kunjungan) {
                $type = 'Kunjungan';
                $subject = $item->kunjungan->tipe ? $item->kunjungan->tipe->nama_tipe : 'Kunjungan';
            }

            return [
                'id' => $item->id,
                'nama' => $item->user->name,
                'foto_profil' => $item->user->avatar ? asset('storage/' . $item->user->avatar) : null,
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

        $totalUlasan = $semuaUlasan->count();
        $averageRating = $totalUlasan > 0 ? $semuaUlasan->avg('rating') : 0;

        $ratingCounts = [
            5 => $semuaUlasan->where('rating', 5)->count(),
            4 => $semuaUlasan->where('rating', 4)->count(),
            3 => $semuaUlasan->where('rating', 3)->count(),
            2 => $semuaUlasan->where('rating', 2)->count(),
            1 => $semuaUlasan->where('rating', 1)->count(),
        ];

        $ulasanStats = [
            'total' => $totalUlasan,
            'average' => round($averageRating, 1),
            'counts' => $ratingCounts,
        ];

        return Inertia::render('Customer/Ulasan/Index', [
            'ulasanList' => $ulasanList,
            'ulasanStats' => $ulasanStats,
        ]);
    }

    public function createCust($id)
    {
        // Load pesanan beserta items dan produknya
        $pesanan = \App\Models\Pesanan::with('items.produk')->findOrFail($id);
        
        return Inertia::render('Customer/Ulasan/Create', [
            'pesanan' => $pesanan
        ]);
    }

    public function storeCust(Request $request)
    {
        $request->validate([
            'pesanan_id' => 'required|exists:pesanan,id',
            'reviews' => 'required|array',
            'reviews.*.produk_id' => 'required|exists:products,id',
            'reviews.*.rating' => 'required|integer|min:1|max:5',
            'reviews.*.komentar' => 'nullable|string',
            'reviews.*.fotos' => 'nullable|array',
            'reviews.*.fotos.*' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);

        foreach ($request->reviews as $reviewData) {
            $ulasan = Ulasan::create([
                'pesanan_id' => $request->pesanan_id,
                'produk_id' => $reviewData['produk_id'],
                'user_id' => Auth::id(),
                'rating' => $reviewData['rating'],
                'komentar' => $reviewData['komentar'] ?? '',
                'tanggal' => now(),
            ]);

            if (isset($reviewData['fotos'])) {
                foreach ($reviewData['fotos'] as $foto) {
                    $path = $foto->store('ulasan-fotos', 'public');
                    UlasanFoto::create([
                        'ulasan_id' => $ulasan->id,
                        'foto_path' => $path,
                    ]);
                }
            }
        }

        return redirect()->route('customer.pesanan.index')->with('success', 'Ulasan berhasil dikirim.');
    }

    // -- Ulasan untuk Kunjungan --

    public function createForKunjungan(Kunjungan $kunjungan)
    {
        // Pastikan hanya user yang bersangkutan yang bisa memberi ulasan
        if ($kunjungan->user_id !== Auth::id()) {
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

        // Cek apakah kunjungan ini milik user yang sedang login
        $kunjungan = Kunjungan::findOrFail($request->kunjungan_id);
        if ($kunjungan->user_id !== Auth::id()) {
            abort(403);
        }

        $ulasan = Ulasan::create([
            'kunjungan_id' => $request->kunjungan_id,
            'user_id' => Auth::id(),
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

        return redirect()->route('customer.pesanan.index')->with('success', 'Ulasan untuk kunjungan berhasil dikirim.');
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'balasan' => 'required|string',
        ]);

        $ulasan = Ulasan::findOrFail($id);
        $ulasan->update([
            'balasan' => $request->balasan,
            'tanggal_balasan' => now(),
        ]);

        return back()->with('success', 'Balasan ulasan berhasil dikirim.');
    }
}
