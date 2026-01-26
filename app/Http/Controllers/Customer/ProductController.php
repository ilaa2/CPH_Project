<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display the product catalog listing.
     * Menampilkan daftar katalog produk untuk customer.
     */
    public function index(Request $request)
    {
        $query = Produk::query()
            ->with('kategori')
            ->where('status', 'Aktif');

        // Filter pencarian nama
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('nama', 'LIKE', "%{$search}%");
        }

        // Filter kategori
        if ($request->has('kategori') && $request->input('kategori') !== 'Semua') {
            $query->whereHas('kategori', function ($q) use ($request) {
                $q->where('nama_kategori', $request->input('kategori'));
            });
        }

        $produk = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Customer/Belanja/Index', [
            'produk' => $produk,
            'filters' => $request->only(['search', 'kategori']),
        ]);
    }

    /**
     * Display a specific product detail.
     * Menampilkan detail produk untuk customer.
     */
    public function show($id)
    {
        $produk = Produk::with(['kategori', 'ulasan.user'])->findOrFail($id);

        // Calculate average rating
        $avgRating = $produk->ulasan->avg('rating') ?? 0;
        $totalReviews = $produk->ulasan->count();

        return Inertia::render('Customer/Belanja/Show', [
            'produk' => $produk,
            'avgRating' => round($avgRating, 1),
            'totalReviews' => $totalReviews,
        ]);
    }
}
