<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        $produk = Produk::select('products.*', 'product_categories.nama_kategori as kategori')
            ->leftJoin('product_categories', 'products.id_kategori', '=', 'product_categories.id')
            ->get();

        return Inertia::render('Produk/Index', [
            'produk' => $produk
        ]);
    }

    public function create()
    {
        $kategori = ProductCategory::all();

        return Inertia::render('Produk/Create', [
            'kategori' => $kategori
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'id_kategori' => 'required|exists:product_categories,id',
            'deskripsi' => 'nullable|string', // <-- Ditambahkan
            'harga' => 'required|integer',
            'stok' => 'required|integer',
            'gambar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'required|in:Aktif,Nonaktif',
        ]);

        $filePath = $request->hasFile('gambar')
            ? $request->file('gambar')->store('Produk_Buah', 'public')
            : null;

        Produk::create([
            'nama' => $request->nama,
            'id_kategori' => $request->id_kategori,
            'deskripsi' => $request->deskripsi, // <-- Ditambahkan
            'harga' => $request->harga,
            'stok' => $request->stok,
            'gambar' => $filePath,
            'status' => $request->status,
        ]);

        return redirect()->route('produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $produk = Produk::findOrFail($id);
        $kategori = ProductCategory::all();

        return Inertia::render('Produk/Edit', [
            'produk' => $produk,
            'kategori' => $kategori,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'id_kategori' => 'required|exists:product_categories,id',
            'deskripsi' => 'nullable|string', // <-- Ditambahkan
            'harga' => 'required|integer',
            'stok' => 'required|integer',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'required|in:Aktif,Nonaktif',
        ]);

        $produk = Produk::findOrFail($id);

        $filePath = $produk->gambar;

        if ($request->hasFile('gambar')) {
            if ($filePath && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            $filePath = $request->file('gambar')->store('Produk_Buah', 'public');
        }

        $produk->update([
            'nama' => $request->nama,
            'id_kategori' => $request->id_kategori,
            'deskripsi' => $request->deskripsi, // <-- Ditambahkan
            'harga' => $request->harga,
            'stok' => $request->stok,
            'gambar' => $filePath,
            'status' => $request->status,
        ]);

        return redirect()->route('produk.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $produk = Produk::findOrFail($id);

        if ($produk->gambar && Storage::disk('public')->exists($produk->gambar)) {
            Storage::disk('public')->delete($produk->gambar);
        }

        $produk->delete();

        return redirect()->route('produk.index')->with('success', 'Produk berhasil dihapus.');
    }
}
