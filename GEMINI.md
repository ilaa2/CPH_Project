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

## 8. Alur Kerja Pengembangan Fitur Baru

Untuk memastikan pengembangan fitur baru berjalan terstruktur, transparan, dan terdokumentasi dengan baik, kita akan mengikuti alur kerja berbasis instruksi.

### Langkah 1: Permintaan Fitur
Saat Anda meminta untuk dibuatkan fitur baru (misalnya, "buatkan saya fitur manajemen inventaris"), Asisten AI akan memulai proses perencanaan.

### Langkah 2: Pembuatan Rencana Eksekusi (`INTRUKSI.md`)
1.  Asisten AI akan menganalisis permintaan Anda dan menyusun rencana pengembangan langkah demi langkah.
2.  Rencana ini akan ditulis ke dalam file baru bernama `INTRUKSI.md` di root proyek.
3.  Setiap langkah dalam file tersebut akan didesain agar jelas, terperinci, dan dapat dieksekusi secara mandiri. Tujuannya adalah agar Anda dapat memahami keseluruhan proses dan bahkan melanjutkannya sendiri jika diperlukan.

### Langkah 3: Eksekusi dan Pencatatan di `INTRUKSI.md`
1.  Setelah file `INTRUKSI.md` dibuat dan disetujui, Asisten AI akan mulai mengeksekusi setiap langkah yang tertulis di dalamnya secara berurutan.
2.  **Setelah setiap langkah berhasil dieksekusi**, Asisten akan **memperbarui file `INTRUKSI.md`** untuk mencatat bahwa langkah tersebut telah selesai. Ini mengubah `INTRUKSI.md` dari sekadar rencana menjadi catatan perkembangan (living document).
3.  Asisten juga akan memberikan laporan singkat kepada Anda setelah setiap langkah selesai sebelum melanjutkan ke langkah berikutnya.
4.  Dengan cara ini, Anda dapat memantau kemajuan secara real-time dan memiliki catatan historis yang akurat tentang apa yang telah dilakukan di dalam file `INTRUKSI.md`.

Alur kerja ini memastikan bahwa setiap pengembangan fitur baru memiliki jejak perencanaan yang jelas dan memungkinkan kolaborasi yang lebih baik antara Anda dan Asisten AI.

---

### Riwayat Perubahan

**Selasa, 4 November 2025**
*   **Perbaikan Format Alamat Pengiriman (Lanjutan):**
    *   Mengatasi masalah persisten di mana alamat pengiriman pada halaman checkout masih menampilkan string "undefined" atau nilai kosong.
    *   **Akar Masalah:** Meskipun filter awal sudah diterapkan, beberapa skenario data input atau respons API masih memungkinkan nilai kosong atau literal "undefined"/"null" untuk lolos ke *frontend*.
    *   **Solusi Komprehensif:**
        1.  **Backend (`CheckoutController.php`):** Logika `array_filter` di method `saveAddress` diperkuat. Setiap bagian alamat kini secara eksplisit di-*cast* ke string dan kemudian difilter secara ketat untuk menghapus string kosong (`''`), serta literal string `'undefined'` dan `'null'`. Ini memastikan `full_address_string` yang disimpan ke sesi selalu bersih.
        2.  **Frontend (`Checkout2.jsx` & `Checkout3.jsx`):** Fungsi utilitas `formatAddress` yang memecah string alamat, memfilter bagian yang kosong atau tidak valid, dan menggabungkannya kembali, telah diterapkan pada kedua komponen `Checkout2.jsx` dan `Checkout3.jsx`. Ini menjamin bahwa alamat yang ditampilkan kepada pengguna selalu rapi dan benar, terlepas dari potensi inkonsistensi data awal.

*   **Restrukturisasi Halaman "Tentang Kami":**
    *   Melakukan restrukturisasi file untuk meningkatkan organisasi dan modularitas komponen halaman.
    *   **Tindakan:** File `TentangKami.jsx` dipindahkan dari direktori `resources/js/Pages` ke dalam folder baru yang lebih spesifik, yaitu `resources/js/Pages/Customer/TentangKami/`.
    *   **Penyesuaian Kode:** Path rendering di dalam `WelcomeController.php` diperbarui untuk menunjuk ke lokasi file yang baru (`Customer/TentangKami/TentangKami`), memastikan rute `/tentang-kami` tetap berfungsi tanpa error.
    *   **Hasil:** Perubahan ini merapikan struktur direktori halaman frontend, membuatnya lebih terorganisir dan mudah dikelola.

*   **Refaktorisasi Direktori Controller:**
    *   Melakukan refaktorisasi untuk mengatasi inkonsistensi dalam struktur direktori `app/Http/Controllers`.
    *   **Tindakan:** Mengonsolidasikan direktori `Cust` dan `Customer` yang duplikatif. Semua file *controller* dari `app/Http/Controllers/Cust` dipindahkan ke `app/Http/Controllers/Customer`.
    *   **Penyesuaian Kode:** *Namespace* pada setiap *controller* yang dipindahkan telah diperbarui dari `App\Http-Controllers\Cust` menjadi `App\Http\Controllers\Customer`. Selain itu, semua pernyataan `use` yang relevan di `routes/web.php` juga telah disesuaikan untuk merujuk ke *namespace* yang baru.
    *   **Hasil:** Perubahan ini berhasil menyederhanakan struktur proyek, menghilangkan redundansi, dan meningkatkan konsistensi serta keterbacaan kode.

*   **Perbaikan `RouteNotFoundException` (Route `login`):**
    *   Mengatasi error `Symfony\Component\Routing\Exception\RouteNotFoundException` dengan pesan `Route [login] not defined` yang menyebabkan aplikasi mengalami *crash*.
    *   **Akar Masalah:** Error ini terjadi karena middleware autentikasi mencoba mengarahkan pengguna yang belum terautentikasi ke route bernama `login`, namun route tersebut belum didefinisikan dalam aplikasi.
    *   **Solusi:** Memperbaiki masalah dengan menyertakan file `routes/auth.php` ke dalam `routes/web.php` menggunakan `require __DIR__.'/auth.php';`. Tindakan ini memastikan bahwa semua route terkait autentikasi, termasuk route `login`, terdaftar dengan benar dan dapat diakses oleh aplikasi, sehingga mencegah *crash* dan memastikan alur autentikasi berjalan lancar.

*   **Perbaikan Komprehensif Hero Slider (Layout, Konten & Transisi):**
    *   Mengatasi serangkaian masalah desain pada komponen *hero slider* di halaman utama pelanggan (`DashboardCust.jsx`) untuk meningkatkan pengalaman pengguna secara keseluruhan.
    *   **Solusi Tata Letak & Konten:** Memperbaiki penempatan tombol CTA yang canggung dengan menambahkan data `title` dan `subtitle` yang sebelumnya hilang. Ini memberikan konteks pada tombol dan menyelaraskannya secara logis di bawah blok teks.
    *   **Solusi Rasio Aspek Gambar:** Mengubah metode rendering dari `background-image` CSS menjadi tag `<img>` HTML dengan `object-cover` untuk memastikan semua gambar latar ditampilkan secara proporsional tanpa distorsi.
    *   **Solusi Transisi Tumpang Tindih:** Mengatasi masalah di mana teks dan tombol dari slide yang berbeda saling tumpang tindih selama transisi. Ini diselesaikan dengan mengubah efek animasi carousel dari `slide` menjadi `fade`, sehingga menghasilkan pergantian slide yang mulus dan bebas dari elemen yang berbenturan secara visual.

**Rabu, 22 Oktober 2025**
*   **Penyempurnaan Tampilan Kalender (Auto-Fit Viewport):**
    *   Mengatasi masalah munculnya *scrollbar* internal pada komponen kalender yang disebabkan oleh pembatasan tinggi (`height="80vh"`).
    *   **Solusi:** Menambahkan aturan CSS baru pada `resources/css/app.css` yang menargetkan kelas `.fc .fc-daygrid-day-frame`. Aturan ini memaksa `min-height` dari sel hari menjadi sangat kecil (`1px`), sehingga memungkinkan tinggi baris kalender untuk menyusut secara proporsional dan otomatis agar pas sepenuhnya di dalam viewport tanpa perlu scroll internal maupun eksternal.

**Selasa, 21 Oktober 2025**
*   **Perbaikan Lanjutan Tampilan Kalender (CSS Override):**
    *   Menambahkan aturan CSS kustom pada file `resources/css/app.css` untuk menimpa gaya bawaan FullCalendar.
    *   **Masalah:** Blok event kalender masih terlalu tinggi meskipun kontennya sudah diringkas.
    *   **Solusi:** Aturan CSS baru ini secara spesifik menargetkan kelas `.fc-daygrid-event` untuk mengurangi `padding` dan `font-size` secara paksa, menghasilkan tampilan event yang jauh lebih pendek dan memastikan kalender terlihat padat dan rapi.
*   **Penyempurnaan Visual Kalender Kunjungan:**
    *   Memperbaiki masalah tata letak pada halaman "Kalender Kunjungan" di mana blok event terlalu tinggi dan menyebabkan baris minggu terlihat renggang.
    *   **Solusi:** Menyesuaikan CSS pada komponen event (`Kunjungan/Kalender.jsx`) dengan mengurangi *padding* vertikal dan menggabungkan beberapa baris info menjadi satu. Hasilnya adalah tampilan kalender yang lebih ringkas, padat, dan profesional secara visual.
*   **Desain Ulang Total Halaman Kalender Kunjungan:**
    *   Merombak total UI/UX halaman "Kalender Kunjungan" (`Kunjungan/Kalender.jsx`) untuk meningkatkan kejelasan visual dan fungsionalitas.
    *   **Palet Warna Baru:** Mengimplementasikan skema warna yang lebih intuitif dan profesional untuk status kunjungan: Biru untuk "Dijadwalkan", Hijau untuk "Selesai", dan Abu-abu dengan aksen merah untuk "Dibatalkan".
    *   **Tampilan Event Modern:** Mendesain ulang tampilan setiap event di kalender agar lebih informatif, menampilkan waktu, nama pelanggan, dan tipe kunjungan dengan border samping sebagai indikator status visual yang halus. Event yang dibatalkan kini juga memiliki teks yang dicoret.
    *   **Peningkatan Konsistensi:** Memperbarui modal detail kunjungan agar menggunakan komponen `Modal` standar aplikasi dan menyempurnakan tampilannya agar selaras dengan perubahan desain lainnya.
*   **Standarisasi UI Halaman Ulasan & Feedback:**
    *   Merombak total halaman "Ulasan & Feedback" (`Ulasan/Index.jsx`) dengan mengubah layout dari grid berbasis kartu menjadi tampilan tabel yang terstruktur.
    *   **Tujuan:** Menyeragamkan desain halaman ini dengan halaman admin lainnya (seperti Pesanan, Pelanggan, dll.) untuk menciptakan pengalaman pengguna yang konsisten di seluruh aplikasi.
    *   **Implementasi:** Tabel baru ini menampilkan semua data ulasan yang relevan—termasuk nama pelanggan, rating bintang, detail ulasan, gambar, dan tipe ulasan—serta dilengkapi kolom "Aksi" dengan tombol hapus yang diposisikan di tengah untuk kemudahan akses.
*   **Perbaikan Kritis & Peningkatan UI Modal Pesanan:**
    *   **Perbaikan Bug:** Mengatasi error fatal `Uncaught TypeError: Cannot read properties of undefined (reading 'map')` yang terjadi saat membuka modal edit pesanan.
        *   **Akar Masalah:** Form modal edit (`PesananForm`) tidak menerima `pelangganList` dan `produkList` yang diperlukan untuk merender dropdown.
        *   **Solusi:** Menyesuaikan method `index` di `PesananController.php` untuk selalu mengirimkan `pelangganList` dan `produkList` ke halaman `Pesanan/Index.jsx`, memastikan modal edit memiliki data yang dibutuhkan dan mencegah crash.
    *   **Desain Ulang UI:** Merombak total tampilan modal "Detail Pesanan" menjadi desain nota/invoice yang lebih profesional dan informatif. Desain baru ini mencakup header yang jelas, informasi pelanggan yang terstruktur, tabel item yang lebih rapi, dan rincian total biaya yang lebih baik, meningkatkan pengalaman pengguna secara signifikan.
*   **Modernisasi UI Halaman Pesanan Admin:**
    *   Merombak total halaman "Pesanan" admin (`Pesanan/Index.jsx`) untuk mengadopsi alur kerja berbasis modal, meningkatkan konsistensi UI dengan halaman admin lainnya.
    *   **Fungsionalitas Modal:** Mengganti navigasi halaman tradisional dengan modal pop-up untuk aksi "Tambah Pesanan", "Lihat Detail", dan "Edit Pesanan". Hal ini menciptakan pengalaman pengguna yang lebih lancar tanpa perlu memuat ulang halaman.
    *   **UX & Styling:** Memastikan semua modal dapat ditutup dengan mengklik area luar (overlay). Menyesuaikan styling kolom "Aksi" pada tabel pesanan agar semua tombol (Lihat, Edit, Hapus) berada di tengah secara horizontal, menghasilkan tampilan yang lebih rapi dan profesional.
*   **Peningkatan Fungsionalitas Form Admin:**
    *   Merombak total halaman "Tambah Kunjungan" admin (`Kunjungan/Create.jsx`) menjadi form dinamis yang cerdas.
    *   **Frontend:** Mengimplementasikan *conditional rendering* yang menampilkan input jumlah pengunjung (Dewasa, Anak, Balita) berdasarkan tipe kunjungan yang dipilih, mereplikasi logika dari halaman pelanggan.
    *   **Fitur Kalkulasi & Override:** Menambahkan kalkulasi biaya otomatis yang bereaksi secara *real-time* terhadap perubahan jumlah peserta. Field "Total Biaya" kini juga dapat di-edit secara manual oleh admin untuk memasukkan harga khusus atau diskon.
    *   **Backend:** Menyesuaikan method `store` di `KunjunganController.php` untuk menerima, memvalidasi, dan menyimpan struktur data pengunjung yang baru, serta memastikan data yang di-override oleh admin dapat diproses dengan benar.
*   **Pemulihan Fungsionalitas Admin:**
    *   Mengembalikan tombol `+ Tambah Kunjungan` yang hilang pada halaman admin "Jadwal Kunjungan" (`Kunjungan/Jadwal.jsx`).
    *   Tombol ini ditempatkan di header halaman, di sebelah kanan judul, untuk memungkinkan admin menambahkan data kunjungan manual (misalnya, dari pesanan offline via WhatsApp atau telepon), mengembalikan fungsionalitas penting yang sebelumnya hilang setelah desain ulang.
*   **Penyesuaian Tampilan Form Kunjungan Berdasarkan Tipe:**
    *   **Halaman Edit:** Menerapkan *conditional rendering* pada form `Kunjungan/Edit.jsx`. Kini, form secara cerdas hanya akan menampilkan input "Jumlah Anak" untuk tipe kunjungan "Outing Class", sementara menyembunyikan input "Dewasa" dan "Balita" yang tidak relevan. Untuk tipe kunjungan lainnya, semua input jumlah pengunjung tetap ditampilkan seperti biasa.
    *   **Modal Detail:** Melakukan verifikasi pada modal detail di halaman `Kunjungan/Jadwal.jsx` dan memastikan logika serupa sudah terimplementasi dengan benar, sehingga informasi yang ditampilkan selalu konsisten dan relevan dengan tipe kunjungannya.

**Senin, 20 Oktober 2025**
*   **Konsistensi Data di Halaman Admin Kunjungan:**
    *   Menyelaraskan tampilan data di modal "Detail Kunjungan" dan halaman "Edit Kunjungan" agar konsisten dengan tabel utama di `Jadwal.jsx`.
    *   **Detail Modal:** Menghapus field "Alamat" yang tidak relevan dan mengganti "Jumlah Pengunjung" dengan rincian spesifik (Dewasa, Anak, Balita) untuk memberikan informasi yang lebih akurat.
    *   **Halaman Edit:** Melakukan refaktor pada form edit (`Edit.jsx`) untuk hanya mengizinkan perubahan status. Informasi lain, termasuk rincian jumlah peserta yang baru ditambahkan, kini ditampilkan sebagai data statis yang tidak dapat diubah, mencegah inkonsistensi data.
*   **Peningkatan UI/UX Halaman Admin Jadwal Kunjungan:**
    *   Merombak tabel jadwal kunjungan (`Kunjungan/Jadwal.jsx`) agar lebih informatif dan ringkas.
    *   **Perubahan Kolom:** Menghapus kolom "Alamat" yang tidak relevan, lalu menambahkan kolom "Peserta" (total pengunjung) dan "Total Biaya" untuk menyajikan data kunci secara langsung.
    *   **Desain Ulang Aksi:** Mengganti tautan "Edit" dan "Hapus" menjadi tombol modern dengan ikon (✏️, 🗑️) dan menambahkan tombol "Detail" (👁️) untuk meningkatkan interaktivitas dan konsistensi visual.
    *   **Pembersihan Navigasi:** Menghapus semua tautan navigasi "Kembali ke..." dari seluruh halaman admin (`Jadwal.jsx`, `Riwayat.jsx`, dll.) untuk menyederhanakan antarmuka dan menghilangkan elemen yang berlebihan.
*   **Penyempurnaan Alur Kunjungan "Outing Class":**
    *   Memperbaiki inkonsistensi tampilan pada halaman konfirmasi kunjungan untuk tipe "Outing Class".
    *   **Masalah:** Halaman konfirmasi menampilkan rincian "Jumlah Dewasa" dan "Jumlah Balita" yang tidak relevan untuk "Outing Class", sehingga membingungkan pengguna.
    *   **Solusi:** Menerapkan *conditional rendering* di `KunjunganKonfirmasi.jsx`. Sekarang, rincian jumlah pengunjung akan secara dinamis menyesuaikan dengan tipe kunjungan. Untuk "Outing Class", hanya "Jumlah Anak" yang ditampilkan, sementara untuk tipe lain, semua rincian (dewasa, anak, balita) akan muncul. Hal ini memastikan informasi yang disajikan selalu relevan dan akurat.
*   **Perbaikan Visual Form Kunjungan (CSS):**
    *   Memperbaiki masalah layout di mana input field jumlah pengunjung (Dewasa, Anak, Balita) tidak sejajar secara horizontal.
    *   **Solusi:** Menambahkan utility class `items-end` dari Tailwind CSS ke `div` pembungkus ketiga input tersebut di `Kunjungan.jsx`. Class ini memaksa semua item di dalam grid untuk sejajar di bagian bawah, menghasilkan tampilan input yang rata dan rapi secara visual.
*   **Perbaikan Kritis Kalkulasi Biaya Kunjungan:**
    *   Memperbaiki bug di mana total biaya pada halaman booking kunjungan selalu Rp 0.
    *   **Akar Masalah:** Adanya ketidakcocokan nama tipe kunjungan yang di-hardcode dalam logika. Kode menggunakan "Kunjungan Sekolah" dan "Sewa Tempat", sementara data aktual di database adalah "Outing Class" dan "Umum".
    *   **Frontend (`Kunjungan.jsx`):** Menyesuaikan kondisi di dalam `useEffect` hook untuk menggunakan `Outing Class` dan `Umum`, memastikan state jumlah pengunjung di-reset dengan benar saat tipe kunjungan dipilih.
    *   **Backend (`KunjunganControllerCust.php`):** Menyelaraskan logika kalkulasi biaya di dalam method `calculateTotalCost` dan validasi di `handleForm` & `store` untuk juga menggunakan `Outing Class` dan `Umum`. Ini memastikan konsistensi data dan kalkulasi yang akurat dari sisi server.
*   **Perbaikan Fungsionalitas Pengajuan Kunjungan Pelanggan:**
    *   **Backend:** Menambahkan method `handleForm` baru di `KunjunganController` untuk menangani pengajuan jadwal kunjungan dari halaman pelanggan. Logika ini mencakup validasi input, kalkulasi biaya yang aman di sisi server, dan pembuatan record kunjungan baru dengan status "Dijadwalkeun".
    *   **Frontend:** Memperbaiki bug di halaman `Customer/Kunjungan.jsx` di mana input untuk jumlah pengunjung (dewasa, anak, balita) tidak muncul untuk tipe kunjungan umum. Sekarang, input tersebut akan tampil untuk semua tipe kunjungan kecuali "Kunjungan Sekolah", memastikan pelanggan dapat memasukkan jumlah peserta dengan benar.
    *   **Peningkatan UX:** Menambahkan logika untuk memperbarui nama dan nomor telepon pelanggan jika mereka mengubahnya di form, menyederhanakan proses pembaruan data kontak.

**Jumat, 10 Oktober 2025**
*   **Peningkatan UI/UX Halaman Ulasan Pelanggan:**
    *   Mendesain ulang total tampilan kartu ulasan (`UlasanCard`) agar lebih modern, ringkas, dan informatif, mengikuti standar e-commerce internasional.
    *   Mengganti layout daftar vertikal dengan **grid responsif** (3 kolom di desktop, 2 di tablet, 1 di mobile) untuk mengatasi masalah kartu yang terlihat "terlalu besar".
    *   Menyempurnakan hierarki visual di dalam kartu, termasuk header, rating bintang, subjek ulasan, dan galeri foto yang lebih ringkas.
*   **Perbaikan Alur Ulasan Kunjungan:**
    *   Memperbaiki bug di mana pelanggan dialihkan ke halaman login setelah mengirimkan ulasan untuk kunjungan.
    *   Masalah disebabkan oleh `UlasanController` yang mengarahkan pengguna ke rute yang salah (`kunjungan.riwayat` atau `customer.pesanan.riwayat` yang tidak ada).
    *   Pengalihan (redirect) diperbaiki untuk mengarah ke rute yang benar, yaitu `customer.pesanan.index`, memastikan alur pengguna tetap lancar dan konsisten dengan alur ulasan produk.
*   **Konsistensi Status Kunjungan:**
    *   Mengubah nilai status pada modul "Kunjungan" dari huruf kecil (`dijadwalkan`, `selesai`, `dibatalkan`) menjadi diawali huruf besar (`Dijadwalkan`, `Selesai`, `Dibatalkan`) agar seragam dengan modul "Produk".
    *   Membuat dan menjalankan migrasi database baru untuk memperbarui skema tabel `kunjungan` dan mengonversi data yang ada.
    - Menyesuaikan semua referensi status di backend (Controller, Seeder) dan frontend (React Components) untuk menggunakan format kapital yang baru.
    - Memperbaiki kesalahan ketik pada aturan validasi status di `KunjunganController` dari `Direncanakan` menjadi `Dijadwalkan`.

**Kamis, 9 Oktober 2025**
*   **Peningkatan Tampilan & Responsivitas (UI/UX Enhancement)**
    *   **Desain Ulang Halaman "Tentang Kami":**
        *   Merombak total bagian "Liputan Media" dengan layout kartu modern yang menampilkan logo media, judul lengkap, dan tombol "Baca Selengkapnya".
        *   Memperbarui dan menambahkan beberapa tautan liputan media dari berbagai sumber (DETAK24COM, Classnews, Riau24Jam, dll).
        *   Mendesain ulang bagian profil "Tentang CPH" menjadi layout dua kolom dengan gambar dan teks, serta menambahkan bagian baru "Keunggulan Kami" yang dilengkapi ikon untuk menyorot poin-poin utama (100% Hidroponik, Bebas Pestida, Edukasi & Wisata).
    *   **Peningkatan Responsivitas Halaman:**
        *   **Halaman Belanja Pelanggan:** Menyesuaikan grid produk, tombol filter, dan ukuran judul agar tampil optimal di perangkat mobile.
        - **Halaman Daftar Produk (Admin):** Mengganti tampilan tabel yang lebar dengan layout kartu yang ringkas dan mudah dibaca di mobile, sementara tampilan tabel tetap dipertahankan untuk desktop.
        - **Halaman Daftar Pelanggan (Admin):** Menerapkan perbaikan responsivitas yang sama dengan mengubah tabel menjadi layout kartu di mobile.
        - **Halaman Formulir (Tambah Produk & Tambah Pelanggan):** Menyempurnakan layout formulir agar memenuhi lebar layar di mobile dan memperbarui gaya input untuk tampilan yang lebih modern dan konsisten di seluruh aplikasi.

(Entri baru akan ditambahkan di sini oleh Asisten AI)
*   **Perbaikan `Adjacent JSX elements` di `Checkout2.jsx`:**
    *   Mengatasi error `[plugin:vite:react-babel] Adjacent JSX elements must be wrapped in an enclosing tag` yang terjadi di `resources/js/Pages/Customer/Checkout/Checkout2.jsx`.
    *   **Akar Masalah:** Komponen `Checkout2.jsx` mengembalikan beberapa elemen JSX (`<Head>`, `<SiteHeader>`, dan `<main>`) secara langsung dalam satu pernyataan `return()` tanpa dibungkus dalam satu elemen induk.
    *   **Solusi:** Memperbaiki struktur `return()` dengan membungkus semua elemen JSX yang berdekatan di dalam `JSX Fragment` (`<>...</>`), memastikan bahwa hanya satu elemen induk yang dikembalikan oleh komponen React.
*   **Perbaikan Komponen Halaman Utama Pelanggan:**
    *   Memperbaiki error fatal `Uncaught ReferenceError` pada halaman utama pelanggan (`DashboardCust.jsx`) yang disebabkan oleh banyaknya impor komponen yang hilang.
    *   **Solusi:** Menambahkan semua impor yang diperlukan, termasuk `CustomerLayout`, `Link`, `Head`, `router`, ikon dari `react-icons`, dan `Swal`. Tindakan ini memulihkan fungsionalitas penuh halaman dan memastikan semua komponen dapat dirender dengan benar.
*   **Perbaikan Fungsionalitas Keranjang Belanja (Cart)**
    *   Memperbaiki bug di mana panel keranjang belanja tidak dapat dibuka dari halaman Dashboard Pelanggan (`DashboardCust.jsx`).
    *   Masalah disebabkan oleh `DashboardCust.jsx` yang tidak menggunakan `CustomerLayout` sebagai layout utama, sehingga state untuk membuka dan menutup panel keranjang tidak terhubung.
    *   Solusinya adalah dengan melakukan refaktor pada `DashboardCust.jsx`, membungkus seluruh konten halaman dengan `CustomerLayout`, dan menghapus pemanggilan `SiteHeader` dan `FooterNote` yang redundan. Hal ini memastikan komponen dashboard terintegrasi dengan benar ke dalam arsitektur layout aplikasi.
*   **Perbaikan Alur Checkout dan Keranjang (End-to-End)**
    *   **Fix Error Database:** Menyelesaikan error `SQLSTATE[42S02]: Table 'produks' not found` dengan memperbaiki nama tabel pada aturan validasi di `CartController.php` dari `produks` menjadi `products`.
    *   **Implementasi "Beli Langsung":** Memperbaiki fungsionalitas tombol "Beli Langsung" pada halaman detail produk (`BelanjaDetail.jsx`). Perubahan meliputi:
        *   Mengubah event handler untuk mengirim data via `POST` request.
        *   Menambahkan route `POST /checkout/buy-now` baru di `routes/web.php`.
        *   Membuat method `buyNow` di `CheckoutController.php` untuk menangani logika penambahan item sementara ke sesi dan mengarahkan ke halaman checkout.
    *   **Refaktor Arsitektur Frontend:** Melakukan refaktor pada halaman `BelanjaDetail.jsx` untuk menggunakan `CustomerLayout` sebagai komponen induk, menyelaraskan strukturnya dengan halaman lain dan memastikan konsistensi UI serta state management yang benar.
*   **Penyempurnaan Teks (Copywriting)**
    *   Menghapus teks `(Mode Dummy)!` dari pesan konfirmasi pesanan yang muncul di `CheckoutController.php` untuk memberikan pengalaman pengguna yang lebih bersih dan profesional.
*   **Perbaikan Fungsionalitas Keranjang Belanja (Lanjutan)**
    *   Memperbaiki bug kritis pada halaman belanja utama (`Belanja.jsx`) di mana tombol "Masukkan ke Keranjang" tidak berfungsi. Masalah ini disebabkan oleh pemanggilan nama route yang salah (`cart.add` seharusnya `cart.store`).
    *   Menambahkan notifikasi *pop-up* (SweetAlert) pada halaman belanja utama setelah berhasil menambahkan produk ke keranjang untuk meningkatkan *user feedback* dan konsistensi dengan halaman detail produk.
*   **Koreksi Logika Bisnis (Filter Produk)**
    *   Mengoreksi logika filter produk di `BelanjaController.php`. Filter status produk yang sebelumnya diubah ke `Tersedia` ternyata tidak sesuai dengan data di database. Perubahan dikembalikan ke `Aktif` untuk memastikan semua produk yang seharusnya tampil di halaman belanja dapat dimuat dengan benar.