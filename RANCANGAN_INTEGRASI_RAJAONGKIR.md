# Rancangan Pengembangan Fitur Pengiriman Dinamis dengan API Komerce (RajaOngkir)

**Versi: 3.0**
**Status: Disetujui**

Dokumen ini menguraikan rencana teknis final untuk integrasi API Komerce. Rencana ini menggantikan semua versi sebelumnya setelah melalui proses diagnosis dan verifikasi API.

## 1. Latar Belakang & Perubahan Strategi

Rencana awal (Versi 2.0) berfokus pada penggunaan satu input pencarian yang memanggil endpoint `/destination/domestic-destination`. Setelah implementasi dan pengujian, endpoint ini terbukti **tidak dapat diandalkan** dan secara konsisten mengembalikan error `search: cannot be blank`, meskipun request dikirim dengan benar.

**Keputusan Strategis:** Pendekatan pencarian tunggal **ditinggalkan**. Strategi baru adalah mengimplementasikan **dropdown hierarkis (bertingkat)** yang menggunakan endpoint-endpoint API Komerce yang telah terbukti berfungsi selama diagnosis (`/province`, `/city/{id}`, `/district/{id}`, `/sub-district/{id}`).

Perubahan ini akan dipusatkan pada halaman **Checkout Langkah 1 (`Checkout1.jsx`)**, di mana pengguna memasukkan alamat, bukan di Langkah 2.

## 2. Alur Kerja Baru yang Disetujui

1.  **Halaman Alamat (`Checkout1.jsx`):**
    -   Pengguna tidak lagi mengetik nama provinsi, kota, dll., secara manual.
    -   Pengguna akan memilih alamat mereka dari 4 dropdown bertingkat: Provinsi -> Kota -> Kecamatan -> Kelurahan.
    -   Setelah Kelurahan dipilih, `subdistrict_id` yang valid dan `zip_code` akan disimpan.
    -   Saat form dikirim, `subdistrict_id` dan alamat lengkap dalam bentuk teks disimpan ke sesi Laravel.

2.  **Proses di Backend (`CheckoutController@shipping`):**
    -   Controller akan mengambil `subdistrict_id` dari sesi.
    -   Controller akan menghitung `totalWeight` dari keranjang belanja.
    -   Controller akan **langsung memanggil API Komerce untuk menghitung ongkos kirim**.
    -   Hasil kalkulasi (daftar opsi kurir) akan diteruskan sebagai *props* ke halaman berikutnya.

3.  **Halaman Pengiriman (`Checkout2.jsx`):**
    -   Halaman ini akan menjadi komponen presentasi sederhana ("dumb component").
    -   Ia hanya akan menerima daftar opsi kurir dari controller dan menampilkannya sebagai pilihan.
    -   Tidak ada lagi logika pencarian atau panggilan API di halaman ini.

## 3. Rencana Implementasi Teknis

### Bagian A: Backend - Penyesuaian API Internal

#### A1. Routes (`routes/web.php`)
Definisikan ulang route API internal untuk mendukung dropdown bertingkat. Hapus route yang lama.

```php
// Di dalam routes/web.php, di dalam grup middleware 'auth:pelanggan'
use App\Http\Controllers\Api\RajaOngkirController;

Route::prefix('api/locations')->name('api.locations.')->group(function () {
    Route::get('/provinces', [RajaOngkirController::class, 'getProvinces'])->name('provinces');
    Route::get('/cities/{provinceId}', [RajaOngkirController::class, 'getCities'])->name('cities');
    Route::get('/districts/{cityId}', [RajaOngkirController::class, 'getDistricts'])->name('districts');
    Route::get('/subdistricts/{districtId}', [RajaOngkirController::class, 'getSubdistricts'])->name('subdistricts');
});
```

#### A2. Controller (`Api/RajaOngkirController.php`)
Implementasikan metode-metode yang diperlukan untuk menyediakan data ke setiap dropdown.

```php
// Hapus/Ganti metode searchDestinations dan calculateShippingCost yang lama
// Tambahkan metode-metode baru ini:

public function getProvinces() { /* ... panggil endpoint /province ... */ }
public function getCities($provinceId) { /* ... panggil endpoint /destination/city/{provinceId} ... */ }
public function getDistricts($cityId) { /* ... panggil endpoint /destination/district/{cityId} ... */ }
public function getSubdistricts($districtId) { /* ... panggil endpoint /destination/sub-district/{districtId} ... */ }
```
**PENTING:** API Key akan dikembalikan untuk dibaca dari `config('rajaongkir.api_key')` setelah proses *hardcode* untuk debugging selesai.

### Bagian B: Frontend - Rombak Halaman Alamat

#### B1. File Target
-   `resources/js/Pages/Customer/Checkout/Checkout1.jsx`

#### B2. Logika Komponen (`Checkout1.jsx`)
1.  **State Management**: Gunakan `useState` untuk mengelola daftar dan pilihan untuk setiap level dropdown.
    ```javascript
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    // ... dst untuk districts & subdistricts
    const [selectedData, setSelectedData] = useState({
        province: null, city: null, district: null, subdistrict: null
    });
    ```
2.  **Alur API**: Gunakan `useEffect` untuk memicu pemanggilan API berikutnya setiap kali sebuah pilihan dibuat.
    -   Saat komponen dimuat, panggil `/api/locations/provinces`.
    -   Saat `selectedData.province` berubah, panggil `/api/locations/cities/{provinceId}`.
    -   ... dan seterusnya hingga kelurahan.
3.  **UI**: Ganti input teks `provinsi`, `kota`, `kecamatan` menjadi elemen `<select>`.
4.  **Form Submission**: Modifikasi `useForm` dan fungsi `handleSubmit` untuk mengirim data berikut ke `CheckoutController@saveAddress`:
    -   `nama`, `telepon`, `alamat` (seperti sebelumnya).
    -   `province_id`, `province_name`.
    -   `city_id`, `city_name`.
    -   `district_id`, `district_name`.
    -   `subdistrict_id`, `subdistrict_name`.
    -   `zip_code`.

### Bagian C: Backend - Penyesuaian Alur Checkout

#### C1. Controller (`CheckoutController@saveAddress`)
Modifikasi metode ini untuk menerima ID dan nama dari setiap level alamat, lalu menyimpannya ke sesi.

```php
// Validasi baru
$request->validate([ /* ... validasi untuk nama, telepon, alamat, dan semua ID ... */ ]);

// Simpan data yang lebih kaya ke sesi
session(['checkout_address' => [
    'nama' => $request->nama,
    'telepon' => $request->telepon,
    'alamat' => $request->alamat,
    'full_address_string' => "{$request->alamat}, {$request->subdistrict_name}, ...", // Buat string lengkap
    'subdistrict_id' => $request->subdistrict_id,
    'zip_code' => $request->zip_code,
]]);
```

#### C2. Controller (`CheckoutController@shipping`)
Metode ini akan menjadi pusat logika kalkulasi ongkir.

```php
public function shipping()
{
    // 1. Ambil alamat & subdistrict_id dari sesi
    $alamat = session('checkout_address');
    $destinationId = $alamat['subdistrict_id'];

    // 2. Ambil & hitung totalWeight dari keranjang (logika ini sudah ada)
    $totalWeight = ...;

    // 3. Panggil API Komerce dari SINI (backend)
    $response = Http::withHeaders(...)
        ->post('/calculate/domestic-cost', [
            'origin' => config('rajaongkir.origin'), // ID origin toko kita
            'destination' => $destinationId,
            'weight' => $totalWeight,
            'courier' => 'jne:pos:tiki',
        ]);
    
    $shippingOptions = $response->json()['data'] ?? [];

    // 4. Teruskan hasilnya sebagai props ke view
    return Inertia::render('Customer/Checkout/Checkout2', [
        'alamat' => $alamat,
        'shippingOptions' => $shippingOptions, // Kirim hasil API ke frontend
    ]);
}
```

### Bagian D: Frontend - Sederhanakan Halaman Pengiriman

#### D1. File Target
-   `resources/js/Pages/Customer/Checkout/Checkout2.jsx`

#### D2. Logika Komponen (`Checkout2.jsx`)
1.  **Hapus Semua Logika Kompleks**: Hapus semua `useState`, `useEffect`, dan `axios` yang terkait dengan pencarian.
2.  **Terima Props**: Komponen ini sekarang akan menerima `shippingOptions` sebagai prop.
3.  **Render Opsi**: Cukup lakukan `map` pada `shippingOptions` untuk merender daftar radio button, sama seperti versi statis aslinya. Logika `handleSubmit` akan tetap sama.

## 4. Langkah Implementasi Berikutnya

1.  Mulai dengan **Bagian A**: Implementasi ulang `Api/RajaOngkirController` dan `routes/web.php` untuk mendukung dropdown bertingkat.
2.  Lanjutkan dengan **Bagian B & C**: Rombak `Checkout1.jsx` dan `CheckoutController@saveAddress` secara bersamaan.
3.  Selesaikan dengan **Bagian D & C**: Sederhanakan `Checkout2.jsx` dan implementasikan logika kalkulasi di `CheckoutController@shipping`.