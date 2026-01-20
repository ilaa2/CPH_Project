<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\User;
use App\Models\Produk;
use App\Models\PesananItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
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
            $statusInput = strtolower($request->status);
            
            // Map frontend tabs (Indonesian/English) to database status
            $statusMap = [
                'menunggu' => ['pending', 'menunggu pembayaran'],
                'diproses' => ['processed', 'diproses'],
                'dikirim'  => ['shipped', 'dikirim'],
                'selesai'  => ['completed', 'selesai'],
            ];

            // If found in map, search for both new and legacy values
            if (isset($statusMap[$statusInput])) {
                $query->whereIn('status', $statusMap[$statusInput]);
            } else {
                // Fallback for direct match
                $query->where('status', $request->status);
            }
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
        Log::info('STORE PESANAN REQUEST', $request->all());

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
            return redirect()->route('admin.pesanan.index')->with('success', 'Pesanan berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal menyimpan pesanan: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $pesanan = Pesanan::with(['user', 'items.produk', 'ulasan.fotos', 'ulasan.user'])->findOrFail($id);
        
        return Inertia::render('Pesanan/Show', [
            'pesanan' => $pesanan,
        ]);
    }

    public function edit($id)
    {
        $pesanan = Pesanan::with('items.produk', 'user')->findOrFail($id);
        return Inertia::render('Pesanan/Edit', compact('pesanan'));
    }

    public function update(Request $request, $id)
    {
        Log::info('UPDATE PESANAN', $request->all());

        $request->validate([
            'status' => 'required|in:pending,processed,shipped,completed',
            'nomor_resi' => 'nullable|string|max:50',
        ]);

        // Validasi tambahan: Resi wajib jika status Shipped
        if ($request->status === 'shipped' && empty($request->nomor_resi)) {
            return back()->withErrors(['nomor_resi' => 'Nomor resi wajib diisi jika status Dikirim.']);
        }

        DB::beginTransaction();
        try {
            $pesanan = Pesanan::findOrFail($id);
            $currentStatus = $pesanan->status;
            $newStatus = $request->status;

            // === VALIDASI STATUS FLOW ===
            // Normalisasi status lama (Indonesian) ke English lowercase untuk validasi
            $statusMap = [
                'menunggu pembayaran' => 'pending',
                'pending' => 'pending',
                
                'diproses' => 'processed',
                'processed' => 'processed',
                
                'dikirim' => 'shipped',
                'shipped' => 'shipped',
                
                'selesai' => 'completed',
                'completed' => 'completed',
            ];

            $normalizedCurrentStatus = $statusMap[strtolower($currentStatus)] ?? $currentStatus;

            $allowedTransitions = [
                'pending'   => ['processed'],
                'processed' => ['shipped', 'completed'], // completed untuk pickup/direct
                'shipped'   => ['completed'],
                'completed' => [], // Final state
            ];

            // Jika status berubah, validasi transisi
            if ($currentStatus !== $newStatus) {
                // Gunakan normalized status untuk cek rule transisi
                $allowed = $allowedTransitions[$normalizedCurrentStatus] ?? [];
                
                // Allow transition if newStatus is in allowed list
                if (!in_array($newStatus, $allowed)) {
                     // Fallback: Jika tidak ada di allowed, cek apakah statusnya sama (idempotent)
                     // tapi karena logic $currentStatus !== $newStatus sudah filter ini, maka ini murni error
                    throw new \Exception("Status tidak bisa diubah dari '{$currentStatus}' ke '{$newStatus}'. Transisi yang diizinkan: " . implode(', ', $allowed));
                }
            }

            // Update Status & Resi
            $pesanan->status = $newStatus;
            
            // Update Nomor Resi hanya jika status processed/shipped
            if (in_array($newStatus, ['processed', 'shipped'])) {
                 $pesanan->nomor_resi = $request->nomor_resi;
            }

            $pesanan->save();

            DB::commit();
            return redirect()->route('admin.pesanan.index')->with('success', 'Status pesanan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("UPDATE ORDER FAILED: " . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()]);
        }
    }

    // Method destroy() DIHAPUS - Pesanan tidak boleh dihapus
    // Pesanan adalah histori transaksi yang harus tetap ada
}
