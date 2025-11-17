# Rencana Eksekusi: Implementasi Logika Pengiriman Dinamis

Dokumen ini merinci langkah-langkah yang akan diambil untuk mengimplementasikan fitur pemilihan metode pengiriman yang dinamis berdasarkan lokasi pelanggan, khususnya antara kota Duri dan luar Duri.

**Tujuan Akhir:** Memberikan pengalaman pengguna yang lebih relevan dan efisien di halaman checkout (`Checkout2.jsx`) dengan menampilkan opsi pengiriman yang sesuai dengan lokasi mereka.

---

## Tahap 1: Modifikasi Backend (`CheckoutController.php`)

*   [x] **Langkah 1.1: Menganalisis `city_name` dari Sesi**
    *   **Status:** Selesai.
    *   **Tindakan:** Logika telah ditambahkan ke dalam method `shipping` untuk membaca `city_name` dari `session('checkout_address')`.

*   [x] **Langkah 1.2: Membuat dan Mengirimkan *Flag* `isKotaDuri`**
    *   **Status:** Selesai.
    *   **Tindakan:** Sebuah variabel boolean `$isKotaDuri` dibuat berdasarkan hasil pengecekan `city_name`. Variabel ini berhasil dikirimkan sebagai *prop* ke komponen `Checkout2.jsx` melalui Inertia.

---

## Tahap 2: Refaktor Frontend (`Checkout2.jsx`)

*   [ ] **Langkah 2.1: Menambahkan *State Management* untuk Metode Pengiriman**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Membuat *state* baru di dalam komponen `Checkout2.jsx` (misalnya, `deliveryMethod`) untuk melacak pilihan pengguna antara "Ambil Sendiri" dan "Pakai Ekspedisi".

*   [ ] **Langkah 2.2: Implementasi Tampilan Kondisional untuk Pelanggan Duri**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Menggunakan *prop* `isKotaDuri` untuk secara kondisional merender dua `radio button`. Tampilan daftar kurir akan bergantung pada *state* `deliveryMethod`.

*   [ ] **Langkah 2.3: Membuat Komponen Pilihan Waktu untuk "Ambil Sendiri"**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Membuat sebuah input `time` yang hanya akan muncul dan aktif jika `deliveryMethod` adalah "Ambil Sendiri". Waktu paling awal yang dapat dipilih harus divalidasi (misalnya, 1 jam dari waktu sekarang).

*   [ ] **Langkah 2.4: Implementasi Tampilan *Dropdown* untuk Pelanggan Luar Duri**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Jika `isKotaDuri` bernilai `false`, seluruh daftar kurir akan "dibungkus" di dalam sebuah elemen *dropdown* atau *accordion* dengan judul "Pilih Ekspedisi". Daftar ini hanya akan terlihat setelah pengguna mengklik *dropdown* tersebut.

*   [ ] **Langkah 2.5: Menyesuaikan Logika Pengiriman Form (`handleSubmit`)**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Memodifikasi fungsi `handleSubmit` (atau yang setara) untuk mengirimkan data yang berbeda ke backend.
        *   Jika "Ambil Sendiri" dipilih, data pengiriman akan berisi informasi relevan dengan biaya Rp 0.
        *   Jika "Pakai Ekspedisi" dipilih, data akan dikirim seperti biasa.

---

## Tahap 3: Finalisasi

*   [ ] **Langkah 3.1: Pengujian Fungsionalitas End-to-End**
    *   **Status:** Akan Dilakukan.
    *   **Tugas:** Melakukan pengujian untuk kedua skenario (pelanggan Duri dan luar Duri) untuk memastikan logika tampilan, pemilihan, dan pengiriman data berjalan sesuai harapan.

*   [x] **Langkah 3.2: Pembaruan `GEMINI.md`**
    *   **Status:** Selesai.
    *   **Tindakan:** Catatan perubahan untuk fitur ini telah ditambahkan ke dalam `GEMINI.md`.