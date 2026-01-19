<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\User;
use App\Models\Produk;
use App\Models\PesananItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PesananController extends Controller
{
    public function index(Request $request)
    {
        $query = Pesanan::with(['user', 'items.produk', 'ulasan.fotos', 'ulasan.user'])
            ->where('status', '!=', 'Dibatalkan')
            ->orderByDesc('tanggal');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $pesanan = $query->paginate(10)->withQueryString();

        return Inertia::render('Pesanan/Index', [
            'pesanan' => $pesanan,
            'filters' => $request->only(['search', 'status']),
            'pelangganList' => User::where('role', 'customer')->get(),
            'produkList' => Produk::where('stok', '>', 0)->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Pesanan/Create', [
            'pelangganList' => User::where('role', 'customer')->get(),
            'produkList' => Produk::all()
        ]);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('STORE PESANAN REQUEST', $request->all());

        $request->validate([
            'pelanggan_id' => 'required|exists:users,id',
            'tanggal' => 'required|date',
            'status' => 'sometimes|in:pending,Diproses,Selesai,Dibatalkan',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'metode_pengiriman' => 'required|in:pickup,local,shipping',
            'alamat_pengiriman' => 'required_if:metode_pengiriman,local,shipping',
            'ekspedisi' => 'required_if:metode_pengiriman,shipping',
            'estimasi'  => 'nullable|string',
            'biaya_pengiriman' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            $biaya = $request->biaya_pengiriman ?? 0;
            $namaMetode = 'Ambil di Toko';
            $ekspedisi = null;
            $estimasi = null;
            $alamat = 'Ambil di Toko';

            if ($request->metode_pengiriman === 'pickup') {
                $biaya = 0;
            } elseif ($request->metode_pengiriman === 'local') {
                $namaMetode = 'Kurir Lokal';
                $ekspedisi = 'Kurir Lokal';
                $alamat = $request->alamat_pengiriman;
            } elseif ($request->metode_pengiriman === 'shipping') {
                $namaMetode = $request->ekspedisi ?? 'Ekspedisi';
                $ekspedisi = $request->ekspedisi;
                $estimasi = $request->estimasi;
                $alamat = $request->alamat_pengiriman;
            }

            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi. Tersedia: {$produk->stok}");
                }
                $subtotal += $produk->harga * $item['jumlah'];
            }
            $grandTotal = $subtotal + $biaya;

            $pesanan = Pesanan::create([
                'user_id' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'biaya_pengiriman' => $biaya,
                'total' => $grandTotal,
                'status' => $request->status ?? 'Diproses',
                'metode_pengiriman' => $namaMetode,
                'alamat_pengiriman' => $alamat,
                'ekspedisi' => $ekspedisi,
                'estimasi' => $estimasi,
            ]);

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
        $pesanan = Pesanan::with('items.produk', 'user')->findOrFail($id);
        $produkList = Produk::all();
        $pelangganList = User::where('role', 'customer')->get();

        return Inertia::render('Pesanan/Edit', compact('pesanan', 'produkList', 'pelangganList'));
    }

    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Log::info('UPDATE PESANAN', $request->all());

        $request->validate([
            'pelanggan_id' => 'required|exists:users,id',
            'tanggal' => 'required|date',
            'status' => 'required|in:pending,Diproses,Selesai,Dibatalkan',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:products,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'metode_pengiriman' => 'required|in:pickup,local,shipping',
            'alamat_pengiriman' => 'required_if:metode_pengiriman,local,shipping',
            'ekspedisi' => 'required_if:metode_pengiriman,shipping,local',
            'estimasi'  => 'nullable|string',
            'biaya_pengiriman' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::with('items')->findOrFail($id);

            // Revert old stock
            foreach ($pesanan->items as $item) {
                $produk = Produk::find($item->produk_id);
                if ($produk) {
                    $produk->increment('stok', $item->jumlah);
                }
            }

            $pesanan->items()->delete();

            $subtotal = 0;
            $biaya = $request->biaya_pengiriman ?? 0;
            $namaMetode = 'Ambil di Toko';
            $ekspedisi = null;
            $estimasi = null;
            $alamat = 'Ambil di Toko';

            if ($request->metode_pengiriman === 'pickup') {
                $biaya = 0;
            } elseif ($request->metode_pengiriman === 'local') {
                $namaMetode = 'Kurir Lokal';
                $ekspedisi = 'Kurir Lokal';
                $alamat = $request->alamat_pengiriman;
            } elseif ($request->metode_pengiriman === 'shipping') {
                $namaMetode = $request->ekspedisi ?? 'Ekspedisi';
                $ekspedisi = $request->ekspedisi;
                $estimasi = $request->estimasi;
                $alamat = $request->alamat_pengiriman;
            }

            $pesanan->update([
                'user_id' => $request->pelanggan_id,
                'tanggal' => $request->tanggal,
                'biaya_pengiriman' => $biaya,
                'status' => $request->status,
                'metode_pengiriman' => $namaMetode,
                'alamat_pengiriman' => $alamat,
                'ekspedisi' => $ekspedisi,
                'estimasi' => $estimasi,
            ]);

            foreach ($request->items as $item) {
                $produk = Produk::findOrFail($item['produk_id']);
                
                if ($request->status !== 'Dibatalkan') {
                    if ($produk->stok < $item['jumlah']) {
                        throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi. Tersedia: {$produk->stok}");
                    }
                    $produk->decrement('stok', $item['jumlah']);
                }
                
                $lineTotal = $produk->harga * $item['jumlah'];
                $subtotal += $lineTotal;

                PesananItem::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produk->id,
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $lineTotal,
                ]);
            }

            $grandTotal = $subtotal + $biaya;
            $pesanan->update(['total' => $grandTotal]);

            DB::commit();
            return redirect()->route('pesanan.index')->with('success', 'Pesanan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("UPDATE ORDER FAILED: " . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()]);
        }
    }
}
