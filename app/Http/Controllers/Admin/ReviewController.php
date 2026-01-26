<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ulasan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter'); // 'produk' atau 'kunjungan'

        $ulasanQuery = Ulasan::with([
            'user:id,name,avatar',
            'pesanan',
            'produk',
            'kunjungan.tipe',
            'fotos'
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
                'balasan' => $item->balasan,
                'tanggal_balasan' => $item->tanggal_balasan,
            ];
        });

        return Inertia::render('Ulasan/Index', [
            'ulasanList' => $ulasan,
            'currentFilter' => $filter,
        ]);
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

    public function destroy($id)
    {
        Ulasan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
