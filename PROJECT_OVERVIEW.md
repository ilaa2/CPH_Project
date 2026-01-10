# 📦 PROJECT_OVERVIEW.md
# Dokumentasi Lengkap Proyek CPH_Project

---

## 📋 Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tumpukan Teknologi](#2-tumpukan-teknologi-tech-stack)
3. [Struktur Direktori Proyek](#3-struktur-direktori-proyek)
4. [Arsitektur Aplikasi](#4-arsitektur-aplikasi)
5. [Modul dan Fitur Utama](#5-modul-dan-fitur-utama)
6. [Model Database (Eloquent)](#6-model-database-eloquent)
7. [Controller Aplikasi](#7-controller-aplikasi)
8. [Halaman Frontend (React)](#8-halaman-frontend-react)
9. [Komponen UI Reusable](#9-komponen-ui-reusable)
10. [Routing Aplikasi](#10-routing-aplikasi)
11. [Integrasi Pihak Ketiga](#11-integrasi-pihak-ketiga)
12. [Panduan Instalasi & Menjalankan Proyek](#12-panduan-instalasi--menjalankan-proyek)
13. [Perintah-Perintah Penting](#13-perintah-perintah-penting)
14. [Alur Kerja Pengembangan](#14-alur-kerja-pengembangan)
15. [Catatan Tambahan](#15-catatan-tambahan)

---

## 1. Ringkasan Proyek

**CPH_Project** (Coffee Palantea Hidroponik) adalah aplikasi web **full-stack** yang dirancang sebagai **sistem manajemen bisnis dan e-commerce** untuk usaha agrowisata dan pertanian hidroponik. Aplikasi ini ditujukan untuk pasar Indonesia dan menyediakan platform terintegrasi untuk:

- 🛒 **E-Commerce**: Penjualan produk hidroponik (sayuran, buah-buahan)
- 📅 **Manajemen Kunjungan**: Pemesanan jadwal wisata edukatif hidroponik
- 👥 **Manajemen Pelanggan**: Pendataan dan pengelolaan pelanggan
- 📊 **Pelaporan**: Dashboard admin dengan laporan penjualan dan kunjungan

### Target Pengguna

| Pengguna | Deskripsi |
|----------|-----------|
| **Admin** | Mengelola produk, pesanan, kunjungan, pelanggan, dan laporan |
| **Pelanggan** | Berbelanja produk, memesan kunjungan, melihat riwayat transaksi |

---

## 2. Tumpukan Teknologi (Tech Stack)

### 🔧 Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **PHP** | ^8.2 | Bahasa pemrograman server-side |
| **Laravel** | ^12.0 | Framework PHP untuk backend |
| **Laravel Breeze** | ^2.3 | Autentikasi starter kit |
| **Laravel Sanctum** | ^4.0 | API token authentication |
| **Eloquent ORM** | - | Object-Relational Mapping untuk database |
| **Inertia.js** | ^2.0 | Penghubung backend-frontend (SPA tanpa API) |

### 🎨 Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React.js** | ^18.2.0 | Library UI untuk antarmuka pengguna |
| **Inertia React** | ^2.0.0 | Adapter Inertia untuk React |
| **Tailwind CSS** | ^3.2.1 | Framework CSS utility-first |
| **Vite** | ^6.2.4 | Build tool dan development server |
| **Headless UI** | ^2.0.0 | Komponen UI accessible tanpa styling |

### 📦 Dependensi Tambahan

#### Backend (Composer)
- `barryvdh/laravel-dompdf` - Generate PDF untuk laporan/invoice
- `midtrans/midtrans-php` - Integrasi payment gateway Midtrans
- `spatie/simple-excel` - Import/export data Excel
- `tightenco/ziggy` - Expose Laravel routes ke JavaScript

#### Frontend (NPM)
- `@fullcalendar/*` - Komponen kalender interaktif
- `chart.js` + `react-chartjs-2` - Grafik dan visualisasi data
- `framer-motion` - Animasi dan transisi
- `sweetalert2` - Notifikasi pop-up yang menarik
- `swiper` - Slider/carousel touch-friendly
- `react-icons` - Library ikon
- `react-select` - Dropdown/select yang enhanced
- `date-fns` - Utilitas manipulasi tanggal

---

## 3. Struktur Direktori Proyek

```
CPH_Project/
├── 📁 app/
│   ├── 📁 Http/
│   │   ├── 📁 Controllers/          # Semua logic aplikasi
│   │   │   ├── 📁 Api/              # Controller untuk API
│   │   │   ├── 📁 Auth/             # Controller autentikasi
│   │   │   └── 📁 Customer/         # Controller khusus pelanggan
│   │   └── 📁 Middleware/           # Middleware HTTP
│   └── 📁 Models/                   # Model Eloquent (13 model)
│
├── 📁 bootstrap/                    # File bootstrap Laravel
│
├── 📁 config/                       # Konfigurasi aplikasi
│
├── 📁 database/
│   ├── 📁 factories/                # Factory untuk testing
│   ├── 📁 migrations/               # Skema database (35 migrasi)
│   └── 📁 seeders/                  # Data awal/dummy
│
├── 📁 public/                       # Web root (aset publik)
│
├── 📁 resources/
│   ├── 📁 css/                      # File CSS
│   ├── 📁 js/
│   │   ├── 📁 Components/           # Komponen React reusable (14 file)
│   │   ├── 📁 Layouts/              # Layout halaman (4 layout)
│   │   └── 📁 Pages/                # Halaman React (11+ direktori)
│   │       ├── 📁 Auth/             # Halaman autentikasi
│   │       ├── 📁 Customer/         # Halaman untuk pelanggan
│   │       ├── 📁 Produk/           # Halaman manajemen produk
│   │       ├── 📁 Pelanggan/        # Halaman manajemen pelanggan
│   │       ├── 📁 Pesanan/          # Halaman manajemen pesanan
│   │       ├── 📁 Kunjungan/        # Halaman manajemen kunjungan
│   │       ├── 📁 Ulasan/           # Halaman ulasan
│   │       └── ...
│   └── 📁 views/                    # Template Blade (minimal)
│
├── 📁 routes/
│   ├── 📄 web.php                   # Route utama aplikasi
│   └── 📄 auth.php                  # Route autentikasi
│
├── 📁 storage/                      # File upload & cache
│
├── 📁 tests/                        # Unit & feature tests
│
├── 📄 .env                          # Environment variables
├── 📄 composer.json                 # Dependensi PHP
├── 📄 package.json                  # Dependensi JavaScript
├── 📄 vite.config.js                # Konfigurasi Vite
├── 📄 tailwind.config.js            # Konfigurasi Tailwind CSS
└── 📄 GEMINI.md                     # Dokumentasi changelog & panduan
```

---

## 4. Arsitektur Aplikasi

### Arsitektur Monolitik Modern dengan Inertia.js

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Components                       │    │
│  │  (Pages, Components, Layouts)                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ▲                                   │
│                              │ Inertia                           │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP Request
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LARAVEL BACKEND                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │──│ Controllers │──│ Inertia::render()       │  │
│  │ (web.php)   │  │             │  │ (Kirim props ke React)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Eloquent ORM (Models)                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (MySQL)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ users    │ │ products │ │ pesanan  │ │ kunjungan        │    │
│  │ pelanggan│ │ carts    │ │ ulasan   │ │ tipe_kunjungans  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Alur Request-Response dengan Inertia.js

1. **Request**: Pengguna mengakses URL (misal: `/customer/belanja`)
2. **Routing**: `routes/web.php` mengarahkan ke controller yang sesuai
3. **Controller**: Mengambil data dari database via Eloquent Model
4. **Inertia Render**: Controller merender komponen React dengan data sebagai props
   ```php
   return Inertia::render('Customer/Belanja', [
       'produk' => $produk,
       'kategori' => $kategori
   ]);
   ```
5. **Response**: Laravel mengirim JSON berisi nama komponen + props
6. **Frontend**: Inertia memuat komponen React dan meneruskan props

---

## 5. Modul dan Fitur Utama

### 🏪 Modul E-Commerce (Pelanggan)

| Fitur | Deskripsi |
|-------|-----------|
| **Katalog Produk** | Lihat daftar produk dengan filter kategori |
| **Detail Produk** | Informasi lengkap produk dengan galeri gambar |
| **Keranjang Belanja** | Tambah, edit, hapus item di keranjang |
| **Checkout** | Proses checkout dengan pilihan metode pengiriman |
| **Pembayaran** | Integrasi dengan Midtrans payment gateway |
| **Riwayat Pesanan** | Lihat status dan riwayat pesanan |
| **Ulasan Produk** | Berikan ulasan dan rating produk |

### 📅 Modul Kunjungan (Pelanggan)

| Fitur | Deskripsi |
|-------|-----------|
| **Booking Kunjungan** | Pesan jadwal kunjungan wisata edukatif |
| **Pilih Tipe Kunjungan** | Umum atau Outing Class dengan harga berbeda |
| **Kalkulasi Biaya** | Otomatis hitung biaya berdasarkan jumlah pengunjung |
| **Konfirmasi Booking** | Review dan konfirmasi jadwal kunjungan |

### 🔧 Modul Admin

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan statistik bisnis |
| **Manajemen Produk** | CRUD produk dengan kategori dan gambar |
| **Manajemen Pelanggan** | Kelola data pelanggan |
| **Manajemen Pesanan** | Proses dan update status pesanan |
| **Manajemen Kunjungan** | Jadwal, kalender, dan riwayat kunjungan |
| **Ulasan & Feedback** | Lihat dan moderasi ulasan pelanggan |
| **Laporan** | Generate laporan penjualan, kunjungan, produk terlaris |

---

## 6. Model Database (Eloquent)

Aplikasi memiliki **13 model Eloquent** yang merepresentasikan tabel database:

| Model | Tabel | Deskripsi |
|-------|-------|-----------|
| `User` | `users` | Data admin/pengguna sistem |
| `Pelanggan` | `pelanggans` | Data pelanggan yang berbelanja |
| `Produk` | `products` | Produk yang dijual |
| `ProductCategory` | `product_categories` | Kategori produk |
| `Cart` | `carts` | Keranjang belanja pelanggan |
| `Pesanan` | `pesanan` | Data pesanan/transaksi |
| `PesananItem` | `pesanan_items` | Item detail dalam pesanan |
| `Transaction` | `transactions` | Transaksi pembayaran |
| `Kunjungan` | `kunjungan` | Data booking kunjungan |
| `TipeKunjungan` | `tipe_kunjungans` | Tipe kunjungan (Umum/Outing Class) |
| `Ulasan` | `ulasan` | Ulasan dari pelanggan |
| `UlasanFoto` | `ulasan_fotos` | Foto lampiran ulasan |
| `Transaksi` | `*transaksis` | Data transaksi legacy |

---

## 7. Controller Aplikasi

### Controller Utama (Admin)

| Controller | Path | Fungsi |
|------------|------|--------|
| `DashboardController` | Menampilkan statistik dashboard admin |
| `ProdukController` | CRUD produk |
| `PelangganController` | CRUD pelanggan |
| `PesananController` | Manajemen pesanan |
| `KunjunganController` | Manajemen kunjungan (jadwal, kalender, riwayat) |
| `UlasanController` | Manajemen ulasan |
| `LaporanController` | Generate laporan (PDF/Excel) |
| `ProfileController` | Manajemen profil admin |

### Controller Pelanggan

| Controller | Path | Fungsi |
|------------|------|--------|
| `WelcomeController` | Halaman publik (home, tentang kami) |
| `BelanjaController` | Katalog & detail produk |
| `CartController` | Operasi keranjang belanja |
| `CheckoutController` | Alur checkout lengkap |
| `KunjunganControllerCust` | Booking kunjungan pelanggan |
| `PesananControllerCust` | Riwayat pesanan pelanggan |
| `ProfileController (Customer)` | Profil pelanggan |

### Controller Pendukung

| Controller | Fungsi |
|------------|--------|
| `LocationController` | Proxy API ke RajaOngkir (provinsi, kota, kecamatan) |
| `Auth/*` | Controller autentikasi (login, register, dll.) |

---

## 8. Halaman Frontend (React)

### Struktur Pages

```
resources/js/Pages/
├── 📁 Auth/              # Login, Register, Forgot Password, dll.
├── 📁 Customer/          # Semua halaman pelanggan
│   ├── 📄 DashboardCust.jsx      # Halaman utama pelanggan
│   ├── 📄 Belanja.jsx            # Katalog produk
│   ├── 📄 BelanjaDetail.jsx      # Detail produk
│   ├── 📄 Cart.jsx               # Keranjang belanja
│   ├── 📁 Checkout/              # Alur checkout (4 step)
│   │   ├── 📄 CheckoutMethod.jsx # Pilih metode (Ambil Sendiri/Kirim)
│   │   ├── 📄 Checkout1.jsx      # Input alamat
│   │   ├── 📄 Checkout2.jsx      # Pilih pengiriman
│   │   └── 📄 Checkout3.jsx      # Ringkasan & bayar
│   ├── 📄 Kunjungan.jsx          # Form booking kunjungan
│   ├── 📄 KunjunganKonfirmasi.jsx # Konfirmasi booking
│   ├── 📄 Profile.jsx            # Profil pelanggan
│   ├── 📁 Pesanan/               # Riwayat & detail pesanan
│   ├── 📁 Ulasan/                # Tulis & lihat ulasan
│   └── 📁 TentangKami/           # Halaman tentang perusahaan
│
├── 📄 Dashboard.jsx      # Dashboard admin
├── 📄 Welcome.jsx        # Landing page publik
├── 📁 Produk/            # CRUD produk (admin)
├── 📁 Pelanggan/         # CRUD pelanggan (admin)
├── 📁 Pesanan/           # Manajemen pesanan (admin)
├── 📁 Kunjungan/         # Manajemen kunjungan (admin)
├── 📁 Ulasan/            # Daftar ulasan (admin)
├── 📁 Laporan/           # Halaman laporan
├── 📁 Profile/           # Profil admin
├── 📁 Setelan/           # Pengaturan
└── 📁 Bantuan/           # Halaman bantuan
```

---

## 9. Komponen UI Reusable

Komponen yang dapat digunakan ulang di seluruh aplikasi:

| Komponen | Fungsi |
|----------|--------|
| `ApplicationLogo` | Logo aplikasi |
| `CartPanel` | Panel sliding keranjang belanja |
| `Modal` | Dialog modal reusable |
| `Dropdown` | Menu dropdown |
| `TextInput` | Input teks dengan styling konsisten |
| `InputLabel` | Label untuk input |
| `InputError` | Pesan error validasi |
| `Checkbox` | Checkbox dengan styling |
| `PrimaryButton` | Tombol utama (hijau) |
| `SecondaryButton` | Tombol sekunder |
| `DangerButton` | Tombol danger (merah) |
| `NavLink` | Link navigasi navbar |
| `ResponsiveNavLink` | Link navigasi responsive |

### Layouts

| Layout | Fungsi |
|--------|--------|
| `AuthenticatedLayout` | Layout untuk halaman admin (terautentikasi) |
| `CustomerLayout` | Layout untuk halaman pelanggan |
| `GuestLayout` | Layout untuk halaman publik/tamu |
| `KunjunganLayout` | Layout khusus halaman kunjungan |

---

## 10. Routing Aplikasi

### Route Publik
```
GET  /                    → WelcomeController@index (Landing page)
GET  /tentang-kami        → WelcomeController@tentangKami
```

### Route Pelanggan (auth:pelanggan)
```
# Belanja
GET  /customer/belanja              → Katalog produk
GET  /customer/belanja/{product}    → Detail produk

# Keranjang
POST   /customer/cart               → Tambah ke keranjang
PUT    /customer/cart/{cart}        → Update item keranjang
DELETE /customer/cart/{cart}        → Hapus dari keranjang

# Checkout
GET  /customer/checkout             → Pilih metode (Step 1)
POST /customer/checkout/method      → Simpan metode
GET  /customer/checkout/address     → Input alamat (Step 2)
POST /customer/checkout/address     → Simpan alamat
GET  /customer/checkout/shipping    → Pilih kurir (Step 3)
POST /customer/checkout/shipping    → Simpan pengiriman
GET  /customer/checkout/summary     → Ringkasan (Step 4)
POST /customer/checkout/process     → Proses pembayaran

# Kunjungan
GET  /customer/kunjungan            → Form booking
POST /customer/kunjungan/handle-form → Proses form
GET  /customer/kunjungan/konfirmasi → Halaman konfirmasi
POST /customer/kunjungan/customer   → Submit booking

# Profil & Pesanan
GET  /customer/profile              → Edit profil
GET  /customer/pesanan              → Riwayat pesanan
```

### Route Admin (auth)
```
# Dashboard
GET /dashboard                      → Dashboard admin

# Resources CRUD
/produk, /pelanggan, /kunjungan, /pesanan

# Kunjungan
GET /kunjungan/jadwal               → Daftar jadwal
GET /kunjungan/kalender             → Tampilan kalender
GET /kunjungan/riwayat              → Riwayat kunjungan

# Laporan
GET /laporan                        → Halaman laporan
GET /laporan/penjualan/{format}     → Export penjualan (PDF/Excel)
GET /laporan/kunjungan/{format}     → Export kunjungan
GET /laporan/produk-terlaris/{format} → Export produk terlaris

# Lainnya
/ulasan, /setelan, /bantuan, /profile
```

### API Route (Proxy RajaOngkir)
```
GET /api/locations/provinces        → Daftar provinsi
GET /api/locations/cities           → Daftar kota
GET /api/locations/districts        → Daftar kecamatan
GET /api/locations/subdistricts     → Daftar kelurahan
```

---

## 11. Integrasi Pihak Ketiga

### 💳 Midtrans (Payment Gateway)
- **Package**: `midtrans/midtrans-php`
- **Fungsi**: Memproses pembayaran online (virtual account, e-wallet, dll.)
- **Konfigurasi**: API keys di `.env` file

### 🚚 RajaOngkir (Ongkos Kirim)
- **Type**: API Proxy melalui `LocationController`
- **Fungsi**: Mendapatkan data provinsi, kota, kecamatan, dan perhitungan ongkir
- **Konfigurasi**: API key di `.env` file

### 📄 DomPDF (Generate PDF)
- **Package**: `barryvdh/laravel-dompdf`
- **Fungsi**: Generate laporan dan invoice dalam format PDF

### 📊 Simple Excel (Export Data)
- **Package**: `spatie/simple-excel`
- **Fungsi**: Export data ke format Excel/CSV

---

## 12. Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js >= 18
- NPM atau Yarn
- MySQL/PostgreSQL

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone <url-repositori>
cd CPH_Project

# 2. Install dependensi PHP
composer install

# 3. Install dependensi JavaScript
npm install

# 4. Salin file environment
copy .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Konfigurasi database di file .env
# Edit: DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 7. Jalankan migrasi database
php artisan migrate

# 8. (Opsional) Jalankan seeder untuk data awal
php artisan db:seed

# 9. Buat symbolic link untuk storage
php artisan storage:link
```

### Menjalankan Aplikasi

```bash
# Terminal 1: Jalankan server Laravel
php artisan serve

# Terminal 2: Jalankan Vite (frontend hot-reload)
npm run dev
```

Akses aplikasi di: `http://localhost:8000`

---

## 13. Perintah-Perintah Penting

### Pengembangan
```bash
# Jalankan server development (cara alternatif)
composer dev

# Build frontend untuk produksi
npm run build

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

### Database
```bash
# Jalankan migrasi
php artisan migrate

# Rollback migrasi terakhir
php artisan migrate:rollback

# Fresh migrate (hapus semua tabel & migrasi ulang)
php artisan migrate:fresh

# Jalankan seeder
php artisan db:seed
```

### Testing
```bash
# Jalankan test
php artisan test
# atau
composer test
```

### Artisan Helpers
```bash
# Lihat semua route
php artisan route:list

# Generate model dengan migration
php artisan make:model NamaModel -m

# Generate controller dengan resource methods
php artisan make:controller NamaController --resource
```

---

## 14. Alur Kerja Pengembangan

### Membuat Fitur Baru

1. **Planning**: Diskusikan fitur dan buat rencana di `INTRUKSI.md`
2. **Database**: Buat migration jika perlu tabel/kolom baru
3. **Model**: Buat atau update Eloquent Model
4. **Controller**: Implementasi logic di controller
5. **Routes**: Tambahkan route di `routes/web.php`
6. **Frontend**: Buat komponen React di `resources/js/Pages/`
7. **Testing**: Test manual atau automated
8. **Documentation**: Update `GEMINI.md` dengan changelog

### Konvensi Kode

- **Controller**: PascalCase (contoh: `ProdukController`)
- **Model**: PascalCase singular (contoh: `Produk`, `Pelanggan`)
- **Migration**: snake_case dengan timestamp (contoh: `2025_01_10_create_products_table`)
- **React Component**: PascalCase dengan `.jsx` extension
- **CSS**: Tailwind utility classes

### Git Workflow

```bash
# Commit dengan pesan deskriptif
git commit -m "Feat: Menambahkan fitur X"
git commit -m "Fix: Memperbaiki bug Y"
git commit -m "Refactor: Merombak komponen Z"
```

---

## 15. Catatan Tambahan

### File Penting

| File | Fungsi |
|------|--------|
| `GEMINI.md` | Panduan proyek & changelog lengkap |
| `INTRUKSI.md` | Rencana eksekusi fitur yang sedang dikembangkan |
| `.env` | Konfigurasi environment (database, API keys, dll.) |
| `vite.config.js` | Konfigurasi build tool Vite |
| `tailwind.config.js` | Konfigurasi Tailwind CSS |

### Tips Debugging

1. **Error Frontend**: Cek browser console (F12 → Console)
2. **Error Backend**: Cek `storage/logs/laravel.log`
3. **Error Database**: Pastikan konfigurasi `.env` benar
4. **Hot Reload Tidak Bekerja**: Restart `npm run dev`

### Kontributor

- Dikembangkan untuk **Coffee Palantea Hidroponik (CPH)**
- Dibangun dengan ❤️ menggunakan Laravel + React + Inertia.js

---

📅 **Terakhir Diperbarui**: 10 Januari 2026

