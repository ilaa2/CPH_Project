<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Redirect;

class CartController extends Controller
{
    use AuthorizesRequests;

    /**
     * Menambahkan produk ke keranjang atau mengupdate kuantitasnya.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;
        $requestedQty = $request->input('quantity', 1); // Default 1 jika tidak dikirim

        // Ambil stok produk untuk validasi
        $product = \App\Models\Produk::find($productId);
        if (!$product) {
            return redirect()->back()->with('error', 'Produk tidak ditemukan.');
        }

        $cartItem = Cart::where('user_id', $userId)
                          ->where('product_id', $productId)
                          ->first();

        $currentCartQty = $cartItem ? $cartItem->quantity : 0;
        $totalQtyAfterAdd = $currentCartQty + $requestedQty;

        // Validasi: cek apakah total melebihi stok
        if ($currentCartQty >= $product->stok) {
            return redirect()->back()->with('error', "Stok {$product->nama} sudah maksimal di keranjang ({$product->stok} item).");
        }

        if ($totalQtyAfterAdd > $product->stok) {
            // Hitung sisa yang bisa ditambahkan
            $canAdd = $product->stok - $currentCartQty;
            if ($canAdd <= 0) {
                return redirect()->back()->with('error', "Stok {$product->nama} sudah maksimal di keranjang.");
            }
            // Tambahkan sebanyak yang bisa
            $requestedQty = $canAdd;
            $totalQtyAfterAdd = $product->stok;
        }

        if ($cartItem) {
            $cartItem->update(['quantity' => $totalQtyAfterAdd]);
        } else {
            Cart::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $requestedQty,
            ]);
        }

        $message = $requestedQty < $request->input('quantity', 1)
            ? "Ditambahkan {$requestedQty} item (stok terbatas)."
            : 'Produk berhasil ditambahkan ke keranjang!';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Mengubah jumlah produk di keranjang.
     */
    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id != Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart->update(['quantity' => $validated['quantity']]);

        return redirect()->back();
    }

    /**
     * Menghapus produk dari keranjang.
     */
    public function destroy(Cart $cart)
    {
        if ($cart->user_id != Auth::id()) {
            abort(403);
        }
        $cart->delete();
        return redirect()->back();
    }

    /**
     * Memproses item yang dipilih dari keranjang untuk checkout.
     */
    public function processSelection(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*' => ['integer', function ($attribute, $value, $fail) {
                if (!Cart::where('id', $value)->where('user_id', Auth::id())->exists()) {
                    $fail("Item dengan ID {$value} tidak valid.");
                }
            }],
        ]);

        session(['selected_cart_items' => $request->input('items')]);
        return Redirect::route('checkout.index');
    }
}
