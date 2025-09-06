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
                'user' => Auth::guard('pelanggan')->user() ?: Auth::guard('web')->user(),
            ],

            'cart' => function () {
                try {
                    $pelanggan = Auth::guard('pelanggan')->user();
                    if ($pelanggan) {
                        return [
                            'items' => Cart::with('product')
                                           ->where('pelanggan_id', $pelanggan->id)
                                           ->latest()
                                           ->get(),
                            'count' => Cart::where('pelanggan_id', $pelanggan->id)
                                           ->sum('quantity') ?? 0,
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error('Gagal mengambil data keranjang: ' . $e->getMessage());
                }

                return ['items' => [], 'count' => 0];
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
