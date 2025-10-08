### **Rencana Eksekusi: Fitur Ulasan dan Feedback Pelanggan**

Dokumen ini merinci langkah-langkah teknis yang akan diambil untuk mengimplementasikan sistem ulasan dan feedback oleh pelanggan, serta mengintegrasikannya dengan dasbor admin.

**Tujuan Utama:**
1.  Memungkinkan pelanggan mengunggah foto profil.
2.  Menambahkan tombol "Beri Ulasan" pada pesanan yang telah selesai.
3.  Membuat halaman formulir untuk pengisian ulasan (bintang, teks, foto).
4.  Membuat halaman dasbor pelanggan untuk menampilkan semua ulasan yang masuk.
5.  Memperbarui halaman ulasan di dasbor admin untuk menampilkan data ulasan yang baru, termasuk foto.

---

### **Fase 1: Persiapan Backend dan Database**

Langkah pertama adalah memastikan struktur database dan logika backend siap untuk mendukung fitur-fitur baru.

*   **Langkah 1.1: Migrasi Database untuk Foto Profil Pelanggan**
    *   Saya akan membuat file migrasi baru menggunakan `php artisan make:migration`.
    *   Migrasi ini akan menambahkan kolom `foto_profil` (tipe `string`, nullable) ke tabel `pelanggans`.
    *   Setelah itu, saya akan menjalankan `php artisan migrate`.

*   **Langkah 1.2: Migrasi Database untuk Foto Ulasan**
    *   Saya akan membuat file migrasi baru.
    *   Migrasi ini akan menambahkan kolom `foto_ulasan` (tipe `string`, nullable) ke tabel `ulasans`.
    *   Ini akan digunakan untuk menyimpan path gambar yang diunggah oleh pelanggan saat memberikan ulasan.

*   **Langkah 1.3: Perbarui Model Eloquent**
    *   Saya akan memperbarui file model `app/Models/Pelanggan.php` dengan menambahkan `foto_profil` ke dalam properti `$fillable`.
    *   Saya juga akan memperbarui `app/Models/Ulasan.php` dengan menambahkan `foto_ulasan` ke dalam properti `$fillable`.

*   **Langkah 1.4: Buat Route (Rute) Baru**
    *   Saya akan menambahkan rute baru di `routes/web.php` untuk menangani logika ulasan dari sisi pelanggan.
        *   `GET /customer/ulasan`: Menampilkan halaman daftar ulasan pelanggan.
        *   `GET /customer/pesanan/{id}/ulasan/create`: Menampilkan formulir untuk membuat ulasan baru.
        *   `POST /customer/ulasan`: Menyimpan ulasan baru ke database.
        *   `POST /customer/profile/update-photo`: Rute khusus untuk memperbarui foto profil pelanggan.

*   **Langkah 1.5: Kembangkan Logika Controller**
    *   **`ProfileController` (Pelanggan):** Saya akan membuat atau memodifikasi metode untuk menangani unggahan foto profil. Ini termasuk validasi file (gambar, ukuran maks) dan penyimpanan file di `storage/app/public`.
    *   **`UlasanController` (Pelanggan):** Saya akan membuat controller baru atau metode baru untuk:
        *   `create`: Menampilkan halaman formulir ulasan, dengan data pesanan terkait.
        *   `store`: Memvalidasi input (bintang, ulasan, foto), menyimpan file foto ulasan, dan membuat entri baru di tabel `ulasans`.
    *   **`PesananController` (Pelanggan):** Saya akan memodifikasi metode yang menampilkan riwayat pesanan untuk menambahkan flag atau status yang menandakan apakah sebuah pesanan sudah "selesai" dan berhak untuk diulas.

---

### **Fase 2: Implementasi Frontend (Sisi Pelanggan)**

Setelah backend siap, saya akan membangun antarmuka pengguna untuk pelanggan.

*   **Langkah 2.1: Halaman Profil Pelanggan (Update Foto)**
    *   Saya akan memodifikasi komponen React di `resources/js/Pages/Customer/Profile/Edit.jsx` (atau yang setara).
    *   Saya akan menambahkan input file untuk memilih gambar, area pratinjau gambar, dan tombol untuk menyimpan. Logika akan menggunakan hook `useForm` dari Inertia.js untuk menangani unggahan.

*   **Langkah 2.2: Halaman Riwayat Pesanan**
    *   Saya akan menemukan halaman riwayat pesanan pelanggan (kemungkinan di `resources/js/Pages/Customer/Pesanan/Index.jsx`).
    *   Saya akan menambahkan tombol `<Link>` (dari Inertia) "Beri Ulasan" secara kondisional. Tombol ini hanya akan muncul jika pesanan memiliki status "selesai".

*   **Langkah 2.3: Halaman Formulir Ulasan Baru**
    *   Saya akan membuat komponen React baru: `resources/js/Pages/Customer/Ulasan/Create.jsx`.
    *   Halaman ini akan berisi formulir yang didesain dengan baik, mencakup:
        *   Komponen Peringkat Bintang (1-5 bintang).
        *   `Textarea` untuk isi feedback.
        *   Input file untuk mengunggah foto ulasan.
        *   Tombol "Kirim Ulasan".
    *   Formulir ini akan menggunakan `useForm` untuk pengiriman data, termasuk file.

*   **Langkah 2.4: Halaman Dasbor Ulasan Pelanggan**
    *   Saya akan membuat komponen React baru: `resources/js/Pages/Customer/Ulasan/Index.jsx`.
    *   Halaman ini akan menampilkan daftar semua ulasan yang telah diberikan oleh pelanggan lain, dengan desain modern seperti e-commerce.
    *   Setiap item ulasan akan menampilkan: Foto profil pemberi ulasan, nama, tanggal, peringkat bintang, teks ulasan, dan foto ulasan (jika ada).

---

### **Fase 3: Integrasi dan Pembaruan Dasbor Admin**

Terakhir, saya akan memastikan semua ulasan baru dari pelanggan ditampilkan dengan benar di dasbor admin.

*   **Langkah 3.1: Analisis Halaman Ulasan Admin yang Ada**
    *   Saya akan mempelajari kode di `app/Http/Controllers/UlasanController.php` (metode `index` untuk admin) dan komponen React terkait di `resources/js/Pages/Ulasan/Index.jsx`.

*   **Langkah 3.2: Perbarui Controller Admin**
    *   Saya akan memodifikasi query Eloquent di `UlasanController.php` untuk mengambil data tambahan melalui relasi, seperti nama pelanggan, foto profil pelanggan, dan foto ulasan.

*   **Langkah 3.3: Modifikasi Tampilan Ulasan Admin**
    *   Saya akan memperbarui komponen React `resources/js/Pages/Ulasan/Index.jsx`.
    *   Saya akan menambahkan kolom atau bagian baru pada tabel atau daftar ulasan untuk menampilkan:
        *   Foto profil pelanggan.
        *   Nama pelanggan.
        *   Foto ulasan (sebagai thumbnail yang bisa diklik untuk diperbesar).

---
