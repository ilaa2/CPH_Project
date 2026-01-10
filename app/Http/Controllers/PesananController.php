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
        $query = Pesanan::with(['pelanggan', 'items.produk', 'ulasan.fotos', 'ulasan.pelanggan'])
            ->where('status', '!=', 'Dibatalkan')
            ->orderByDesc('tanggal');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('pelanggan', function ($q) use ($search) {
                $q->where('nama', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $pesanan = $query->paginate(10)->withQueryString();

        return Inertia::render('Pesanan/Index', [
            'pesanan' => $pesanan,
            'filters' => $request->only(['search', 'status']),
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
            'biaya_pengiriman' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            $shippingCost = $request->biaya_pengiriman ?? 0;

            // 🔁 Cek stok sebelum buat pesanan
            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi. Tersedia: {$produk->stok}");
                }
                $subtotal += $produk->harga * $item['jumlah'];
            }

            $grandTotal = $subtotal + $shippingCost;

            // Simpan pesanan
            $pesanan = Pesanan::create([
                'id_pelanggan' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'biaya_pengiriman' => $shippingCost,
                'total' => $grandTotal,
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

                $produk->decrement('stok', $item['jumlah']);
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
        // Kembalikan stok jika pesanan dihapus
        foreach ($pesanan->items as $item) {
            $produk = Produk::find($item->produk_id);
            if ($produk) {
                $produk->increment('stok', $item->jumlah);
            }
        }
        
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
            'status' => 'required|in:pending,Diproses,Selesai',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'biaya_pengiriman' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::with('items')->findOrFail($id);

            // 1. Kembalikan stok lama
            foreach ($pesanan->items as $item) {
                $produk = Produk::find($item->produk_id);
                if ($produk) {
                    $produk->increment('stok', $item->jumlah);
                }
            }

            // Hapus item lama
            $pesanan->items()->delete();

            $subtotal = 0;
            $shippingCost = $request->biaya_pengiriman ?? $pesanan->biaya_pengiriman ?? 0;

            // 2. Validasi Stok Baru
            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi untuk status Aktif. Tersedia: {$produk->stok}");
                }
                
                $subtotal += $produk->harga * $item['jumlah'];
            }

            $grandTotal = $subtotal + $shippingCost;

            $pesanan->update([
                'id_pelanggan' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'biaya_pengiriman' => $shippingCost,
                'total' => $grandTotal,
                'status' => $request->status,
            ]);

                PesananItem::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produk->id,
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $produk->harga * $item['jumlah'],
                ]);

                $produk->decrement('stok', $item['jumlah']);

            DB::commit();
            return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()]);
        }
    }
}
