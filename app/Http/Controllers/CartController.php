<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // <-- Import DB Facade untuk increment yang lebih aman
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CartController extends Controller
{
    use AuthorizesRequests;

    /**
     * Menampilkan halaman keranjang.
     * Datanya sudah disediakan secara global oleh HandleInertiaRequests.
     */
    public function index()
    {
        // Kita hanya perlu menampilkan halaman Inertia-nya.
        // Tidak perlu query database lagi di sini.
        return inertia('Customer/Cart');
    }

    /**
     * Menambahkan produk ke keranjang atau mengupdate kuantitasnya.
     * --- INI BAGIAN YANG DIPERBAIKI ---
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $pelangganId = Auth::guard('pelanggan')->id();
        $productId = $request->product_id;
        $quantityToAdd = $request->quantity;

        // Cari item di keranjang milik pelanggan yang sedang login dengan product_id yang sama
        $cartItem = Cart::where('pelanggan_id', $pelangganId)
                        ->where('product_id', $productId)
                        ->first();

        if ($cartItem) {
            // JIKA PRODUK SUDAH ADA DI KERANJANG:
            // Tambahkan kuantitas yang ada dengan kuantitas baru.
            // DB::raw() memastikan operasi penambahan terjadi di level database,
            // ini lebih aman dari race condition.
            $cartItem->update([
                'quantity' => DB::raw("quantity + $quantityToAdd")
            ]);
            // Alternatif yang lebih sederhana:
            // $cartItem->increment('quantity', $quantityToAdd);

        } else {
            // JIKA PRODUK BELUM ADA DI KERANJANG:
            // Buat entri baru.
            Cart::create([
                'pelanggan_id' => $pelangganId,
                'product_id' => $productId,
                'quantity' => $quantityToAdd,
            ]);
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke keranjang!');
    }

    /**
     * Mengubah jumlah produk di keranjang.
     */
    public function update(Request $request, Cart $cart)
    {
        $this->authorize('update', $cart);

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart->update(['quantity' => $request->quantity]);

        return redirect()->back()->with('success', 'Jumlah produk diperbarui.');
    }

    /**
     * Menghapus produk dari keranjang.
     */
    public function destroy(Cart $cart)
    {
        $this->authorize('delete', $cart);

        $cart->delete();

        return redirect()->back()->with('success', 'Produk dihapus dari keranjang.');
    }
}
