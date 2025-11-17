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

    public function index()
    {
        $selectedItemIds = session('selected_cart_items', []);
        if (empty($selectedItemIds)) {
            return Redirect::route('cart.index')->with('error', 'Silakan pilih produk yang ingin di-checkout.');
        }
        $pelanggan = Auth::guard('pelanggan')->user();
        return Inertia::render('Customer/Checkout/Checkout1', [
            'pelanggan' => $pelanggan,
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
            'subdistrict_id' => 'required|integer',
            'subdistrict_name' => 'required|string',
            'zip_code' => 'required|string|max:10',
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
            'subdistrict_id' => $validated['subdistrict_id'],
            'zip_code' => $validated['zip_code'],
        ]]);

        return redirect()->route('checkout.shipping');
    }

    public function shipping()
    {
        $alamat = session('checkout_address');
        if (!$alamat || !isset($alamat['subdistrict_id'])) {
            return redirect()->route('checkout.index')->with('error', 'Silakan lengkapi alamat pengiriman terlebih dahulu.');
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

        // Asumsi berat produk dalam gram. Jika tidak ada, gunakan default 1000 gram (1kg) per item.
        // Pastikan model Produk memiliki atribut 'berat'.
        $totalWeight = $cartItems->sum(fn($item) => ($item->product->berat ?? 1000) * $item->quantity);
        if ($totalWeight <= 0) {
            $totalWeight = 1000; // Berat minimum jika total 0
        }

        // Panggil API Komerce dari backend
        $shippingOptions = [];
        try {
            $requestPayload = [
                'origin' => config('rajaongkir.origin'),
                'destination' => $alamat['subdistrict_id'],
                'weight' => $totalWeight,
                'courier' => 'jne:pos:tiki', // Kurir yang didukung
            ];

            Log::info('Komerce API Request Payload:', $requestPayload);

            $response = Http::withHeaders(['key' => config('rajaongkir.api_key')])
                ->asForm()
                ->post(config('rajaongkir.base_url') . '/calculate/domestic-cost', $requestPayload);

            Log::info('Komerce API Response:', ['status' => $response->status(), 'body' => $response->json()]);

            if ($response->successful()) {
                $shippingOptions = $response->json()['data'] ?? [];
            } else {
                Log::error('Komerce API (Cost Calculation) failed in shipping method: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Exception during Komerce API call in shipping method: ' . $e->getMessage());
        }

        return Inertia::render('Customer/Checkout/Checkout2', [
            'alamat' => $alamat,
            'shippingOptions' => $shippingOptions,
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
        $alamat = session('checkout_address');
        $pengiriman = session('checkout_shipping');
        $selectedItemIds = session('selected_cart_items', []);
        $pelangganId = Auth::guard('pelanggan')->id();

        if (!$alamat || !$pengiriman || empty($selectedItemIds)) {
            return Redirect::route('checkout.index')->with('error', 'Sesi checkout tidak lengkap. Silakan ulangi dari awal.');
        }

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

    // === METHOD process() SEKARANG ADA DI SINI (TEMPAT YANG BENAR) ===
    // Ganti seluruh method process() di CheckoutController.php dengan ini

// Ganti seluruh method process() di CheckoutController.php dengan ini

// Ganti seluruh method process() di CheckoutController.php dengan ini

// Ganti seluruh method process() di CheckoutController.php dengan ini

// Ganti seluruh method process() di CheckoutController.php dengan ini

public function process(Request $request)
{
    return DB::transaction(function () {
        $pelanggan = Auth::guard('pelanggan')->user();
        $alamat = session('checkout_address');
        $pengiriman = session('checkout_shipping');
        $selectedItemIds = session('selected_cart_items', []);

        if (!$pelanggan || !$alamat || !$pengiriman || empty($selectedItemIds)) {
            return back()->withErrors(['message' => 'Sesi Anda telah berakhir. Silakan ulangi proses checkout.']);
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
