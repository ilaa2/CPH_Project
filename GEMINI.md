# Panduan Proyek CPH_Project

Dokumen ini memberikan gambaran umum tingkat tinggi tentang proyek, tumpukan teknologi, struktur, dan alur kerja umum untuk membantu pengembang baru memahami basis kode dengan cepat.

## 1. Ringkasan Proyek

**CPH_Project** adalah aplikasi web full-stack yang dirancang sebagai sistem manajemen bisnis dan e-commerce. Aplikasi ini memungkinkan pengelolaan produk, pelanggan, pesanan, dan kunjungan. Dilihat dari penamaan file dan fungsionalitasnya, aplikasi ini ditujukan untuk pasar Indonesia.

**Fitur Utama:**
- **Manajemen Produk:** Membuat, membaca, memperbarui, dan menghapus (CRUD) produk, termasuk kategori dan status.
- **Manajemen Pelanggan:** Mengelola data pelanggan dan profil mereka.
- **Sistem Pemesanan:** Memproses pesanan dari pelanggan.
- **Keranjang Belanja & Checkout:** Fungsionalitas e-commerce standar untuk memungkinkan pengguna membeli produk.
- **Manajemen Kunjungan:** Mengatur dan melacak kunjungan pelanggan, yang bisa berarti janji temu atau pemesanan layanan.
- **Ulasan & Peringkat:** Pelanggan dapat memberikan ulasan untuk produk atau layanan.
- **Pelaporan:** Menghasilkan laporan berdasarkan data yang ada (misalnya, penjualan, kunjungan).
- **Manajemen Profil:** Pengguna dan pelanggan dapat mengelola profil mereka sendiri.

## 2. Tumpukan Teknologi (Tech Stack)

Aplikasi ini menggunakan pendekatan monolitik modern yang menggabungkan backend dan frontend dalam satu basis kode.

- **Backend:**
  - **Framework:** Laravel (PHP)
  - **Database:** Database relasional (misalnya, MySQL, PostgreSQL) yang dikelola melalui Eloquent ORM.
  - **Server:** PHP Development Server (`php artisan serve`).

- **Frontend:**
  - **Framework:** React.js (dengan sintaks JSX).
  - **Styling:** Tailwind CSS.
  - **Build Tool:** Vite.

- **Jembatan Backend-Frontend:**
  - **Inertia.js:** Ini adalah komponen kunci dari arsitektur. Inertia.js memungkinkan kita membangun aplikasi halaman tunggal (SPA) menggunakan React di frontend tanpa perlu membuat API REST/GraphQL. Controller Laravel merender komponen React secara langsung dan mengirimkan data sebagai `props`.

## 3. Struktur Proyek

Berikut adalah direktori paling penting dan fungsinya:

- `app/Http/Controllers/`: Berisi logika utama aplikasi. Controller mengambil data dari Model dan merender halaman React menggunakan `Inertia::render()`.
- `app/Models/`: Representasi tabel database (Eloquent Models).
- `database/migrations/`: Skema database didefinisikan dan diubah melalui file migrasi.
- `routes/web.php`: Mendefinisikan semua rute web aplikasi yang dapat diakses oleh pengguna.
- `resources/js/`: Direktori utama untuk semua kode frontend.
  - `resources/js/Pages/`: Komponen React yang berfungsi sebagai "halaman". Setiap file di sini biasanya sesuai dengan satu rute atau lebih.
  - `resources/js/Components/`: Komponen React yang dapat digunakan kembali (seperti Tombol, Input, Modal).
  - `resources/js/Layouts/`: Komponen React yang mendefinisikan tata letak halaman (misalnya, `AuthenticatedLayout.jsx` untuk halaman yang memerlukan login).
- `public/`: Web root. Aset yang telah di-build oleh Vite akan ditempatkan di sini.
- `vite.config.js`: File konfigurasi untuk Vite, build tool frontend.

## 4. Alur Kerja Umum (Request-Response Cycle)

Memahami alur kerja Inertia.js sangat penting untuk bekerja pada proyek ini.

1.  **Permintaan (Request):** Pengguna mengunjungi URL (misalnya, `/produk`).
2.  **Routing:** `routes/web.php` mencocokkan URL dengan metode di Controller (misalnya, `ProdukController@index`).
3.  **Controller:** Metode `index` di `ProdukController` mengambil data yang diperlukan dari database menggunakan Model `Produk`.
4.  **Render Inertia:** Alih-alih mengembalikan view Blade, controller menggunakan `Inertia::render('Produk/Index', ['produks' => $data])`.
    - Argumen pertama (`'Produk/Index'`) adalah nama komponen React di `resources/js/Pages/Produk/Index.jsx`.
    - Argumen kedua adalah data (props) yang akan dikirim ke komponen React.
5.  **Respons:** Laravel mengirimkan respons JSON yang berisi nama komponen dan props-nya.
6.  **Frontend:** Inertia di sisi klien menerima JSON ini, secara dinamis memuat komponen `Produk/Index.jsx`, dan merendernya dengan data yang diterima.

Navigasi selanjutnya ke halaman lain (misalnya, melalui `<Link href="/pelanggan">`) akan dicegat oleh Inertia, yang akan membuat permintaan XHR di latar belakang dan hanya menukar komponen halaman tanpa memuat ulang seluruh halaman.

## 5. Perintah Penting (Important Commands)

- **Memasang Dependensi:**
  ```bash
  # Dependensi PHP (Backend)
  composer install

  # Dependensi JavaScript (Frontend)
  npm install
  ```

- **Menjalankan Lingkungan Pengembangan:**
  Buka dua terminal terpisah.
  ```bash
  # Terminal 1: Jalankan server backend Laravel
  php artisan serve

  # Terminal 2: Jalankan server pengembangan Vite (dengan Hot Module Replacement)
  npm run dev
  ```

- **Tugas Database:**
  ```bash
  # Menjalankan migrasi untuk membuat tabel
  php artisan migrate

  # Mengisi database dengan data awal (jika seeder ada)
  php artisan db:seed
  ```

- **Build untuk Produksi:**
  ```bash
  # Mengompilasi dan mem-bundle aset frontend untuk produksi
  npm run build
  ```

## 6. Panduan Memulai (Getting Started)

Untuk menjalankan proyek ini secara lokal untuk pertama kalinya:

1.  **Clone Repositori:** `git clone <url-repositori>`
2.  **Salin File Environment:** `copy .env.example .env`
3.  **Konfigurasi `.env`:** Atur koneksi database Anda (DB_DATABASE, DB_USERNAME, DB_PASSWORD).
4.  **Instal Dependensi PHP:** `composer install`
5.  **Hasilkan Kunci Aplikasi:** `php artisan key:generate`
6.  **Instal Dependensi Node.js:** `npm install`
7.  **Jalankan Migrasi Database:** `php artisan migrate` (tambahkan `--seed` jika Anda ingin menjalankan seeder).
8.  **Jalankan Server:**
    - Di satu terminal: `php artisan serve`
    - Di terminal lain: `npm run dev`
9.  Akses aplikasi di `http://localhost:8000` (atau port yang ditentukan oleh `artisan serve`).


## 7. Alur Kerja Pembaruan Changelog (Semi-Otomatis)

Proyek ini menggunakan alur kerja semi-otomatis untuk mencatat perkembangan. Tujuannya adalah agar catatan selalu relevan, terstruktur, dan berkualitas tinggi.

### Langkah 1: Pengembang (Anda)
1.  Selesaikan pekerjaan atau fitur.
2.  Lakukan git commit dengan *pesan yang jelas dan deskriptif*. Anda bisa menggunakan Git Desktop atau CLI.
    -   *Contoh Pesan Commit yang Baik:* Feat: Menambahkan fitur login atau Fix: Memperbaiki validasi form produk.

### Langkah 2: Asisten AI (Gemini)
1.  Setelah Anda siap mencatat kemajuan, berikan perintah sederhana seperti: *"Tolong perbarui changelog"*.
2.  Asisten akan menganalisis commit terakhir Anda, membuat draf entri changelog, dan meminta persetujuan Anda.
3.  Setelah Anda setuju, asisten akan secara otomatis menambahkan entri tersebut di bawah ini.

---

### Riwayat Perubahan

(Entri baru akan ditambahkan di sini oleh Asisten AI)
