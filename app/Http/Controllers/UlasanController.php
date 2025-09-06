<?php

namespace App\Http\Controllers;

use App\Models\Ulasan;
use Inertia\Inertia;

class UlasanController extends Controller
{
    public function index()
    {
        $ulasan = Ulasan::with('pelanggan:id,nama')
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama' => $item->pelanggan->nama,
                    'komentar' => $item->komentar,
                    'rating' => $item->rating,
                    'tanggal' => $item->tanggal
                ];
            });

        return Inertia::render('Ulasan/Index', [
            'ulasanList' => $ulasan
        ]);
    }

    public function welcome()
    {
        $testimonials = Ulasan::with('pelanggan:id,nama')
            ->orderBy('tanggal', 'desc')
            ->take(10) // ambil maksimal 10 terbaru
            ->get()
            ->map(function ($item) {
                return [
                    'text' => $item->komentar,
                    'name' => $item->pelanggan->nama,
                    'rating' => $item->rating,
                    'role' => 'Pelanggan'
                ];
            });

        return Inertia::render('Welcome', [
            'testimonials' => $testimonials
        ]);
    }

    public function destroy($id)
    {
        Ulasan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
