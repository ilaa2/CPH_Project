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
        return Inertia::render('Customer/BelanjaDetail', [
            'product' => $product,
        ]);
    }



}
