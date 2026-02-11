<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk; // Sesuaikan jika nama model Anda Product

class BelanjaController extends Controller
{
    public function index(Request $request)
    {
        // Ambil nilai filter 'kategori' dan 'search' dari URL
        $kategoriFilter = $request->query('category');
        $searchFilter = $request->query('search');

        // Query produk yang statusnya Aktif
        // TAMBAHKAN with('kategori') DI SINI
        $products = Produk::with('kategori')
            ->where('status', 'Aktif')
            // Filter berdasarkan kategori jika ada
            ->when($kategoriFilter, function ($query, $kategori) {
                return $query->where('id_kategori', $kategori);
            })
            // Filter berdasarkan pencarian nama jika ada
            ->when($searchFilter, function ($query, $search) {
                return $query->where('nama', 'like', '%' . $search . '%');
            })
            ->orderBy('nama', 'asc')
            ->get();

        // Kirim data produk sebagai 'props' ke komponen React
        return Inertia::render('Customer/Belanja', [
            'products' => $products,
            // Kirim juga nilai filter agar frontend tahu mana yang aktif
            'filters' => ['kategori' => $kategoriFilter, 'search' => $searchFilter]
        ]);
    }
    public function show($id)
    {
        $product = Produk::with('kategori')->findOrFail($id); // ambil produk beserta kategori
        
        // Load ulasan dengan pelanggan
        $reviews = $product->ulasan()
            ->with('pelanggan:id,name,avatar', 'fotos')
            ->orderBy('tanggal', 'desc')
            ->get();

        $totalUlasan = $reviews->count();
        $averageRating = $totalUlasan > 0 ? $reviews->avg('rating') : 0;

        $ratingCounts = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        // Cek qty produk ini di keranjang user (jika login)
        $cartQty = 0;
        if (auth()->check()) {
            $cartItem = \App\Models\Cart::where('user_id', auth()->id())
                ->where('product_id', $id)
                ->first();
            $cartQty = $cartItem ? $cartItem->quantity : 0;
        }

        return Inertia::render('Customer/BelanjaDetail', [
            'product' => $product,
            'reviews' => $reviews,
            'reviewStats' => [
                'total' => $totalUlasan,
                'average' => round($averageRating, 1),
                'counts' => $ratingCounts
            ],
            'cartQty' => $cartQty, // Qty yang sudah ada di keranjang
        ]);
    }



}
