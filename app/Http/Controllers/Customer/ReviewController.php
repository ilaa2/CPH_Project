<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Ulasan;
use App\Models\UlasanFoto;
use App\Models\Kunjungan;
use App\Models\Pesanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Display all reviews for customers.
     */
    public function index()
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

    /**
     * Show form to create review for order.
     */
    public function create($id)
    {
        $pesanan = Pesanan::with('items.produk')->findOrFail($id);
        
        // Verify ownership
        if ($pesanan->user_id !== Auth::id()) {
            abort(403);
        }
        
        return Inertia::render('Customer/Ulasan/Create', [
            'pesanan' => $pesanan
        ]);
    }

    /**
     * Store review for order.
     */
    public function store(Request $request)
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

    /**
     * Show form to create review for visit.
     */
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

    /**
     * Store review for visit.
     */
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
}
