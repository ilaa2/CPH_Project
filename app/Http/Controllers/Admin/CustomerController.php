<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     * Menampilkan daftar customer (role = 'customer')
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->withCount(['pesanan', 'kunjungan'])
            ->withSum('pesanan as total_belanja', 'total')
            ->orderBy('created_at', 'desc');

        // Filter pencarian nama
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%{$search}%");
        }

        $pelanggan = $query->paginate(10)->withQueryString();

        // Statistik ringkas
        $totalCustomers = User::where('role', 'customer')->count();
        $totalKunjungan = \App\Models\Kunjungan::whereHas('user', function($q) {
            $q->where('role', 'customer');
        })->count();
        $totalUlasan = \App\Models\Ulasan::count();

        return Inertia::render('Pelanggan/Index', [
            'pelanggan' => $pelanggan,
            'filters' => $request->only(['search']),
            'stats' => [
                'total' => $totalCustomers,
                'kunjungan' => $totalKunjungan,
                'ulasan' => $totalUlasan,
            ]
        ]);
    }

    public function edit($id)
    {
        $pelanggan = User::where('role', 'customer')->findOrFail($id);
        return Inertia::render('Pelanggan/Edit', [
            'pelanggan' => $pelanggan,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('avatar')) {
                $filePath = $request->file('avatar')->store('profile-photos', 'public');
            }

            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'alamat' => $request->alamat,
                'avatar' => $filePath,
                'role' => 'customer',
                'password' => bcrypt('password'), // Default password for admin-created customers
            ]);

            return redirect()->route('admin.pelanggan.index')->with('success', 'Data pelanggan berhasil ditambahkan.');

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
        $pelanggan = User::where('role', 'customer')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:users,email,' . $pelanggan->id,
            'phone' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $dataToUpdate = $request->only('name', 'email', 'phone', 'alamat');

        if ($request->hasFile('avatar')) {
            // Hapus foto lama jika ada
            if ($pelanggan->avatar && Storage::disk('public')->exists($pelanggan->avatar)) {
                Storage::disk('public')->delete($pelanggan->avatar);
            }
            // Simpan foto baru
            $dataToUpdate['avatar'] = $request->file('avatar')->store('profile-photos', 'public');
        }

        $pelanggan->update($dataToUpdate);

        return redirect()->route('admin.pelanggan.index')->with('success', 'Data pelanggan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $pelanggan = User::where('role', 'customer')->findOrFail($id);

        // Hapus foto profil dari storage jika ada
        if ($pelanggan->avatar && Storage::disk('public')->exists($pelanggan->avatar)) {
            Storage::disk('public')->delete($pelanggan->avatar);
        }

        $pelanggan->delete();

        return redirect()->route('admin.pelanggan.index')->with('success', 'Data pelanggan berhasil dihapus.');
    }
}
