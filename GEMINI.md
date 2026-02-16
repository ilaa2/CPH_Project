# Catatan Perubahan

## 16 Februari 2026

### Fix: Nama "Central Palantea Hidroponik" Hilang di HP
- **Masalah**: Nama website "Central Palantea Hidroponik" tidak muncul di tampilan mobile (HP) karena class `hidden sm:block`.
- **Solusi**: 
  - Mengubah layout header di `CustomerLayout.jsx` untuk menampilkan nama site di semua ukuran layar.
  - Untuk layar kecil (mobile), teks ditampilkan 2 baris ("Central Palantea" & "Hidroponik") agar muat.
  - Untuk layar besar (tablet/desktop), teks tetap 1 baris.
- **Files Modified**: `resources/js/Layouts/CustomerLayout.jsx`

### Fix: 403 Forbidden pada Checkout, Pesanan, dan Payment (LiteSpeed WAF)
- **Masalah**: Beberapa halaman customer menampilkan 403 Forbidden:
  1. `/customer/pesanan` — Riwayat Pesanan (GET)
  2. `/customer/checkout/shipping` — Simpan Pilihan Pengiriman (POST)
  3. `/customer/checkout/process` — Proses Pembayaran (POST)
  4. `/customer/payment/finish` — Callback Midtrans (GET)
- **Penyebab**: ModSecurity WAF pada LiteSpeed Web Server memblokir request yang dianggap mencurigakan:
  - POST request dengan body kosong
  - Inertia.js partial reload headers
  - URL pattern tertentu yang match dengan OWASP CRS rules
- **Solusi (Multi-Layer)**:
  1. **`.htaccess`**: Menambahkan directive untuk menonaktifkan ModSecurity:
     - `SecRuleEngine Off` (utama)
     - `SecRuleRemoveById` untuk rule OWASP umum (fallback)
     - `SecFilterEngine Off` untuk LiteSpeed bawaan
  2. **`Checkout3.jsx`**: POST body diisi `{ confirm: true }` (tidak kosong lagi)
  3. **`Show.jsx`**: `router.reload()` diganti `window.location.reload()` (native)
  4. **`test_waf.php`**: Script diagnostik untuk verifikasi di server
- **Catatan**: Jika `.htaccess` tidak cukup, WAF harus dinonaktifkan via **cPanel → ModSecurity**
- **Files Modified**:
  - `public/.htaccess`
  - `resources/js/Pages/Customer/Checkout/Checkout3.jsx`
  - `resources/js/Pages/Customer/Pesanan/Show.jsx`
- **Files Created**: `public/test_waf.php` (hapus setelah selesai)

### Fix: 403 Forbidden pada Hapus Produk (LiteSpeed Block DELETE)
- **Masalah**: LiteSpeed memblokir HTTP verb `DELETE` yang digunakan oleh `router.delete()`
- **Solusi**:
  - Route baru: `POST /admin/produk/{id}/delete` (`admin.produk.delete`) di `web.php`
  - Frontend: `router.post(route('admin.produk.delete', id))` di `Produk/Index.jsx`
  - Method spoofing `_method: 'delete'` dihapus (pure POST)
- **Files Modified**: `routes/web.php`, `resources/js/Pages/Produk/Index.jsx`

## 15 Februari 2026

### Fix: Ikon ? pada Laporan PDF
- **Masalah**: Header "TOP TIPE KUNJUNGAN" di laporan PDF menampilkan tanda tanya `?`.
- **Penyebab**: Penggunaan emoji 🏆 dan 📋 yang tidak didukung oleh generator PDF (DOMPDF).
- **Solusi**: Menghapus emoji tersebut dari template `pdf.blade.php`.
### Global Admin Responsiveness & UI Polish
- **Tujuan**: Menyamakan pengalaman mobile di seluruh halaman admin
- **Perubahan per Halaman**:
  - **Produk**: Header responsif (stack ke bawah), form input grid responsif, tabel scrollable.
  - **Pesanan**: Modal Detail invoice menggunakan grid responsif (1 kolom di HP), header responsif.
  - **Laporan**: Grid statistik responsif, tabel preview scrollable.
  - **Pelanggan**: Statistik grid responsif, tabel scrollable.
  - **Kunjungan**: Tab navigasi scrollable pada mobile, header responsif.
  - **Ulasan**: Tombol filter wrap (tidak overflow), tabel scrollable.
  - **Profile**: Mengubah layout `Profile/Edit.jsx` agar menggunakan `Mainbar` (ada sidebar admin) alih-alih layout default Breeze.
- **Files Modified**: 
  - `resources/js/Pages/Produk/Index.jsx`
  - `resources/js/Pages/Pesanan/Index.jsx`
  - `resources/js/Pages/Laporan/Index.jsx` (verified)
  - `resources/js/Pages/Pelanggan/Index.jsx` (verified)
  - `resources/js/Pages/Kunjungan/Jadwal.jsx`
  - `resources/js/Layouts/KunjunganLayout.jsx`
  - `resources/js/Pages/Ulasan/Index.jsx`
  - `resources/js/Pages/Profile/Edit.jsx`

### Fix: Layout Filter Laporan Overflow
- **Masalah**: Tombol "Terapkan" dan input tanggal pada filter laporan tidak responsif (overflow/keluar dari container) di layar kecil.
- **Solusi**: Mengubah layout filter tanggal menjadi stack (vertikal) di mobile, dan menambahkan scroll padding pada tombol filter preset.
- **Files Modified**: `resources/js/Pages/Laporan/Index.jsx`

### Cleanup: Hapus Tabel Unused (cart_items)
- **Tujuan**: Membersihkan database dari tabel sampah sisa pengembangan awal.
- **Tindakan**: Membuat migration `drop_cart_items_table` untuk menghapus tabel `cart_items` yang tidak terpakai (sistem menggunakan tabel `carts`).
- **Files Created**: `database/migrations/2026_02_15_200859_drop_cart_items_table.php`

### Logic Update: Estimasi Waktu Pesanan (Smart Status)
- **Masalah**: Pesanan lama (kemarin/lusa) masih menampilkan estimasi "Akan diproses besok jam 07:30", padahal sudah lewat berhari-hari.
- **Solusi**: Menambahkan logika pengecekan tanggal (`isToday`):
  - **Pesanan Hari Ini**: Tampilkan estimasi waktu detail (30 menit / besok pagi).
  - **Pesanan Lama**: Tampilkan status umum "Sedang dalam antrian pemrosesan" agar tidak membingungkan customer.
- **Files Modified**: `resources/js/Pages/Customer/Pesanan/Show.jsx`

### Fix: UI Tertimpa & Rename Kategori
- **Masalah**:
  1. Dropdown profil tertimpa search bar (z-index issue).
  2. Nama kategori tidak konsisten ("Sayuran Daun" vs "Sayur").
- **Solusi**:
  1. Menambahkan `z-50` pada dropdown container di `CustomerLayout.jsx`.
  2. Mengubah label kategori menjadi **"Sayuran"** dan **"Buah-buahan"** di `Belanja.jsx` dan `DashboardCust.jsx`.
  3. Update database via migration `update_product_category_names` untuk mengubah data lama.
  4. Update `ProductCategoriesSeeder` untuk instalasi baru.
- **Files Modified**:
  - `resources/js/Layouts/CustomerLayout.jsx`
  - `resources/js/Pages/Customer/Belanja.jsx`
  - `resources/js/Pages/Customer/DashboardCust.jsx`
  - `database/seeders/ProductCategoriesSeeder.php`
- **Files Created**: `database/migrations/2026_02_15_203500_update_product_category_names.php`

### Penyesuaian UI Dashboard & Responsivitas Mobile
- **Tujuan**: Memperbaiki tampilan nomor pesanan yang berantakan (overflow) dan membuat sidebar responsif di HP.
- **Perubahan**:
  - **Dashboard.jsx**: Menambahkan `min-w-0`, `flex-1`, dan `truncate` pada list "Pesanan Pending" dan "Pesanan Baru" agar teks panjang (no. pesanan/nama) otomatis terpotong titik-titik (...) jika tidak muat, bukannya menabrak elemen lain.
  - **Sidebar.jsx**:
    - Mode Mobile: Sidebar sekarang menggunakan sistem **Drawer/Overlay**. Tertutup default, muncul saat tombol menu ditekan.
    - Menambahkan tombol **Hamburger Menu** (garis tiga) yang hanya muncul di mode mobile.
    - Menambahkan background gelap (overlay) saat sidebar terbuka di HP.
  - **Mainbar.jsx**: Refactor struktur layout agar `Sidebar` menjadi wrapper utama, sehingga state mobile (buka/tutup) bisa mengatur margin konten dengan benar.
- **Files Modified**: `resources/js/Pages/Dashboard.jsx`, `resources/js/Components/Bar/Sidebar.jsx`, `resources/js/Components/Bar/Mainbar.jsx`

### Update: Kredensial Admin Diperbarui
- **Tujuan**: Mengganti username (email) dan password admin default agar lebih sesuai dengan branding
- **Perubahan**:
  - Email Admin: `centralpalantea@gmail.com`
  - Password Admin: `AdminCPH24@`
- **Konfirmasi**: Diupdate di `DatabaseSeeder.php` dan record database yang ada
- **Files Modified**: `database/seeders/DatabaseSeeder.php`

### Fitur: Update Password Admin dari Sidebar
- **Tujuan**: Admin bisa mengganti password langsung dari panel profil di sidebar
- **Implementasi**:
  - Panel profil sidebar sekarang memiliki **2 tab**: "Info Akun" dan "Password"
  - Tab Password: form dengan 3 field (password saat ini, password baru, konfirmasi)
  - Checklist validasi password real-time (min 8 karakter, huruf besar/kecil, angka, simbol)
  - Menggunakan route `PUT /password` yang sudah ada (`PasswordController::update()`)
  - Pesan sukses "Password berhasil diperbarui!" setelah simpan
  - Form di-reset saat panel ditutup
- **Files Modified**: `resources/js/Components/Bar/Sidebar.jsx`

### Fix: PesananSeeder Data Kosong (Produk Tidak Terisi)
- **Masalah**: Beberapa record pesanan menampilkan produk kosong tetapi tetap memiliki harga (subtotal acak tanpa produk)
- **Penyebab**: `PesananSeeder` membuat record `pesanan` dengan subtotal random, tetapi **tidak pernah mengisi `pesanan_items`** (tabel relasi produk-pesanan)
- **Solusi**: Rewrite `PesananSeeder` secara menyeluruh:
  - Mengambil produk real dari tabel `products`
  - Setiap pesanan mendapat 1-3 produk acak dengan quantity 1-5
  - Subtotal dihitung dari `harga × jumlah` produk asli
  - Total = subtotal + ongkir
  - `pesanan_items` di-insert untuk setiap produk dalam pesanan
  - `nomor_pesanan` di-generate (format: `CPH-YYYYMMDD-XXXX`)
  - Alamat pengiriman diambil dari data user yang sebenarnya
  - `paid_at` diisi untuk pesanan non-pending
- **Hasil**: 20 pesanan, 44 pesanan_items (terverifikasi)
- **Files Modified**: `database/seeders/PesananSeeder.php`

### Fix: Forgot Password & Reset Password
- **Masalah**: Forgot password menampilkan "We can't find a user with that email address" dan email reset tidak terkirim.
- **Penyebab**:
  1. `MAIL_MAILER=log` — email hanya ditulis ke file log, tidak dikirim ke inbox
  2. Pesan error default dalam bahasa Inggris
- **Solusi**:
  1. **SMTP Config** (`.env`): Mengubah dari `log` mailer ke Gmail SMTP (`smtp.gmail.com:587`)
  2. **PasswordResetLinkController**: Pesan error/sukses dalam bahasa Indonesia
  3. **NewPasswordController**: Menerapkan validasi password kuat yang sama dengan registrasi
  4. **ForgotPassword.jsx**: UI diterjemahkan ke Indonesia + styling konsisten CPH (logo, warna hijau)
  5. **ResetPassword.jsx**: UI diterjemahkan ke Indonesia + checklist password real-time + email read-only
- **Catatan Penting**: User HARUS mengisi `MAIL_USERNAME` dan `MAIL_PASSWORD` di `.env` dengan Gmail + App Password yang valid
- **Files Modified**:
  - `.env`
  - `app/Http/Controllers/Auth/PasswordResetLinkController.php`
  - `app/Http/Controllers/Auth/NewPasswordController.php`
  - `resources/js/Pages/Auth/ForgotPassword.jsx`
  - `resources/js/Pages/Auth/ResetPassword.jsx`

### Fitur: Validasi Password Kuat pada Registrasi
- **Tujuan**: Meningkatkan keamanan akun pengguna dengan menerapkan standar password yang lebih ketat.
- **Kriteria Password**:
  - Minimal 8 karakter
  - Mengandung minimal 1 huruf kapital (A-Z)
  - Mengandung minimal 1 huruf kecil (a-z)
  - Mengandung minimal 1 angka (0-9)
  - Mengandung minimal 1 simbol (@, #, !, dll)
- **Backend** (`RegisteredUserController.php`):
  - Mengganti `Rules\Password::defaults()` dengan `Rules\Password::min(8)->mixedCase()->numbers()->symbols()`
  - Menambahkan custom error messages dalam bahasa Indonesia untuk setiap kriteria yang gagal
- **Frontend** (`Register.jsx`):
  - Menambahkan komponen `PasswordCriteria` untuk checklist visual real-time
  - Checklist muncul saat user mulai mengetik password
  - Setiap kriteria menampilkan ✅ hijau (terpenuhi) atau ❌ merah (belum terpenuhi)
  - Menggunakan `useMemo` untuk optimasi re-render
- **Test** (`RegistrationTest.php`):
  - Update test password dari `'password'` menjadi `'Password1@'`
  - Tambah test case: password lemah ditolak dengan validation error
- **Files Modified**:
  - `app/Http/Controllers/Auth/RegisteredUserController.php`
  - `resources/js/Pages/Auth/Register.jsx`
  - `tests/Feature/Auth/RegistrationTest.php`

## 11 Februari 2026

### Fitur: Exclusive Visit Slot Booking
- **Masalah**: Slot kunjungan yang sudah dibooking dan dibayar masih bisa dipilih oleh customer lain.
- **Solusi**:
  - Menambahkan `checkAvailability()` API di `VisitBookingController` untuk mengembalikan daftar slot yang sudah terisi
  - Menambahkan validasi slot di `handleForm()` dan `store()` (double-check, prevent race condition)
  - Frontend `Kunjungan.jsx`: dropdown jam menampilkan "(Penuh)" dan di-disable untuk slot yang sudah terisi
  - Route: `kunjungan.check_availability` (GET)
- **Bug Fix**: Awalnya `checkAvailability()` salah ditaruh di `KunjunganControllerCust` (legacy), padahal route mengarah ke `CustomerVisitBookingController` → menyebabkan 500 error

### Fix: Status Kunjungan Tidak Berubah Setelah Pembayaran Sukses
- **Masalah**: Setelah pembayaran Midtrans berhasil (Snap popup menampilkan "sukses"), halaman detail kunjungan masih menampilkan "Menunggu Pembayaran" dan tombol "Bayar Sekarang", bukan "Dijadwalkan".
- **Penyebab**: `PaymentProcess.jsx` `onSuccess` callback hanya redirect ke halaman detail tanpa update backend. Midtrans notification webhook (server-to-server) tidak bisa menjangkau localhost di development.
- **Solusi**:
  - Menambahkan method `confirmPayment()` di `VisitBookingController` — update `payment_status` → `paid`, `status` → `Dijadwalkan`, `paid_at` → `now()`
  - `PaymentProcess.jsx`: `onSuccess` sekarang memanggil `axios.post(route('customer.kunjungan.confirm-payment'))` sebelum redirect
  - Route: `customer.kunjungan.confirm-payment` (POST)
  - Idempotent: hanya update jika belum `paid` (hindari duplikasi dengan webhook di production)
- **Files Modified**:
  - `app/Http/Controllers/Customer/VisitBookingController.php`
  - `resources/js/Pages/Customer/Kunjungan/PaymentProcess.jsx`
  - `routes/web.php`

### Peningkatan: Ringkasan Pembayaran Detail di Halaman Kunjungan
- **Masalah**: Ringkasan pembayaran di halaman detail kunjungan hanya menampilkan "Total Biaya" tanpa rincian per orang.
- **Solusi**: Menambahkan breakdown detail berdasarkan tipe kunjungan:
  - **Umum**: Dewasa (N × Rp 10.000) + Anak (N × Rp 10.000) + Balita (Gratis)
  - **Outing Class**: Paket (< 30 anak = Rp 300.000 flat) atau Anak (N × Rp 10.000) + Guru/Pendamping (Gratis)
  - **Tipe Lain**: Menggunakan biaya per tipe dari database
- **File Modified**: `resources/js/Pages/Customer/Kunjungan/Show.jsx`

### Fix: Data Customer (Telepon, Nama, Foto) Tidak Muncul di Admin
- **Masalah**: No. telepon, nama, dan foto profil customer tidak muncul di halaman admin Pelanggan (menampilkan "-" atau avatar default) meskipun data sudah diisi oleh customer.
- **Penyebab**: Frontend masih menggunakan nama field lama dari tabel `pelanggans` (`telepon`, `nama`, `foto_profil`), padahal setelah konsolidasi ke tabel `users` nama kolomnya adalah `phone`, `name`, `avatar`.
- **Solusi**: Mengganti semua referensi field legacy di 3 file:
  - `Pelanggan/Index.jsx`: `telepon`→`phone`, `nama`→`name`, `foto_profil`→`avatar`
  - `Pelanggan/Edit.jsx`: `nama`→`name`, `telepon`→`phone`
  - `Pelanggan/Create.jsx`: `nama`→`name`, `telepon`→`phone`

## 6 Februari 2026

### Update Dokumen Blackbox Testing (Revisi Berdasarkan UI)
- **File Artifact**: `blackbox_testing_final.md`
- **Total Skenario**: 92 skenario testing (diverifikasi berdasarkan UI yang tersedia)
  - **Admin**: 44 skenario
  - **Customer**: 48 skenario
- **Modul Admin**:
  - **Autentikasi**: Login, Logout
  - **Dashboard**: Statistik, Grafik Pendapatan & Kunjungan, Pesanan Pending, Stok Menipis, Jadwal Hari Ini
  - **Produk**: List, Filter, Search, Tambah, Edit, Hapus (Soft Delete), Duplikat, Toggle Status
  - **Pesanan**: List, Filter Status, Search, Detail/Invoice, Edit Status, Input Resi, Tambah Manual, Lihat Ulasan
  - **Kunjungan**: List, Filter Tipe, Search, Detail, Tambah Manual
  - **Pelanggan**: List, Search, Lihat Detail
  - **Laporan**: Summary Stats, Quick Filter, Rentang Tanggal, Preview Penjualan/Kunjungan, Export PDF/Excel
- **Modul Customer**:
  - **Autentikasi**: Register, Login, Reset Password, Logout
  - **Katalog**: List Produk, Filter Kategori, Detail Produk, Tambah Keranjang, **Beli Langsung (Buy Now)**
  - **Keranjang**: List, Update Qty, Hapus Item, Pilih Item, Checkout
  - **Checkout**: Pilih Metode (Pickup/Lokal/Ekspedisi), Isi Alamat, Ringkasan, Bayar Midtrans
  - **Riwayat**: Tab Pesanan, Tab Kunjungan, Detail, Retry Payment, Konfirmasi Diterima
  - **Kunjungan**: Landing, Form Booking, Konfirmasi, Bayar, Selesaikan
  - **Ulasan**: Form Ulasan Pesanan, Form Ulasan Kunjungan, **Lihat Balasan Penjual**
  - **Profil**: Foto, Edit Info, Ubah Password, Hapus Akun
  - **Publik**: Home, Tentang Kami
- **Catatan Fitur**:
  - **Buy Now**: Tersedia di halaman detail produk (Skenario Customer #11)
  - **Balas Ulasan Admin**: Backend ready (`ReviewController.reply()`), tombol UI belum tersedia, balasan tampil di Customer
  - Menu Ulasan Admin (route tersedia, menu di-hide di sidebar)
  - Hapus Customer (admin hanya bisa view)
  - Hapus Pesanan (tidak tersedia untuk menjaga integritas data)
- **Dokumentasi Pendukung**: `dokumentasi_hmw_brainstorming_reevaluate.md` - HMW, Brainstorming, Re-Evaluate, Chunk, Pre-Evaluation yang sudah disesuaikan
- **Status**: ✅ 100% Pass (92/92 skenario)

## 4 Februari 2026

### Dokumentasi BAB IV (4.2 - 4.5) untuk Laporan PA - Revisi Format PCR
- **File Artifact**: `bab_iv_4_2_sampai_4_5.md`
- **Format Standar PCR**:
  - Narasi ilmiah/formal siap masuk dokumen Word
  - Istilah asing ditulis *italic* (checkout, feedback, stakeholder, dll.)
  - Penomoran subbab konsisten (4.2, 4.2.1, 4.2.2, dst.)
  - Placeholder untuk bukti (*screenshot*, dokumentasi foto, surat validasi) ditandai jelas
- **File Artifact**: `bab_iv_4_2_sampai_4_5.md`
- **Struktur Dokumentasi**:
  - **4.2 Develop**: Code Body, Integrate Code, Verify The Code
  - **4.3 Test**: Test Report (73 skenario, 100% pass), Optimize Code
  - **4.4 Evaluate**: Discuss With Stakeholders, Demonstrate, Feedback
  - **4.5 Maintenance**: Fix Bugs (5 bug fixed), Change Features as Needed
- **Highlight Implementasi**:
  - CheckoutController multi-step dengan 3 metode pengiriman (pickup, local, expedition)
  - MidtransController dengan notification handler dan stock reduction at settlement
  - Biteship API integration untuk kalkulasi ongkir ekspedisi
  - Soft delete produk untuk menjaga integritas histori transaksi

### Fix: Error "Unknown column 'ulasan.produk_id'" dan Seeder Legacy
- **Masalah**: 
  1. Tabel ulasan tidak memiliki kolom `produk_id`, `pesanan_id`, `kunjungan_id`, `balasan`
  2. Semua seeder masih menggunakan `pelanggan_id` yang sudah tidak ada
- **Solusi**:
  1. Memperbarui migration `create_ulasan_table` untuk menambahkan semua kolom yang diperlukan
  2. Menghapus migration duplikat (`add_kunjungan_id_to_ulasan_table`, `add_reply_to_ulasan_table`, `add_balasan_to_ulasan_table`)
  3. Memperbarui `PelangganSeeder` untuk menggunakan tabel `users` dengan role 'customer'
  4. Memperbarui `UlasanSeeder`, `KunjunganSeeder`, `PesananSeeder` untuk menggunakan `user_id`

### Fix: Error "Method Not Allowed" pada /checkout/process setelah pembayaran
- **Masalah**: Ketika user menutup pop-up Midtrans dan menekan tombol back, browser mencoba mengakses `/customer/checkout/process` dengan GET request, tapi route ini hanya mendukung POST.
- **Solusi**: Menambahkan route GET untuk `/checkout/process` yang redirect ke halaman riwayat pesanan dengan pesan informasi.

### Fix: Akun Admin dan Redirect Login
- **Masalah**: 
  1. Akun admin sebelumnya (ila@gmail.com) tidak memiliki role admin yang benar
  2. Redirect setelah login admin mengarah ke `/dashboard` (customer) bukan `/admin/dashboard`
  3. Middleware `EnsureUserIsCustomer` redirect ke route yang tidak ada
- **Solusi**:
  1. Mengubah akun admin di `DatabaseSeeder` menjadi `admin@cph.com` dengan password `password`
  2. Memperbaiki redirect admin di `AuthenticatedSessionController` ke `/admin/dashboard`
  3. Memperbaiki redirect di `EnsureUserIsCustomer` ke `route('admin.dashboard')`
- **Akun Login Aktif**:
  - Admin: `admin@cph.com` / `password`
  - Customer: Semua customer dari PelangganSeeder / `password`

### Security Audit: Route-Based Authorization
- **Masalah Awal**: Dosen pembimbing concern dengan keamanan authorization - customer bisa akses halaman admin dengan mengganti URL manual.
- **Solusi yang Diterapkan**:
  - **Route Middleware**: Semua admin routes (`/admin/*`) dilindungi middleware `['auth', 'verified', 'admin']`
  - **Note**: Constructor middleware (`$this->middleware()`) **TIDAK TERSEDIA** di Laravel 11. Proteksi harus dilakukan via routes.
- **Routes yang Diproteksi**:
  - `/admin` - Dashboard admin
  - `/admin/produk/*` - CRUD produk
  - `/admin/pesanan/*` - Manajemen pesanan
  - `/admin/kunjungan/*` - Manajemen kunjungan
  - `/admin/pelanggan/*` - Data pelanggan
  - `/admin/laporan/*` - Export laporan
  - `/admin/ulasan/*` - Moderasi ulasan
  - `/admin/profile/*` - Profil admin
- **Hasil**: Customer yang mencoba akses URL admin akan di-redirect ke halaman home dengan pesan error
- **UI/UX Refinement (4 Feb 2026)**:
  - **Hide Cart for Admin**: Icon keranjang disembunyikan jika user login sebagai admin (mencegah kebingungan role).
  - **Fix Dashboard Link**: Menu "Dashboard Admin" di header diperbaiki mengarah ke `/admin` (sebelumnya `/admin/dashboard` yang 404).
  - **Login Button Logic**: Tombol login diganti menjadi dropdown user jika sudah login (termasuk admin), mencegah loop redirect.

### Dokumentasi Code Body 3.2.1 untuk Laporan PA
- **File Artifact**: `code_body_3_2_1.md`
- **Struktur Dokumentasi**:
  - **3.2.1.1 Implementasi Struktur Kode**: Arsitektur MVC, pembagian Admin/Customer Controllers
  - **3.2.1.2 Implementasi Modul Utama**: Autentikasi, Cart, Checkout Multi-Step, Midtrans, Booking Kunjungan, Laporan Export
  - **3.2.1.3 Implementasi Logika Proses**: Flow status pesanan, pengurangan stok otomatis, estimasi pickup
  - **3.2.1.4 Pengelolaan Database**: Struktur tabel, ERD, Soft Delete, migrasi konsolidasi users
- **Statistik Proyek**:
  - 27 Backend Controllers (8 Admin, 10 Customer, 9 Auth)
  - 13 Eloquent Models
  - 49 Database Migrations
  - 52 React Pages
  - 21 Reusable Components
  - 112 Registered Routes

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
- **Status**: Radio button (Aktif/Nonaktif) dengan visual indicator bulat yang robust (fix size, no glitch).
- **Validasi**: Min length 3 char & visual feedback.
- **Redesign Compact**: Layout 2 kolom (Grid), sticky footer, dan header summary. Modal diperlebar (max-w-5xl).
- **Fix Duplicate Deletion**:
  - Update `ProductController`: Hapus `withTrashed()` dari `index` dan `edit`.
  - Produk yang dihapus sekarang **hilang dari list** (sesuai ekspektasi), bukan tetap muncul sebagai soft-deleted.
- **Fix Invoice & Order List**:
  - Update `Pesanan/Index.jsx` untuk menggunakan relasi `user` (bukan `pelanggan` legacy).
  - Field: `user.name`, `user.phone`, `user.alamat`.
  - Mengembalikan tampilan Nama Pelanggan di tabel dan Detail Invoice.

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

### Database Optimization (Remove Timestamps) - REVERTED
> **SOLUTION:** Dibuat migration baru `2026_01_26_100000_restore_missing_timestamps.php` untuk mengembalikan kolom timestamps pada tabel yang terdampak (`users`, `tipe_kunjungan`, `ulasan_fotos`, `pesanan_items`, `carts`).
### Fix: Login Redirect di Belanja.jsx (26 Jan 2026)
- **Masalah**: Tombol "Login Sekarang" pada popup "Akses Terbatas" tidak redirect ke halaman login.
- **Penyebab**: Penggunaan `router.visit(route('login'))` di dalam callback Swal yang dapat gagal.
- **Solusi**: Mengubah ke `router.visit('/login')` (direct path) untuk konsistensi dengan file lain (`BelanjaDetail.jsx`, `Kunjungan.jsx`).

### Fix: Quantity Keranjang dari Detail Produk (26 Jan 2026)
- **Masalah**: Menambahkan produk ke keranjang dari halaman detail selalu quantity 1, meskipun user memilih jumlah berbeda.
- **Penyebab**: `CartController::store()` mengabaikan parameter `quantity` dari request dan hard-code `quantity => 1`.
- **Solusi**: 
  - Menambahkan validasi `quantity` (nullable, min:1).
  - Menggunakan `$request->input('quantity', 1)` dengan fallback default 1.
  - Membatasi quantity sesuai stok produk (`min($qty, $product->stok)`).

### Database Optimization (Remove Timestamps) - REVERTED
> **SOLUTION:** Dibuat migration baru `2026_01_26_100000_restore_missing_timestamps.php` untuk mengembalikan kolom timestamps pada tabel yang terdampak (`users`, `tipe_kunjungan`, `ulasan_fotos`, `pesanan_items`, `carts`).

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
