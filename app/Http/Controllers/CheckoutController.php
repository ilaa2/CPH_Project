<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Pesanan;
use App\Models\PesananItem;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    public function index(Request $request)
    {
        // If items are passed via query string (from Cart), save them to session
        if ($request->has('items')) {
            $items = $request->input('items');
            if (is_array($items)) {
                 $userId = Auth::id();
                 // Validate that these items belong to the user
                 $validItemIds = Cart::whereIn('id', $items)
                                     ->where('user_id', $userId)
                                     ->pluck('id')
                                     ->toArray();
                 
                 if (!empty($validItemIds)) {
                     session(['selected_cart_items' => $validItemIds]);
                 }
            }
        }

        $selectedItemIds = session('selected_cart_items', []);
        
        // If no items in session and none provided, redirection back handled here
        if (empty($selectedItemIds)) {
            return Redirect::route('belanja.index')->with('error', 'Silakan pilih produk yang ingin di-checkout.');
        }

        // Check if there is already a method selected? Maybe optional.
        // For now, always start fresh or show method selection.
        
        return Inertia::render('Customer/Checkout/CheckoutMethod'); 
    }

    public function saveMethod(Request $request)
    {
        $validated = $request->validate([
            'method' => 'required|in:pickup,local,expedition',
        ]);

        session(['checkout_method' => $validated['method']]);

        // Clean up previous session data to avoid conflicts
        session()->forget(['checkout_address', 'checkout_shipping']);

        if ($validated['method'] === 'pickup') {
            // Pickup: langsung ke summary
            return redirect()->route('checkout.summary');
        } else {
            // Local & Expedition: butuh alamat dulu
            return redirect()->route('checkout.address');
        }
    }

    public function address()
    {
        $method = session('checkout_method');
        
        // Only local and expedition need address
        if (!in_array($method, ['local', 'expedition'])) {
            return redirect()->route('checkout.index'); 
        }

        $user = Auth::user();
        $savedAddress = session('checkout_address');

        return Inertia::render('Customer/Checkout/Checkout1', [
            'user' => $user,
            'savedAddress' => $savedAddress,
            'checkoutMethod' => $method, // Pass method to frontend
        ]);
    }

    public function saveAddress(Request $request)
    {
        // 1. Log HIT awal (sesuai request user)
        Log::info('CHECKOUT ADDRESS SUBMIT HIT', $request->all());

        // 2. Relaxed Validation (biar tidak bounce karena format)
        $validated = $request->validate([
            'nama'      => 'required|string|max:255',
            'telepon'   => 'required|string|max:50', // Relaxed length
            'alamat'    => 'required|string',
            'area_id'   => 'required|string',
            'province_name' => 'nullable|string', // Nullable just in case
            'city_name'     => 'nullable|string',
            'district_name' => 'nullable|string',
            'zip_code'      => 'nullable', // Totally relaxed
        ]);

        $full_address = implode(', ', array_filter([
            $validated['alamat'],
            $validated['district_name'] ?? '',
            $validated['city_name'] ?? '',
            $validated['province_name'] ?? '',
            $validated['zip_code'] ?? ''
        ]));

        // 3. Simpan Session
        $addressData = [
            'nama' => $validated['nama'],
            'telepon' => $validated['telepon'],
            'alamat' => $validated['alamat'],
            'full_address_string' => $full_address,
            'area_id' => $validated['area_id'],
            'province_name' => $validated['province_name'],
            'city_name' => $validated['city_name'],
            'district_name' => $validated['district_name'],
            'zip_code' => $validated['zip_code'] ?? '',
            'full_area_label' => $request->input('full_area_label', ''),
        ];

        session(['checkout_address' => $addressData]);
        session()->save(); // Force save

        Log::info('checkout_address SAVED to Session:', $addressData);

        // 4. Redirect explicit
        return redirect()->route('checkout.shipping');
    }

    public function shipping()
    {
        Log::info('Entering shipping method.');
        $method = session('checkout_method');
        Log::info('Shipping Method in Session: ' . $method);
        
        // If pickup, skip straight to summary
        if ($method === 'pickup') {
            return redirect()->route('checkout.summary');
        }

        $alamat = session('checkout_address');
        Log::info('Address in Session: ' . json_encode($alamat));

        if (!$alamat) {
            Log::warning('Address missing in session. Redirecting back to address.');
            return redirect()->route('checkout.address')->with('error', 'Silakan lengkapi alamat pengiriman terlebih dahulu.');
        }

        $selectedItemIds = session('selected_cart_items', []);
        
        $userId = Auth::id();
        $cartItems = Cart::with('product')->whereIn('id', $selectedItemIds)->where('user_id', $userId)->get();

        if ($cartItems->isEmpty()) {
            // Fallback if session invalid or direct access
            if (!empty($selectedItemIds)) return Redirect::route('cart.index')->with('error', 'Item tidak ditemukan.');
             // If completely empty, maybe try to load all cart items? For now redirect.
            return Redirect::route('cart.index')->with('error', 'Keranjang kosong.');
        }

        // === SHIPPING LOGIC BASED ON METHOD ===
        
        $shippingOptions = [];
        $shippingError = null;
        $distance = 0;

        // === KURIR LOKAL (method = 'local') ===
        if ($method === 'local') {
            $dist = strtolower($alamat['district_name'] ?? '');
            $full = strtolower($alamat['full_address_string'] ?? '');
            
            // Allowed Districts for Local Courier (Duri & Surroundings, max 10km)
            $allowedDistricts = ['mandau', 'bathin solapan', 'pinggir'];
            
            $inAllowedDistrict = false;
            foreach ($allowedDistricts as $allowed) {
                if (str_contains($dist, $allowed)) {
                    $inAllowedDistrict = true;
                    break;
                }
            }

            if (!$inAllowedDistrict) {
                $shippingError = 'Kurir lokal hanya tersedia untuk area Kec. Mandau, Bathin Solapan, Pinggir (max 10 km dari toko). Silakan pilih metode Ekspedisi.';
            } else {
                // Simulasi jarak sederhana
                if (str_contains($full, 'melayu') || str_contains($full, 'sudirman')) {
                    $distance = 2;
                } elseif (str_contains($dist, 'mandau')) {
                    $distance = 4;
                } else {
                    $distance = 8;
                }

                // Hitung ongkir: Base 5.000 + 2.000/km
                $localCost = 5000 + ($distance * 2000);

                $shippingOptions[] = [
                    'code' => 'LOCAL',
                    'name' => 'Kurir Lokal',
                    'service' => 'Express Fresh',
                    'description' => 'Pengiriman cepat produk segar (Jarak: ~' . $distance . ' km)',
                    'cost' => (int) $localCost,
                    'etd' => 'Same Day',
                    'is_recommended' => true,
                ];
            }
        }

        // === EKSPEDISI (method = 'expedition') ===
        if ($method === 'expedition') {
            try {
                // Biteship Integration
                $originId = config('biteship.origin_area_id');
                $destId = $alamat['area_id'];

                if (!$originId || !$destId) {
                    throw new \Exception("Area ID missing");
                }

                // Map Items for Biteship
                $biteshipItems = $cartItems->map(function($item) {
                    return [
                        'name' => $item->product->nama,
                        'description' => 'Sayuran/Buah',
                        'value' => (int) $item->product->harga,
                        'length' => 10, 'width' => 10, 'height' => 10, // Dummy dimensions
                        'weight' => ($item->product->berat ?? 200), // Grams
                        'quantity' => $item->quantity
                    ];
                })->toArray();

                $response = Http::withHeaders(['Authorization' => 'Bearer ' . config('biteship.api_key')])
                    ->post(config('biteship.base_url') . '/rates/couriers', [
                        'origin_area_id' => $originId,
                        'destination_area_id' => $destId,
                        'couriers' => 'jne,sicepat,jnt,paxel,grab,gojek,anteraja', // Add more relevant ones
                        'items' => $biteshipItems
                    ]);

                if ($response->successful()) {
                    $rates = $response->json()['pricing'] ?? [];
                    
                    foreach ($rates as $rate) {
                        $cost = $rate['price'] ?? 0;
                        $courierName = $rate['courier_name'] ?? 'Kurir';
                        $service = $rate['service_name'] ?? 'Regular'; // e.g. "REG", "BEST"
                        $desc = $rate['description'] ?? '';
                        $duration = $rate['duration'] ?? ''; // e.g. "1 - 2 Days"

                        // Parse max days
                        $maxDays = 99;
                        if (preg_match_all('/\d+/', $duration, $matches)) {
                            $nums = $matches[0];
                            if (count($nums) > 0) $maxDays = (int) max($nums);
                        }

                        // Recommendation Logic
                        $isRecommended = $maxDays <= 5;
                        $warning = (!$isRecommended) ? ' (Risiko layu > 5 hari)' : '';
                        
                        // Show relevant options
                        $shippingOptions[] = [
                            'code' => strtoupper($rate['courier_code'] ?? 'UNK'),
                            'name' => $courierName,
                            'service' => $service,
                            'description' => $desc . " ($duration)" . $warning,
                            'cost' => (int) $cost,
                            'etd' => $duration, 
                            'max_days' => $maxDays, // Required by frontend
                            'is_recommended' => $isRecommended,
                        ];
                    }
                    
                    // Sort by recommended, then cheap
                    usort($shippingOptions, function ($a, $b) {
                        if ($a['is_recommended'] === $b['is_recommended']) {
                            return $a['cost'] <=> $b['cost'];
                        }
                        return $b['is_recommended'] <=> $a['is_recommended'];
                    });

                } else {
                     // Check if specific error (like balance)
                     $errData = $response->json();
                     if (isset($errData['error']) && str_contains(strtolower($errData['error']), 'balance')) {
                         $shippingError = 'Gagal memuat ongkir (Biteship Insufficient Balance). Menggunakan mode fallback.';
                         // Fallback Mock Data for Development
                         $shippingOptions = [
                             ['code' => 'JNE', 'name' => 'JNE', 'service' => 'REG (Mock)', 'description' => 'Estimasi 2-3 Hari', 'cost' => 24000, 'etd' => '2-3 Hari', 'is_recommended' => true],
                             ['code' => 'SICEPAT', 'name' => 'SiCepat', 'service' => 'BEST (Mock)', 'description' => 'Estimasi 1-2 Hari', 'cost' => 35000, 'etd' => '1-2 Hari', 'is_recommended' => true],
                         ];
                         $shippingError = null; // Clear error if fallback provided
                     } else {
                         Log::error('Biteship Rates Error: ' . $response->body());
                         $shippingError = 'Gagal mengambil data ongkir dari kurir. Silakan coba lagi nanti.';
                     }
                }

            } catch (\Exception $e) {
                Log::error('Shipping Calc Error: ' . $e->getMessage());
                $shippingError = 'Terjadi kesalahan sistem saat menghitung ongkir.';
            }
        }

        return Inertia::render('Customer/Checkout/Checkout2', [
            'user' => Auth::user(),
            'alamat' => $alamat, // Fix prop name mismatch (was savedAddress)
            'cartItems' => $cartItems,
            'shippingOptions' => $shippingOptions,
            'checkoutMethod' => $method,
            'shippingError' => $shippingError
        ]);
    }                        


    public function saveShipping(Request $request)
    {
        $validated = $request->validate([
            'pengiriman' => 'required|array',
            'pengiriman.name' => 'required|string',
            'pengiriman.price' => 'required|numeric',
            'pengiriman.description' => 'required|string',
            'pengiriman.extra_packaging' => 'nullable|boolean', // Allow extra packaging flag
        ]);
        session(['checkout_shipping' => $validated['pengiriman']]);
        return redirect()->route('checkout.summary');
    }

    public function buyNow(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $userId = Auth::id();

        // Buat item keranjang sementara atau update yang sudah ada
        $cartItem = Cart::updateOrCreate(
            [
                'user_id' => $userId,
                'product_id' => $validated['product_id'],
            ],
            [
                'quantity' => $validated['quantity'],
            ]
        );

        // Simpan hanya ID item ini ke sesi untuk di-checkout
        session(['selected_cart_items' => [$cartItem->id]]);

        // Arahkan ke langkah pertama checkout
        return redirect()->route('checkout.index');
    }

    // === METHOD summary() SEKARANG ADA DI SINI (TEMPAT YANG BENAR) ===
    public function summary()
    {
        $method = session('checkout_method');
        $selectedItemIds = session('selected_cart_items', []);
        
        if (empty($selectedItemIds)) {
             return Redirect::route('checkout.index')->with('error', 'Sesi checkout tidak valid.');
        }

        // Setup defaults for View
        $alamat = null;
        $pengiriman = null;
        $user = Auth::user();

        if ($method === 'pickup') {
            // For pickup, use store address
            $pengiriman = [
                'name' => 'Ambil di Toko',
                'price' => 0,
                'description' => 'Ambil langsung di lokasi',
                'service' => 'PICKUP'
            ];
            $alamat = [
                'full_address_string' => 'Jl. Melayu, Babussalam, Mandau, Kab. Bengkalis, Riau 28784',
                'nama' => $user->name,
                'telepon' => $user->phone,
            ];
        } else {
            $alamat = session('checkout_address');
            $pengiriman = session('checkout_shipping');
            
            if (!$alamat || !$pengiriman) {
                return Redirect::route('checkout.index')->with('error', 'Data pengiriman belum lengkap.');
            }
        }
        
        $userId = Auth::id();

        $cartItems = Cart::with('product')
                         ->whereIn('id', $selectedItemIds)
                         ->where('user_id', $userId)
                         ->get();

        if ($cartItems->isEmpty()) {
            return Redirect::route('cart.index')->with('error', 'Item yang Anda pilih tidak ditemukan. Silakan coba lagi.');
        }

        $subtotal = $cartItems->sum(fn($item) => $item->product->harga * $item->quantity);

        return Inertia::render('Customer/Checkout/Checkout3', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal,
            'alamat' => $alamat,
            'pengiriman' => $pengiriman,
        ]);
    }

    public function process(Request $request)
    {
        try {
            return DB::transaction(function () {
                $user = Auth::user();
                $selectedItemIds = session('selected_cart_items', []);
                $method = session('checkout_method');

                if (!$user || empty($selectedItemIds)) {
                    return back()->withErrors(['message' => 'Sesi Anda telah berakhir.']);
                }

                $alamat = [];
                $pengiriman = [];

                if ($method === 'pickup') {
                    $alamat = [
                        'full_address_string' => 'AMBIL DI TOKO',
                        'nama' => $user->name,
                        'telepon' => $user->phone,
                    ];
                    $pengiriman = [
                        'name' => 'Ambil Sendiri',
                        'price' => 0,
                    ];
                } else {
                    $alamat = session('checkout_address');
                    $pengiriman = session('checkout_shipping');

                    if (!$alamat || !$pengiriman) {
                        return back()->withErrors(['message' => 'Data pengiriman tidak lengkap.']);
                    }
                }

                $cartItems = Cart::with('product')->whereIn('id', $selectedItemIds)->where('user_id', $user->id)->get();
                if ($cartItems->isEmpty()) {
                    return back()->withErrors(['message' => 'Produk di keranjang tidak ditemukan.']);
                }

                $subtotal = $cartItems->sum(fn($item) => $item->product->harga * $item->quantity);
                $shippingCost = $pengiriman['price'] ?? 0;
                $grandTotal = $subtotal + $shippingCost;

                // Generate unique order ID untuk Midtrans
                $midtransOrderId = 'ORD-' . strtoupper(Str::random(8)) . '-' . time();

                $pesanan = Pesanan::create([
                    'user_id'           => $user->id,
                    'total'             => $grandTotal,
                    'nomor_pesanan'     => $midtransOrderId,
                    'status'            => 'pending',
                    'alamat_pengiriman' => $alamat['full_address_string'],
                    'metode_pengiriman' => $pengiriman['name'] ?? 'Standar',
                    'biaya_pengiriman'  => $shippingCost,
                    'tanggal'           => now(),
                    // Payment columns
                    'payment_status'    => 'unpaid',
                    'midtrans_order_id' => $midtransOrderId,
                ]);

                foreach ($cartItems as $item) {
                    $produk = $item->product;

                    if ($produk->stok < $item->quantity) {
                        throw new \Exception("Stok produk '{$produk->nama}' tidak mencukupi (Tersedia: {$produk->stok}).");
                    }

                    PesananItem::create([
                        'pesanan_id' => $pesanan->id,
                        'produk_id'  => $item->product_id,
                        'jumlah'     => $item->quantity,
                        'subtotal'   => $item->product->harga * $item->quantity,
                    ]);

                    // Kurangi Stok
                    $produk->decrement('stok', $item->quantity);
                }

                // Generate Midtrans Snap Token
                $payload = [
                    'transaction_details' => [
                        'order_id' => $midtransOrderId,
                        'gross_amount' => (int) $grandTotal,
                    ],
                    'customer_details' => [
                        'first_name' => $alamat['nama'] ?? $user->name,
                        'email' => $user->email,
                        'phone' => $alamat['telepon'] ?? $user->phone,
                    ],
                    'item_details' => $cartItems->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'name' => substr($item->product->nama, 0, 50),
                            'price' => (int) $item->product->harga,
                            'quantity' => $item->quantity,
                        ];
                    })->toArray(),
                ];

                // Add shipping as item if applicable
                if ($shippingCost > 0) {
                    $payload['item_details'][] = [
                        'id' => 'SHIPPING',
                        'name' => 'Ongkos Kirim',
                        'price' => (int) $shippingCost,
                        'quantity' => 1,
                    ];
                }

                // Add callbacks URLs untuk redirect setelah pembayaran
                $payload['callbacks'] = [
                    'finish' => url('/customer/payment/finish'),
                    'unfinish' => url('/customer/payment/unfinish'),
                    'error' => url('/customer/payment/error'),
                ];

                try {
                    $snapToken = Snap::getSnapToken($payload);
                    $pesanan->update(['snap_token' => $snapToken, 'payment_status' => 'pending']);
                } catch (\Exception $e) {
                    Log::error('Midtrans Snap Token Error: ' . $e->getMessage());
                    // Fallback: jika Midtrans gagal, tetap lanjutkan tanpa payment gateway
                    $snapToken = null;
                }

                // Hapus cart items setelah order dibuat
                Cart::whereIn('id', $selectedItemIds)->where('user_id', $user->id)->delete();
                session()->forget(['selected_cart_items', 'checkout_address', 'checkout_shipping', 'checkout_method']);

                // Return snap token ke frontend untuk trigger popup
                return Inertia::render('Customer/Checkout/PaymentProcess', [
                    'pesanan' => $pesanan->load('items.produk'),
                    'snapToken' => $snapToken,
                    'clientKey' => config('midtrans.client_key'),
                    'snapUrl' => config('midtrans.snap_url'),
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Checkout Process Error: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal memproses pesanan: ' . $e->getMessage()]);
        }
    }
}
