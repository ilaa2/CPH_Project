<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        ]);

        $pelangganId = Auth::guard('pelanggan')->id();
        $productId = $request->product_id;

        $cartItem = Cart::where('pelanggan_id', $pelangganId)
                          ->where('product_id', $productId)
                          ->first();

        if ($cartItem) {
            $cartItem->increment('quantity');
        } else {
            Cart::create([
                'pelanggan_id' => $pelangganId,
                'product_id' => $productId,
                'quantity' => 1,
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
        $this->authorize('delete', $cart);
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
                if (!Cart::where('id', $value)->where('pelanggan_id', Auth::guard('pelanggan')->id())->exists()) {
                    $fail("Item dengan ID {$value} tidak valid.");
                }
            }],
        ]);

        session(['selected_cart_items' => $request->input('items')]);
        return Redirect::route('checkout.index');
    }
}
