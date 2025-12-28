<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => Auth::guard('web')->user(),
                'pelanggan' => Auth::guard('pelanggan')->user(),
            ],

            'cart' => function () {
                try {
                    $pelanggan = Auth::guard('pelanggan')->user();
                    if ($pelanggan) {
                        // 1. Ambil semua item dalam satu query yang efisien
                        $cartItems = Cart::with('product')
                                         ->where('pelanggan_id', $pelanggan->id)
                                         ->latest()
                                         ->get();

                        // 2. Hitung subtotal dari koleksi yang sudah ada
                        $subtotal = $cartItems->reduce(function ($carry, $item) {
                            return $carry + ($item->product->harga * $item->quantity);
                        }, 0);

                        return [
                            'items' => $cartItems,
                            'count' => $cartItems->count(), // 3. Hitung jumlah dari koleksi
                            'subtotal' => $subtotal,
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error('Gagal mengambil data keranjang: ' . $e->getMessage());
                }

                // Jika tidak ada pelanggan atau terjadi error
                return ['items' => [], 'count' => 0, 'subtotal' => 0];
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
