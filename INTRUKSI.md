# Rencana Eksekusi: Integrasi Midtrans Payment Gateway

Dokumen ini adalah blueprint langkah demi langkah untuk mengintegrasikan Midtrans sebagai payment gateway ke dalam aplikasi CPH_Project. Setiap langkah akan dieksekusi secara berurutan untuk memastikan implementasi yang mulus dan terdokumentasi.

**Tujuan Akhir:** Menggantikan alur checkout saat ini dengan proses pembayaran nyata melalui Midtrans. Pelanggan akan diarahkan ke pop-up pembayaran Midtrans, dan setelah pembayaran berhasil, pesanan akan dibuat di sistem dengan status yang sesuai.

---

## Tahap 1: Persiapan dan Konfigurasi Backend (Laravel)

Pada tahap ini, kita akan menyiapkan sisi server untuk dapat berkomunikasi dengan Midtrans.

*   [ ] **Langkah 1.1: Instal Library Midtrans PHP**
    *   **Tugas:** Menambahkan library resmi Midtrans ke dalam proyek menggunakan Composer.
    *   **Perintah:** `composer require midtrans/midtrans-php`

*   [ ] **Langkah 1.2: Konfigurasi Kunci API Midtrans**
    *   **Tugas:** Menyimpan kunci API Midtrans (Server Key & Client Key) di file `.env` dan membuat file konfigurasi khusus untuk Midtrans.
    *   **Aksi:**
        1.  Dapatkan **Client Key** dan **Server Key** dari dashboard Sandbox Midtrans Anda.
        2.  Tambahkan variabel berikut ke dalam file `.env`:
            ```env
            MIDTRANS_MERCHANT_ID=GANTI_DENGAN_MERCHANT_ID_ANDA
            MIDTRANS_CLIENT_KEY=GANTI_DENGAN_CLIENT_KEY_ANDA
            MIDTRANS_SERVER_KEY=GANTI_DENGAN_SERVER_KEY_ANDA
            MIDTRANS_IS_PRODUCTION=false
            ```
        3.  Buat file konfigurasi baru di `config/midtrans.php` untuk memuat variabel-variabel ini.

*   [ ] **Langkah 1.3: Buat Rute (Routes) untuk Pembayaran**
    *   **Tugas:** Mendefinisikan dua rute baru di `routes/web.php`: satu untuk memulai proses pembayaran dan satu lagi untuk menerima notifikasi (webhook) dari Midtrans.
    *   **Aksi:**
        1.  Tambahkan rute `POST` untuk `checkout.process` yang akan memanggil metode di `CheckoutController` untuk mendapatkan Snap Token.
        2.  Tambahkan rute `POST` untuk `midtrans.notification` yang akan menangani pembaruan status pesanan dari Midtrans.

*   [ ] **Langkah 1.4: Modifikasi `CheckoutController` untuk Membuat Transaksi**
    *   **Tugas:** Mengubah `CheckoutController` untuk menangani logika pembuatan transaksi Midtrans.
    *   **Aksi:**
        1.  Buat metode baru `processPayment`.
        2.  Di dalam metode ini:
            *   Ambil data dari sesi (keranjang, alamat, pengiriman).
            *   Buat pesanan baru di tabel `pesanan` dengan status awal "pending" atau "unpaid".
            *   Siapkan parameter transaksi untuk Midtrans (detail item, detail pelanggan, total pembayaran).
            *   Gunakan library Midtrans untuk menghasilkan `snap_token`.
            *   Kirim `snap_token` kembali ke frontend sebagai respons.

*   [ ] **Langkah 1.5: Buat Controller untuk Menangani Notifikasi Midtrans**
    *   **Tugas:** Membuat logika untuk menerima dan memvalidasi notifikasi dari Midtrans.
    *   **Aksi:**
        1.  Buat `MidtransController` baru atau tambahkan metode di `CheckoutController`.
        2.  Metode ini akan:
            *   Menerima data `POST` dari Midtrans.
            *   Memvalidasi *signature key* untuk memastikan notifikasi tersebut asli.
            *   Mengecek status transaksi (`settlement`, `pending`, `expire`, `cancel`).
            *   Memperbarui status pesanan di database berdasarkan notifikasi yang diterima.

---

## Tahap 2: Implementasi Frontend (React)

Sekarang kita akan menghubungkan antarmuka pengguna dengan backend yang sudah disiapkan.

*   [ ] **Langkah 2.1: Perbarui Halaman Checkout (`Checkout3.jsx`)**
    *   **Tugas:** Mengubah fungsi `handleBayar` untuk berkomunikasi dengan backend dan memicu pop-up Midtrans Snap.
    *   **Aksi:**
        1.  Pastikan `useEffect` untuk memuat `snap.js` sudah benar dan menggunakan Client Key dari `import.meta.env`.
        2.  Ubah `handleBayar` untuk mengirim request `POST` ke rute `checkout.process` yang baru dibuat.
        3.  Setelah menerima `snap_token` dari backend, panggil `window.snap.pay(snap_token, { ... })`.
        4.  Implementasikan callback `onSuccess`, `onPending`, `onError`, dan `onClose` untuk memberikan umpan balik kepada pengguna dan mengarahkannya ke halaman yang sesuai.

*   [ ] **Langkah 2.2: Buat Halaman Konfirmasi Pesanan**
    *   **Tugas:** Membuat halaman baru yang akan ditampilkan setelah pelanggan menyelesaikan (atau menunggu) pembayaran.
    *   **Aksi:**
        1.  Buat komponen React baru, misalnya `resources/js/Pages/Customer/Pesanan/Konfirmasi.jsx`.
        2.  Halaman ini akan menampilkan ringkasan pesanan, status pembayaran (misalnya, "Pembayaran Berhasil" atau "Menunggu Pembayaran"), dan instruksi selanjutnya.
        3.  Arahkan pengguna ke halaman ini dari callback `onSuccess` dan `onPending` di `Checkout3.jsx`.

---

## Tahap 3: Finalisasi dan Pengujian

*   [ ] **Langkah 3.1: Penyesuaian Skema Database**
    *   **Tugas:** Memastikan tabel `pesanan` memiliki kolom yang diperlukan untuk menyimpan status pembayaran dan ID transaksi dari Midtrans.
    *   **Aksi:**
        1.  Periksa migrasi tabel `pesanan`. Pastikan ada kolom `status` (string) dan `midtrans_order_id` (string, opsional).
        2.  Jika belum ada, buat migrasi baru untuk menambahkannya.

*   [ ] **Langkah 3.2: Pengujian End-to-End**
    *   **Tugas:** Menguji keseluruhan alur pembayaran menggunakan mode Sandbox Midtrans.
    *   **Aksi:**
        1.  Lakukan proses checkout dari awal.
        2.  Gunakan nomor kartu uji atau metode pembayaran sandbox lainnya yang disediakan Midtrans.
        3.  Simulasikan pembayaran yang berhasil, tertunda, dan gagal.
        4.  Verifikasi bahwa status pesanan di database Anda diperbarui dengan benar melalui webhook.
        5.  Pastikan pengguna diarahkan ke halaman konfirmasi yang benar setelah setiap skenario.

---
*   [ ] **Langkah 4: Pembaruan `GEMINI.md`**
    *   **Tugas:** Mencatat semua perubahan yang telah dilakukan ke dalam `GEMINI.md`.
    *   **Aksi:**
        1.  Buat ringkasan fitur baru yang telah diimplementasikan.
        2.  Jelaskan perubahan pada model, view, dan controller.
        3.  Tambahkan entri changelog baru di bawah tanggal hari ini.
