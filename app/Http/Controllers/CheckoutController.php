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
                 $pelangganId = Auth::guard('pelanggan')->id();
                 // Validate that these items belong to the user
                 $validItemIds = Cart::whereIn('id', $items)
                                     ->where('pelanggan_id', $pelangganId)
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
            'method' => 'required|in:pickup,delivery',
        ]);

        session(['checkout_method' => $validated['method']]);

        // Clean up previous session data to avoid conflicts
        if ($validated['method'] === 'pickup') {
            session()->forget(['checkout_address', 'checkout_shipping']);
            return redirect()->route('checkout.summary');
        } else {
            return redirect()->route('checkout.address');
        }
    }

    public function address()
    {
        // Ensure method is delivery
        if (session('checkout_method') !== 'delivery') {
            return redirect()->route('checkout.index'); 
        }

        $pelanggan = Auth::guard('pelanggan')->user();
        $savedAddress = session('checkout_address');

        return Inertia::render('Customer/Checkout/Checkout1', [
            'pelanggan' => $pelanggan,
            'savedAddress' => $savedAddress, // Pass saved session address if any
        ]);
    }

    public function saveAddress(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'telepon' => 'required|string|max:20',
            'alamat' => 'required|string',
            'province_id' => 'required|integer',
            'province_name' => 'required|string',
            'city_id' => 'required|integer',
            'city_name' => 'required|string',
            'district_id' => 'required|integer',
            'district_name' => 'required|string',
            'subdistrict_id' => 'required|integer', // Required for shipping cost
            'subdistrict_name' => 'nullable|string', // Village name, optional now
            'zip_code' => 'required|string|digits:5', // 5-digit numeric as requested
        ]);

        $address_parts = [
            (string)($validated['alamat'] ?? ''),
            (string)($validated['subdistrict_name'] ?? ''),
            (string)($validated['district_name'] ?? ''),
            (string)($validated['city_name'] ?? ''),
            (string)($validated['province_name'] ?? ''),
            (string)($validated['zip_code'] ?? '')
        ];

        $full_address = implode(', ', array_filter($address_parts, fn($value) =>
            $value !== '' &&
            $value !== 'undefined' &&
            $value !== 'null'
        ));

        session(['checkout_address' => [
            'nama' => $validated['nama'],
            'telepon' => $validated['telepon'],
            'alamat' => $validated['alamat'],
            'full_address_string' => $full_address,
            'province_id' => $validated['province_id'],
            'city_id' => $validated['city_id'],
            'district_id' => $validated['district_id'],
            'subdistrict_id' => $validated['subdistrict_id'],
            'zip_code' => $validated['zip_code'],
        ]]);

        return redirect()->route('checkout.shipping');
    }

    public function shipping()
    {
        // If pickup, skip straight to summary
        if (session('checkout_method') === 'pickup') {
             return redirect()->route('checkout.summary');
        }

        $alamat = session('checkout_address');
        if (!$alamat || !isset($alamat['subdistrict_id'])) {
            return redirect()->route('checkout.address')->with('error', 'Silakan lengkapi alamat pengiriman terlebih dahulu.');
        }

        $selectedItemIds = session('selected_cart_items', []);
        if (empty($selectedItemIds)) {
            return Redirect::route('cart.index')->with('error', 'Keranjang Anda kosong.');
        }

        $pelangganId = Auth::guard('pelanggan')->id();
        $cartItems = Cart::with('product')->whereIn('id', $selectedItemIds)->where('pelanggan_id', $pelangganId)->get();

        if ($cartItems->isEmpty()) {
            return Redirect::route('cart.index')->with('error', 'Item yang Anda pilih tidak ditemukan.');
        }

        // Asumsi berat produk dalam gram. Default 200g jika tidak ada.
        $totalWeight = $cartItems->sum(fn($item) => ($item->product->berat ?? 200) * $item->quantity);
        if ($totalWeight <= 0) {
            $totalWeight = 200; 
        }

        // === FRESH PRODUCE SHIPPING LOGIC ===

        $dist = strtolower($alamat['district_name'] ?? '');
        $city = strtolower($alamat['city_name'] ?? '');
        $full = strtolower($alamat['full_address_string'] ?? '');
        
        $isLocal = false;
        $localCost = 0;
        $localEta = '';
        $distance = 0;

        // 1. Allowed Districts for Local Courier (Duri & Surroundings)
        $allowedDistricts = ['mandau', 'bathin solapan', 'pinggir', 'talang muandau'];
        
        // Check if district is in allowed list
        $inAllowedDistrict = false;
        foreach ($allowedDistricts as $allowed) {
            if (str_contains($dist, $allowed)) {
                $inAllowedDistrict = true;
                break;
            }
        }

        // Special Case: Bengkalis City (Island) -> Not "Local" in terms of Duri Courier usually, 
        // but user previous request listed "Bengkalis" in "Destination within". 
        // However, "Mandau" to "Bengkalis" (Island) is far (Hours of travel + Roro).
        // User's latest prompt: "If destination city === Mandau / Duri / Bengkalis".
        // "Bengkalis city" likely means the Regency Capital if they mean local. 
        // But geographically, Duri (Mandau) is ~3-4 hours from Bengkalis Island.
        // Giving benefit of doubt to User Rule: "Bengkalis city" is allowed.
        // We will assume "Bengkalis" in city field allows it, but maybe higher distance?
        // User said: "Mandau -> Babussalam... Reasonable cost Rp 5000-15000".
        // User said: "Max distance allowed: 20 km".
        // Bengkalis Island is > 100km from Duri. 
        // IF user means "Bengkalis Regency" (which contains Duri), then `district` check covers it.
        // IF user really means the Island City, 20km limit excludes it.
        // I will stick to the DISTRICT check as primary "Local Area" definition + 20km limit.
        
        if ($inAllowedDistrict) {
            $isLocal = true;
            
            // Distance Simulation (No API)
            // Central Store: Jl Melayu, Babussalam, Mandau.
            
            if (str_contains($full, 'babussalam') || str_contains($full, 'jl. melayu')) {
                $distance = 1; // 1 km
            } elseif (str_contains($dist, 'mandau')) {
                $distance = 3; // Avg distance in Mandau
            } elseif (str_contains($dist, 'bathin solapan')) {
                $distance = 8; // Neighboring district
            } elseif (str_contains($dist, 'pinggir')) {
                $distance = 15; // Further out
            } elseif (str_contains($dist, 'talang muandau')) {
                $distance = 20; // Max allowed
            } else {
                $distance = 5; // Default local
            }

            // Pricing Logic: Base 5.000 + (3.000 * km)
            $localCost = 5000 + ($distance * 3000);
            
            // Cap visual ranges if needed, or just value.
            // User example: <= 5km -> 5-10k. My formula: 1km -> 8k. 3km -> 14k. 5km -> 20k.
            // User example: 10km -> 15-25k. My formula: 10km -> 35k.
            // My formula is a bit steeper than user example "Max distance 20km".
            // Let's adjust to fit user's "Reasonable cost" expectation better.
            // Base 5000 + 2000/km? -> 10km = 25k. Better.
            
            $localCost = 5000 + ($distance * 2000); 

            $localEta = ($distance <= 5) ? 'Same Day (Hari Ini)' : 'Next Day (Besok)';
        }

        $shippingOptions = [];

        if ($isLocal) {
            // Local Courier Option
            $shippingOptions[] = [
                'code' => 'LOCAL',
                'name' => 'Kurir Lokal',
                'service' => 'Express Fresh',
                'description' => 'Pengiriman Cepat (Fresh Produce)',
                'cost' => $localCost,
                'etd' => $localEta
            ];
        } else {
            // National Courier (RajaOngkir) - Filtered
            try {
                $requestPayload = [
                    'origin' => config('rajaongkir.origin'),
                    'originType' => 'subdistrict', 
                    'destination' => $alamat['city_id'],
                    'destinationType' => 'city',
                    'weight' => $totalWeight,
                    'courier' => 'jne:pos:tiki', 
                ];

                $response = Http::withHeaders(['key' => config('rajaongkir.api_key')])
                    ->asForm()
                    ->post(config('rajaongkir.base_url') . '/calculate/domestic-cost', $requestPayload);

                if ($response->successful()) {
                    $rawOptions = $response->json()['data'] ?? [];
                    
                    // Filter Rules
                    $allowedServices = ['REG', 'ECO', 'YES', 'ONS', 'SDS', 'HDS', 'PAKET KILAT KHUSUS']; 
                    $excludedCodes = ['T15', 'T25', 'T60', 'TRC', 'JTR', 'MOTOR', 'KARGO', 'TRUCKING'];

                    foreach ($rawOptions as $option) {
                        $serviceCode = strtoupper($option['service'] ?? '');
                        $desc = strtoupper($option['description'] ?? '');
                        $eta = $option['etd'] ?? '';
                        
                        // 1. Exclude forbidden types
                        if (in_array($serviceCode, $excludedCodes)) continue;
                        if (str_contains($desc, 'CARGO') || str_contains($desc, 'TRUCKING') || str_contains($desc, 'MOTOR')) continue;

                        // 2. ETA Max 5 Days Check
                        // Parse "2-3" or "3" or "1-2 Days"
                        $maxDays = 100; // Default high
                        if (preg_match_all('/\d+/', $eta, $matches)) {
                            $numbers = $matches[0];
                            if (count($numbers) > 0) {
                                $maxDays = max($numbers);
                            }
                        }
                        
                        // Strict 5 Days Warning Rule
                        if ($maxDays > 5) continue;

                        $shippingOptions[] = $option;
                    }

                } else {
                    Log::error('Komerce/RO API Error: ' . $response->body());
                }
            } catch (\Exception $e) {
                Log::error('Shipping Calculation Exception: ' . $e->getMessage());
            }
        }

        return Inertia::render('Customer/Checkout/Checkout2', [
            'alamat' => $alamat,
            'shippingOptions' => $shippingOptions,
            'isLocal' => $isLocal, // Used for frontend UI if needed (though options are self-contained now)
        ]);
    }

    public function saveShipping(Request $request)
    {
        $validated = $request->validate([
            'pengiriman' => 'required|array',
            'pengiriman.name' => 'required|string',
            'pengiriman.price' => 'required|numeric',
            'pengiriman.description' => 'required|string',
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

        $pelangganId = Auth::guard('pelanggan')->id();

        // Buat item keranjang sementara atau update yang sudah ada
        $cartItem = Cart::updateOrCreate(
            [
                'pelanggan_id' => $pelangganId,
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

        if ($method === 'pickup') {
            // For pickup, we don't have these, but view might expect them or we handle in view
            $pengiriman = [
                'name' => 'Ambil Sendiri',
                'price' => 0,
                'description' => 'Ambil di Toko',
                'service' => 'PICKUP'
            ];
            $alamat = [
                'full_address_string' => 'Ambil di Toko (Self Pickup)',
                'nama' => Auth::guard('pelanggan')->user()->nama,
                'telepon' => Auth::guard('pelanggan')->user()->telepon,
            ];
        } else {
            $alamat = session('checkout_address');
            $pengiriman = session('checkout_shipping');
            
            if (!$alamat || !$pengiriman) {
                return Redirect::route('checkout.index')->with('error', 'Data pengiriman belum lengkap.');
            }
        }
        
        $pelangganId = Auth::guard('pelanggan')->id();

        $cartItems = Cart::with('product')
                         ->whereIn('id', $selectedItemIds)
                         ->where('pelanggan_id', $pelangganId)
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
        return DB::transaction(function () {
            $pelanggan = Auth::guard('pelanggan')->user();
            $selectedItemIds = session('selected_cart_items', []);
            $method = session('checkout_method');

            if (!$pelanggan || empty($selectedItemIds)) {
                 return back()->withErrors(['message' => 'Sesi Anda telah berakhir.']);
            }

        $alamat = [];
        $pengiriman = [];

        if ($method === 'pickup') {
            $alamat = [
                'full_address_string' => 'AMBIL DI TOKO', // Dummy address for DB constraint
                'nama' => $pelanggan->nama,
                'telepon' => $pelanggan->telepon,
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

        $cartItems = Cart::with('product')->whereIn('id', $selectedItemIds)->where('pelanggan_id', $pelanggan->id)->get();
        if ($cartItems->isEmpty()) {
            return back()->withErrors(['message' => 'Produk di keranjang tidak ditemukan.']);
        }

        $subtotal = $cartItems->sum(fn($item) => $item->product->harga * $item->quantity);
        $shippingCost = $pengiriman['price'] ?? 0;
        $grandTotal = $subtotal + $shippingCost;

        $orderId = 'ORD-' . strtoupper(Str::random(8));

        $pesanan = Pesanan::create([
            'id_pelanggan'      => $pelanggan->id,
            'total'             => $grandTotal,
            'nomor_pesanan'     => $orderId,
            'status'            => 'pending',
            'alamat_pengiriman' => $alamat['full_address_string'],
            'metode_pengiriman' => $pengiriman['name'] ?? 'Standar',
            'biaya_pengiriman'  => $shippingCost,
            'tanggal'           => now(),
        ]);

        foreach ($cartItems as $item) {
            PesananItem::create([
                'pesanan_id' => $pesanan->id,
                'produk_id'  => $item->product_id,
                'jumlah'     => $item->quantity,
                'subtotal'   => $item->product->harga * $item->quantity,
            ]);
        }

        $transaction = Transaction::create([
            'pesanan_id'        => $pesanan->id,
            'uuid'              => $orderId, // Ini yang sebelumnya hilang
            'customer_name'     => $alamat['nama'],
            'customer_email'    => $pelanggan->email,
            'customer_phone'    => $alamat['telepon'],
            'address'           => $alamat['full_address_string'],
            'shipping_method'   => $pengiriman['name'] ?? 'Standar',
            'shipping_cost'     => $shippingCost,
            'total_amount'      => $subtotal,
            'grand_total'       => $grandTotal,
            'payment_status'    => 'pending',
        ]);

        Cart::whereIn('id', $selectedItemIds)->where('pelanggan_id', $pelanggan->id)->delete();
        session()->forget(['selected_cart_items', 'checkout_address', 'checkout_shipping']);

        if (env('MIDTRANS_ENABLED', false)) {
            $payload = [
                'transaction_details' => ['order_id' => $transaction->uuid, 'gross_amount' => $transaction->grand_total],
                'customer_details' => ['first_name' => $transaction->customer_name, 'email' => $transaction->customer_email, 'phone' => $transaction->customer_phone],
            ];

            $snapToken = Snap::getSnapToken($payload);
            $transaction->update(['midtrans_snap_token' => $snapToken]);

            return back()->with('flash', [
                'snap_token' => $snapToken,
                'redirect_url' => route('customer.pesanan.show', $pesanan->id)
            ]);
        } else {
            $pesanan->update(['status' => 'Diproses']);
            $transaction->update(['payment_status' => 'success']);

            return redirect()->route('customer.pesanan.show', $pesanan->id)
                             ->with('success', 'Pesanan Anda berhasil dibuat!');
        }
    });
}

}
