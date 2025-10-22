<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class PelangganController extends Controller
{
    public function index(Request $request)
{
    $query = Pelanggan::query()->orderBy('created_at', 'desc');

    // Filter pencarian nama
    if ($request->has('search')) {
        $search = $request->input('search');
        $query->where('nama', 'LIKE', "%{$search}%");
    }

    $pelanggan = $query->paginate(10)->withQueryString();

    return Inertia::render('Pelanggan/Index', [
        'pelanggan' => $pelanggan,
        'filters' => $request->only(['search']),
    ]);
}

public function edit($id)
{
    $pelanggan = Pelanggan::findOrFail($id);
    return Inertia::render('Pelanggan/Edit', [
        'pelanggan' => $pelanggan,
    ]);
}



// ... (kode lain)

public function store(Request $request)
{
    $request->validate([
        'nama' => 'required|string|max:100',
        'email' => 'nullable|email|max:100|unique:pelanggans,email',
        'telepon' => 'nullable|string|max:20',
        'alamat' => 'nullable|string|max:255',
        'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    try {
        $filePath = null;
        if ($request->hasFile('foto_profil')) {
            $filePath = $request->file('foto_profil')->store('foto_pelanggan', 'public');
        }

        Pelanggan::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'telepon' => $request->telepon,
            'alamat' => $request->alamat,
            'foto_profil' => $filePath,
        ]);

        return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil ditambahkan.');

    } catch (QueryException $e) {
        // Check for unique constraint violation (error code 1062 for MySQL)
        if ($e->errorInfo[1] == 1062) {
            throw ValidationException::withMessages([
                'email' => 'Email ini sudah terdaftar. Silakan gunakan email lain.',
            ]);
        }

        // For other database errors, rethrow the exception.
        throw $e;
    }
}

public function update(Request $request, $id)
{
    $pelanggan = Pelanggan::findOrFail($id);

    $request->validate([
        'nama' => 'required|string|max:100',
        'email' => 'nullable|email|max:100|unique:pelanggans,email,' . $pelanggan->id,
        'telepon' => 'nullable|string|max:20',
        'alamat' => 'nullable|string',
        'foto_profil' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $dataToUpdate = $request->only('nama', 'email', 'telepon', 'alamat');

    if ($request->hasFile('foto_profil')) {
        // Hapus foto lama jika ada
        if ($pelanggan->foto_profil && Storage::disk('public')->exists($pelanggan->foto_profil)) {
            Storage::disk('public')->delete($pelanggan->foto_profil);
        }
        // Simpan foto baru
        $dataToUpdate['foto_profil'] = $request->file('foto_profil')->store('foto_pelanggan', 'public');
    }

    $pelanggan->update($dataToUpdate);

    return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil diperbarui.');
}

public function destroy($id)
{
    $pelanggan = Pelanggan::findOrFail($id);

    // Hapus foto profil dari storage jika ada
    if ($pelanggan->foto_profil && Storage::disk('public')->exists($pelanggan->foto_profil)) {
        Storage::disk('public')->delete($pelanggan->foto_profil);
    }

    $pelanggan->delete();

    return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil dihapus.');
}


}
