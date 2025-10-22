<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\PesananItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PesananController extends Controller
{
    public function index(Request $request)
    {
        $query = Pesanan::with(['pelanggan', 'items.produk'])
            ->orderByDesc('tanggal');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('pelanggan', function ($q) use ($search) {
                $q->where('nama', 'LIKE', "%{$search}%");
            });
        }

        $pesanan = $query->paginate(10)->withQueryString();

        return Inertia::render('Pesanan/Index', [
            'pesanan' => $pesanan,
            'filters' => $request->only(['search']),
            'pelangganList' => Pelanggan::all(),
            'produkList' => Produk::where('stok', '>', 0)->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Pesanan/Create', [
            'pelangganList' => Pelanggan::all(),
            'produkList' => Produk::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pelanggan_id' => 'required|exists:pelanggans,id',
            'tanggal' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $total = 0;

            // 🔁 Cek stok sebelum buat pesanan
            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi. Tersedia: {$produk->stok}");
                }
                $total += $produk->harga * $item['jumlah'];
            }

            // Simpan pesanan
            $pesanan = Pesanan::create([
                'id_pelanggan' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'total' => $total,
                'status' => 'Diproses',
            ]);

            // Simpan item & kurangi stok
            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);

                PesananItem::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produk->id,
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $produk->harga * $item['jumlah'],
                ]);

                $produk->stok -= $item['jumlah'];
                $produk->save();
            }

            DB::commit();
            return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal menyimpan pesanan: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $pesanan = Pesanan::findOrFail($id);
        $pesanan->items()->delete();
        $pesanan->delete();

        return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil dihapus.');
    }

    public function edit($id)
    {
        $pesanan = Pesanan::with('items.produk', 'pelanggan')->findOrFail($id);
        $produkList = Produk::all();
        $pelangganList = Pelanggan::all();

        return Inertia::render('Pesanan/Edit', compact('pesanan', 'produkList', 'pelangganList'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'pelanggan_id' => 'required|exists:pelanggans,id',
            'tanggal' => 'required|date',
            'status' => 'required|in:Diproses,Selesai,Dibatalkan',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::with('items')->findOrFail($id);

            // 🔁 Kembalikan stok lama
            foreach ($pesanan->items as $item) {
                $produk = Produk::findOrFail($item->produk_id);
                $produk->stok += $item->jumlah;
                $produk->save();
            }

            $pesanan->items()->delete();

            $total = 0;

            // 🔁 Validasi stok baru
            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi. Tersedia: {$produk->stok}");
                }
                $total += $produk->harga * $item['jumlah'];
            }

            $pesanan->update([
                'id_pelanggan' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'total' => $total,
                'status' => $request->status,
            ]);

            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);

                PesananItem::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produk->id,
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $produk->harga * $item['jumlah'],
                ]);

                $produk->stok -= $item['jumlah'];
                $produk->save();
            }

            DB::commit();
            return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()]);
        }
    }
}
