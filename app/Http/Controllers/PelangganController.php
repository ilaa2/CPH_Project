<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PelangganController extends Controller
{
    public function index()
{
    $pelanggan = \App\Models\Pelanggan::orderBy('id', 'asc')->get();

    return \Inertia\Inertia::render('Pelanggan/Index', [
        'pelanggan' => $pelanggan,
    ]);
}

public function edit($id)
{
    $pelanggan = Pelanggan::findOrFail($id);
    return Inertia::render('Pelanggan/Edit', [
        'pelanggan' => $pelanggan,
    ]);
}

public function update(Request $request, $id)
{
    $request->validate([
        'nama' => 'required|string|max:100',
        'email' => 'nullable|email|max:100',
        'telepon' => 'nullable|string|max:20',
        'alamat' => 'nullable|string',
    ]);

    $pelanggan = Pelanggan::findOrFail($id);
    $pelanggan->update($request->only('nama', 'email', 'telepon', 'alamat'));

    return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil diperbarui.');
}

public function destroy($id)
{
    $pelanggan = Pelanggan::findOrFail($id);
    $pelanggan->delete();

    return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil dihapus.');
}
public function create()
{
    return Inertia::render('Pelanggan/Create');
}
public function store(Request $request)
{
    $request->validate([
        'nama' => 'required|string|max:100',
        'email' => 'nullable|email|max:100',
        'telepon' => 'nullable|string|max:20',
        'alamat' => 'nullable|string|max:255',
    ]);

    Pelanggan::create([
        'nama' => $request->nama,
        'email' => $request->email,
        'telepon' => $request->telepon,
        'alamat' => $request->alamat,
    ]);

    return redirect()->route('pelanggan.index')->with('success', 'Data pelanggan berhasil ditambahkan.');
}


}
