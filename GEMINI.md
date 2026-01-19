# Catatan Perubahan

## 19 Januari 2026

### Reorganisasi Struktur MVC Backend
- **Admin Controllers** (8 controllers) di folder `Admin/`:
  - `DashboardController` - Dashboard + notifikasi stok menipis
  - `ProductController` - CRUD produk + duplikasi
  - `OrderController` - Update status pesanan
  - `VisitBookingController` - Kelola kunjungan
  - `CustomerController` - Data pelanggan
  - `ReportController` - Export laporan PDF/Excel/CSV
  - `ReviewController` - Moderasi & balas ulasan
  - `ProfileController` - Profil admin
- **Customer Controllers** (8 controllers) di folder `Customer/`:
  - `ProductController` - Katalog produk
  - `CartController` - Kelola keranjang
  - `CheckoutController` - Proses checkout + Midtrans
  - `PaymentController` - Retry payment
  - `OrderController` - Riwayat pesanan
  - `VisitBookingController` - Booking kunjungan
  - `ReviewController` - Rating & ulasan
  - `ProfileController` - Kelola profil
- **Routes**: Reorganisasi routes dengan prefix `/admin/...` untuk admin
- **Verification**: 112 routes registered successfully

### Robust Admin Order Editing (Data Integrity)
- **Status Flow & Validation**:
  - Update `OrderController` untuk membatasi edit hanya pada status dan nomor resi.
  - Detail pesanan (produk, qty, ongkir) **TIDAK BISA DIUBAH** setelah dibuat (preserved history).
  - Validasi flow status: pending → processed → shipped → completed.
  - Normalisasi status legacy (Indonesia) ke internal English di `Edit.jsx`.
- **Database**:
  - Menambahkan kolom `nomor_resi` (nullable) di tabel `pesanan` via migration.
- **UI Update (Edit.jsx)**:
  - Tampilan **Read-Only** untuk detail produk dan informasi pengiriman.
  - **Ringkasan Pembayaran** (Subtotal + Ongkir = Total).
  - **Auto-Lock** field jika status 'Completed'.
  - **Smart Fallback**: Menampilkan nama ekspedisi dari `metode_pengiriman` jika kolom `ekspedisi` kosong (support data lama).
  - **Format Tanggal**: Indonesia (10 Okt 2025).
  - **Polished UI**: Tombol Kembali yang lebih rapi (Secondary Button di Header).

### Product UI Polish (Edit Modal)
- **Harga**: Input rupiah dengan prefix currency.
- **Stok**: Warning visual "Stok menipis!" jika < 5.
- **Foto**: Preview gambar & custom upload button.
- **Status**: Radio button (Aktif/Nonaktif) yang lebih jelas.
- **Validasi**: Min length 3 char & visual feedback.
- **Redesign Compact**: Layout 2 kolom (Grid), sticky footer, dan header summary. Modal diperlebar (max-w-5xl).

### Dynamic Pickup Time Estimation
- **Files Modified**: 
  - `resources/js/Pages/Customer/Pesanan/Show.jsx`
  - `resources/js/Pages/Customer/Checkout/Checkout3.jsx`
- **Logika Baru**:
  - Jam operasional: **07:30 - 18:00 WIB**
  - Jika pesanan **dalam jam operasional** → "siap 15-30 menit"
  - Jika pesanan **di luar jam operasional** → "siap besok mulai pukul 07:30 WIB"

### Keamanan Data Transaksi
- **Pesanan Tidak Boleh Dihapus**:
  - Hapus method `destroy()` di `Admin/OrderController`
  - Route `admin.pesanan` pakai `except(['destroy'])`
- **Soft Delete Produk**:
  - Migration `2026_01_19_220000_add_soft_deletes_to_products_table.php`
  - Model `Produk.php` pakai `SoftDeletes` trait
  - Method `restore()` untuk aktifkan kembali produk
- **Validasi Status Flow (English)**:
  - Status: `pending` → `processed` → `shipped` → `completed`
  - Tidak bisa loncat status
- **Stock Reduction at Settlement**:
  - Stok dikurangi saat Midtrans kirim notifikasi `settlement`
  - BUKAN saat order dibuat (mencegah stok berkurang untuk pesanan gagal bayar)

### Frontend Route Update (Admin)
- **Dashboard.jsx** - semua route jadi `admin.xxx`
- **Sidebar.jsx** - href `/admin/xxx`, `admin.xxx.index`
- **Produk/*** - semua route jadi `admin.produk.xxx`
- **Pesanan/*** - semua route jadi `admin.pesanan.xxx`, tombol hapus dihilangkan
- **Pelanggan/*** - semua route jadi `admin.pelanggan.xxx`
- **Kunjungan/*** - semua route jadi `admin.kunjungan.xxx`
- **Ulasan/*** - semua route jadi `admin.ulasan.xxx`

## 18 Januari 2026

### Konsolidasi Tabel Users dan Pelanggans
- **Database Migrations**:
  - `2026_01_18_220000_add_role_and_customer_fields_to_users_table.php` - Menambahkan kolom `role`, `phone`, `avatar`, `alamat` ke tabel `users`
  - `2026_01_18_220001_migrate_pelanggans_to_users_table.php` - Migrasi data dari `pelanggans` ke `users` dengan role 'customer'
  - `2026_01_18_220002_update_foreign_keys_to_users.php` - Update semua FK dari `pelanggan_id`/`id_pelanggan` ke `user_id`
  - `2026_01_18_220003_drop_pelanggans_table.php` - Menghapus tabel `pelanggans`
- **Models**: Updated `User.php`, `Pesanan.php`, `Kunjungan.php`, `Ulasan.php`, `Cart.php` untuk menggunakan `user_id`
- **Middleware**: Created `EnsureUserIsAdmin.php` dan `EnsureUserIsCustomer.php` untuk role-based access
- **Controllers**: Updated 10+ controllers untuk menggunakan `Auth::id()` dan `Auth::user()` alih-alih `Auth::guard('pelanggan')`
- **Config**: Simplified `auth.php` ke satu guard 'web' dengan role-based middleware
- **Routes**: Updated `web.php` dari `auth:pelanggan` ke `auth` + `customer`/`admin` middleware



### ERD Design: Revisi Final untuk Sistem CPH
- **File**: `C:\Users\M S I\.gemini\antigravity\brain\dd0f256b-08a9-4954-9837-00a51ad8bc52\ERD_Design.md`
- **Perubahan**:
  - Menghapus status `cancelled` dari `orders` dan `visit_bookings`
  - Menambahkan `carts.status` (enum: active, converted)
  - Menambahkan `shipping_etd` dan `shipping_code` pada `orders`
  - Memperbaiki typo `VisitBookng` → `VisitBooking`
  - Mengubah relasi `orders`/`visit_bookings` ↔ `payments` menjadi 1:N untuk mendukung retry payment
  - Menyesuaikan `payments.status` sesuai Midtrans: pending, settlement, expire, deny, cancel

## 15 Januari 2026

### Fix: Gambar Produk Tidak Muncul di Dashboard (Stok Menipis)
- **File**: `resources/js/Pages/Dashboard.jsx`
- **Masalah**: Gambar produk di bagian "Stok Menipis" tidak muncul karena menggunakan field yang salah (`p.foto` seharusnya `p.gambar`)
- **Solusi**: Mengganti `p.foto` menjadi `p.gambar` pada line 174 sesuai dengan field di model `Produk.php`
