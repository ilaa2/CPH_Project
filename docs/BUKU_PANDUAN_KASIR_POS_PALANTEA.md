# 📖 BUKU PANDUAN LENGKAP OPERASIONAL SISTEM KASIR (POS) & KANTIN
## Central Palantea Hidroponik — Cafe • Space • Hydroponic
*Edisi Panduan Terlengkap — Standar Operasional Prosedur (SOP) Kasir, Dapur, & Admin Kantin*

---

## DAFTAR ISI LENGKAP
1. [BAB 1: Pendahuluan & Gambaran Umum Sistem](#bab-1-pendahuluan--gambaran-umum-sistem)
2. [BAB 2: Panduan Input & Kelola Kategori Menu Makanan](#bab-2-panduan-input--kelola-kategori-menu-makanan)
3. [BAB 3: Panduan Input & Kelola Menu Makanan / Minuman (Foto, Harga, Status)](#bab-3-panduan-input--kelola-menu-makanan--minuman-foto-harga-status)
4. [BAB 4: Manajemen 30 Nomor Antrian Meja Kantin](#bab-4-manajemen-30-nomor-antrian-meja-kantin)
5. [BAB 5: Alur Transaksi Pesanan Baru di Kasir (Langkah Demi Langkah)](#bab-5-alur-transaksi-pesanan-baru-di-kasir-langkah-demi-langkah)
6. [BAB 6: Alur Pesanan Tambahan di Meja yang Sama (Add-On Order)](#bab-6-alur-pesanan-tambahan-di-meja-yang-sama-add-on-order)
7. [BAB 7: Konsep Struk Cerdas: Struk Customer & Tiket Dapur](#bab-7-konsep-struk-cerdas-struk-customer--tiket-dapur)
8. [BAB 8: Monitor Pesanan Kasir (Pusat Kendali Pengganti Layar Dapur)](#bab-8-monitor-pesanan-kasir-pusat-kendali-pengganti-layar-dapur)
9. [BAB 9: Laporan Penjualan, Rekap Cash vs QRIS, & Koreksi Salah Bayar](#bab-9-laporan-penjualan-rekap-cash-vs-qris--koreksi-salah-bayar)
10. [BAB 10: Prosedur Pelunasan Pesanan Belum Bayar (UNPAID)](#bab-10-prosedur-pelunasan-pesanan-belum-bayar-unpaid)
11. [BAB 11: Prosedur Pembatalan Menu & Pembatalan Pesanan Meja](#bab-11-prosedur-pembatalan-menu--pembatalan-pesanan-meja)
12. [BAB 12: Notifikasi Suara Kasir & Pengaturan Printer Thermal (58mm / 80mm)](#bab-12-notifikasi-suara-kasir--pengaturan-printer-thermal-58mm--80mm)
13. [BAB 13: Standar Operasional Harian (SOP Buka & Tutup Kasir)](#bab-13-standar-operasional-harian-sop-buka--tutup-kasir)
14. [BAB 14: Troubleshooting & Tanya Jawab (FAQ)](#bab-14-troubleshooting--tanya-jawab-faq)

---

## BAB 1: PENDAHULUAN & GAMBARAN UMUM SISTEM

Sistem Point of Sale (POS) Kantin Central Palantea dirancang khusus untuk memfasilitasi seluruh alur transaksi kafe dan kantin hidroponik, mulai dari penyambutan tamu di meja kasir, pencetakan tiket pesanan untuk juru masak dapur, pengantaran menu ke nomor meja, hingga pelaporan keuangan kasir yang presisi antara uang tunai (*Cash*) dan non-tunai (*QRIS*).

### 1. Struktur Akun & Hak Akses
- **Kasir (Role: Kasir / Dapur)**:
  - Mengakses halaman POS Kasir (`/order`) untuk melayani pembelian.
  - Mengakses Monitor Pesanan (`/pos/monitor`) untuk memantau masakan dan mengantarkan menu.
  - Mengakses Laporan Penjualan Kantin (`/admin/pos-reports`) untuk melihat rekap harian, mencetak ulang struk, dan mengoreksi transaksi salah bayar.
- **Admin (Role: Admin)**:
  - Memiliki seluruh hak akses kasir.
  - Mengakses Manajemen Menu Makanan (`/admin/pos-foods`) untuk menambah menu baru, mengedit harga, dan mengganti foto hidangan.
  - Mengakses Manajemen Meja Antrian (`/admin/pos-tables`) untuk mereset status 30 meja antrian.

### 2. URL Akses Cepat Sistem
| Nama Modul | Alamat URL | Fungsi Utama |
| :--- | :--- | :--- |
| **POS Kasir Utama** | `/order` | Input pesanan baru, tambah menu meja aktif, pembayaran. |
| **Monitor Pesanan** | `/pos/monitor` | Checklist makanan diantar, tagih kasir, selesaikan meja. |
| **Laporan Penjualan** | `/admin/pos-reports` | Omzet harian, grafik tren, rekap Cash vs QRIS, ekspor PDF/Excel. |
| **Kelola Menu Makanan** | `/admin/pos-foods` | Tambah hidangan, ubah harga, upload foto, status aktif/habis. |
| **Kelola 30 Meja Antrian** | `/admin/pos-tables` | Pantau status meja fisik, reset meja ke hijau. |

---

## BAB 2: PANDUAN INPUT & KELOLA KATEGORI MENU MAKANAN

Kategori digunakan untuk mengelompokkan hidangan di layar kasir agar menu tertata rapi dan mudah dicari saat jam ramai.

### 1. Cara Menuju Menu Kategori:
1. Masuk ke akun Admin Central Palantea.
2. Di sidebar sebelah kiri, klik menu **Kelola Menu Makanan** (atau buka URL `/admin/pos-foods`).

### 2. Langkah-langkah Menambah Kategori Baru:
1. Di pojok kanan atas halaman, klik tombol hijau **`[+ Tambah Kategori]`**.
2. Jendela pop-up modal bertuliskan **"Tambah Kategori Menu Baru"** akan muncul.
3. Isi kolom-kolom berikut:
   - **Nama Kategori** *(Wajib diisi)*:
     Ketikkan nama kelompok menu yang jelas dan singkat.
     *Contoh rekomendasi nama kategori*:
     - `Makanan Utama` (untuk aneka nasi ramas, ayam barendo, mienas)
     - `Olahan Mie` (untuk indomie rebus, indomie goreng, pop mie)
     - `Snack & Camilan` (untuk pempek, french fries, nugget, pisang kipas)
     - `Minuman Kopi` (untuk kopi hitam, cappuccino, kopi ginseng, kopi susu)
     - `Minuman Non-Kopi` (untuk teh es, jus kale, matcha, milo, wedang jahe)
     - `Menu Tambahan / Ekstra` (untuk nasi putih, telur ceplok, telur dadar)
   - **Deskripsi Kategori** *(Opsional)*:
     Ketikkan penjelasan singkat kategori tersebut (contoh: *"Aneka hidangan nasi dan lauk khas Palantea"*).
4. Klik tombol **`[Simpan Kategori]`**.
5. Kategori baru langsung muncul di dropdown input menu dan menjadi tab filter di layar POS Kasir.

---

## BAB 3: PANDUAN INPUT & KELOLA MENU MAKANAN / MINUMAN (FOTO, HARGA, STATUS)

Semua hidangan yang dijual di kantin wajib terdaftar di database agar kasir dapat memilihnya dengan 1 klik.

### 1. Cara Menambahkan Menu Makanan / Minuman Baru:
1. Buka menu **Kelola Menu Makanan** (`/admin/pos-foods`).
2. Klik tombol hijau besar **`[+ Tambah Menu]`** di pojok kanan atas.
3. Formulir modal **"Tambah Menu Makanan Baru"** akan terbuka. Lengkapi data berikut:
   - **Kategori Menu**: Pilih salah satu kategori yang cocok dari dropdown (misal: *Makanan Utama*).
   - **Nama Menu**: Ketikkan nama hidangan secara lengkap dan menarik (contoh: `Nasi Ayam Barendo Palantea`).
   - **Harga Satuan (Rp)**: Masukkan harga jual dalam angka tanpa titik atau koma (contoh: ketik `25000` untuk Rp 25.000).
   - **Deskripsi Menu**: Tuliskan porsi atau bahan utama (contoh: *"Nasi putih hangat dengan ayam goreng kremes telur barendo khas Minang dan sambal"*).
   - **Status Menu**:
     - Pilih **`Aktif`**: Menu akan langsung tampil di katalog kasir dan bisa dipesan pembeli.
     - Pilih **`Tidak Aktif`**: Menu disembunyikan sementara dari layar kasir (cocok saat stok habis).
   - **Foto Produk / Gambar Hidangan**:
     - Klik tombol **`[Choose File]`** atau seret foto ke kotak unggahan.
     - **Format yang didukung**: JPG, JPEG, PNG, WEBP (Maksimal ukuran file: 2 MB).
     - **Tips Foto Bagus**: Gunakan foto hidangan berbingkai resmi Palantea dengan rasio kotak (1:1) dan pencahayaan terang agar pelanggan tergiur melihatnya di layar POS.
4. Klik tombol hijau **`[Simpan Menu Makanan]`**.
5. Sistem akan menampilkan notifikasi sukses dan menu baru seketika aktif di kasir.

### 2. Cara Mengubah (Edit) Harga, Foto, atau Nama Menu:
Jika ada perubahan harga jual atau pergantian foto hidangan:
1. Buka halaman **Kelola Menu Makanan** (`/admin/pos-foods`).
2. Cari menu yang ingin diubah melalui kotak pencarian atau filter kategori.
3. Pada baris menu tersebut, klik tombol biru **`[✏️ Edit]`**.
4. Ubah data yang diinginkan:
   - Ingin menaikkan harga: Hapus angka lama di kolom harga, ketikkan angka harga baru (misal dari `25000` menjadi `28000`).
   - Ingin mengganti foto: Pilih file foto baru di kolom gambar (foto lama akan otomatis digantikan).
   - Jika foto tidak ingin diubah: Biarkan kolom gambar kosong.
5. Klik **`[Perbarui Menu]`**.

### 3. Cara Menonaktifkan Menu yang Sedang Habis (Sold Out):
Jangan menghapus menu jika bahan bakunya hanya habis sementara!
1. Klik tombol **`[✏️ Edit]`** pada menu yang habis.
2. Ubah kolom **Status** dari `Aktif` menjadi **`Tidak Aktif`**.
3. Klik **`[Perbarui Menu]`**.
4. Menu tersebut otomatis hilang dari katalog kasir sehingga kasir tidak akan salah memesankan hidangan yang kosong. Saat bahan sudah dibeli lagi, cukup edit kembali statusnya menjadi `Aktif`.

### 4. Cara Menghapus Menu yang Sudah Tidak Dijual Lagi:
1. Pada tabel menu makanan, klik tombol merah **`[🗑️ Hapus]`**.
2. Konfirmasi penghapusan dengan mengklik **`[Ya, Hapus]`**.
3. Menu akan dihapus secara aman (*soft delete*) sehingga riwayat laporan penjualan terdahulu yang pernah memuat menu ini tetap utuh dan tidak rusak.

---

## BAB 4: MANAJEMEN 30 NOMOR ANTRIAN MEJA KANTIN

Central Palantea menyediakan 30 nomor antrian meja fisik berbentuk nomor akrilik (No. 01 sampai No. 30) yang dipegang tamu saat makan di tempat.

### 1. Arti 4 Warna Status Nomor Meja:
| Warna Meja di Sistem | Status Sistem | Arti & Kondisi Nyata di Kantin | Tindakan Petugas Kasir |
| :---: | :---: | :--- | :--- |
| **🟢 Hijau** | `AVAILABLE` | **Tersedia (Kosong)**. Nomor antrian fisik ada di meja kasir dan siap diserahkan ke tamu baru. | Klik nomor hijau ini saat memulai pesanan tamu baru. |
| **🔴 Merah** | `OCCUPIED` | **Terisi / Sedang Dipakai**. Tamu sedang duduk di meja menunggu masakan atau sedang makan. | Klik meja merah ini jika ingin menambah menu pesanan (*add-on*) atau melunasi pembayaran. |
| **🟡 Kuning** | `NEEDS_CLEANING` | **Perlu Dibersihkan / Selesai**. Tamu sudah selesai makan dan sudah melunasi pembayaran, namun piring kotor belum diangkat dari meja. | Setelah pramusaji mengelap meja, kasir mengklik nomor kuning ini lalu menekan tombol **`[🧹 Kosongkan & Jadikan Tersedia]`** agar meja kembali hijau. |
| **⚪ Abu-abu** | `UNAVAILABLE` | **Tidak Tersedia**. Nomor antrian dinonaktifkan sementara (misal nomor akrilik patah/hilang atau meja sedang direparasi). | Dapat diaktifkan kembali menjadi hijau melalui halaman Admin Meja. |

### 2. Cara Mengubah Status Meja Secara Manual (Halaman Admin Meja `/admin/pos-tables`):
1. Buka menu **Kelola Nomor Antrian** (`/admin/pos-tables`).
2. Anda akan melihat 30 kartu nomor antrian.
3. Pada tiap kartu meja, terdapat tombol dropdown status. Anda dapat mengubah statusnya secara bebas menjadi `AVAILABLE`, `OCCUPIED`, `NEEDS_CLEANING`, atau `UNAVAILABLE`.

### 3. Cara Cepat Reset Semua Meja di Pagi Hari (`Reset All`):
Setiap pagi sebelum kantin buka:
1. Buka halaman **Kelola Nomor Antrian** (`/admin/pos-tables`).
2. Klik tombol oranye di kanan atas: **`[🔄 Reset Semua Nomor (Set Available)]`**.
3. Konfirmasi dengan memilih **`[Ya, Reset Semua]`**.
4. Seluruh 30 nomor meja otomatis serentak menjadi **🟢 Hijau (AVAILABLE)** siap menyambut pelanggan hari itu.

---

## BAB 5: ALUR TRANSAKSI PESANAN BARU DI KASIR (LANGKAH DEMI LANGKAH)

Berikut adalah panduan alur transaksi saat ada tamu baru yang datang memesan di kasir:

```
[1. Pilih Meja Hijau] ➡️ [2. Pilih Menu & Qty] ➡️ [3. Pilih Metode Bayar] ➡️ [4. Klik Kirim & Cetak Struk]
```

### Langkah 1: Pilih Nomor Meja Hijau
- Sambut tamu dengan ramah: *"Selamat datang di Central Palantea, mau pesan untuk makan di meja nomor berapa atau takeaway?"*
- Pada grid 30 nomor meja di bagian atas POS Kasir (`/order`), klik salah satu nomor berlatar **🟢 Hijau**, misal **No. 05**.
- Ambil nomor antrian akrilik No. 05 fisik di kasir dan serahkan ke tamu.

### Langkah 2: Masukkan Menu ke Keranjang
- Tanyakan menu yang diinginkan pelanggan.
- Klik foto makanan atau minuman di katalog sebelah kiri. Setiap kali diklik, menu akan masuk ke panel keranjang pesanan di sebelah kanan.
- **Mengatur Kuantitas (Jumlah Porsi)**:
  - Tekan tombol **(+)** untuk menambah porsi.
  - Tekan tombol **(-)** untuk mengurangi porsi.
  - Tekan tombol tempat sampah merah **[🗑️]** untuk menghapus menu dari keranjang jika tamu berubah pikiran.
- **Menulis Catatan Khusus Masakan (Request Tamu)**:
  - Di bawah nama menu pada keranjang, ketikkan catatan khusus dari tamu jika ada (contoh: *"Pedas level 3"*, *"Es sedikit"*, *"Kuah dipisah"*, *"Tanpa daun bawang"*).
  - Catatan ini dijamin akan tercetak jelas di tiket masak dapur.
- **Mengisi Nama Pelanggan (Opsional)**:
  - Pada kolom *Nama Pelanggan*, ketik nama panggilan tamu (contoh: *"Bpk. Rudi"* atau *"Ibu Maya"*).

### Langkah 3: Pilih Metode Pembayaran
Kasir memiliki 4 pilihan cara bayar yang sangat fleksibel:
1. **💵 Tunai (Cash)**:
   - Pilih tab **Cash**.
   - Kolom *Uang Diterima* akan muncul. Ketikkan jumlah uang fisik yang diserahkan pelanggan (misal total tagihan Rp 43.000, pelanggan memberikan uang Rp 50.000, ketik `50000`).
   - Sistem secara otomatis menampilkan uang kembalian: **Kembalian: Rp 7.000**.
2. **📱 QRIS**:
   - Pilih tab **QRIS**.
   - Sistem secara otomatis mengisikan 100% nominal pas sesuai total tagihan pesanan (kasir tidak perlu mengetik manual).
   - Tunjukkan barcode stand QRIS Central Palantea kepada pembeli untuk dipindai melalui aplikasi perbankan atau e-wallet (BCA, Mandiri, BRI, Dana, GoPay, OVO, ShopeePay).
3. **⚡ SPLIT (Kombinasi Tunai + QRIS)**:
   - Digunakan jika pelanggan ingin membayar sebagian tunai dan sisanya transfer QRIS (misal total Rp 100.000, bayar tunai Rp 40.000 dan QRIS Rp 60.000).
   - Masukkan porsi uang tunai di kolom *Cash* dan porsi transfer di kolom *QRIS*.
4. **⚠️ Bayar Nanti (Belum Bayar / UNPAID)**:
   - Digunakan jika pelanggan memesan terlebih dahulu dan berniat melunasi pembayaran saat makanan diantar ke meja atau saat pelanggan selesai makan.
   - Status pesanan akan ditandai **UNPAID**, dan nomor meja akan berkedip kuning/merah dengan badge peringatan agar kasir tidak lupa menagih.

### Langkah 4: Kirim Pesanan ke Dapur & Cetak Struk
- Klik tombol hijau besar: **`[🍳 Kirim Pesanan ke Dapur & Cetak Struk]`**.
- Dialog cetak struk otomatis terbuka:
  - **Lembar 1 (Struk Customer)**: Diberikan ke pelanggan sebagai tanda bukti pembelian.
  - **Lembar 2 (Tiket Dapur)**: Diberikan ke juru masak dapur untuk langsung dimasak.
- Meja No. 05 di layar seketika berganti warna menjadi **🔴 Merah (OCCUPIED)**.

---

## BAB 6: ALUR PESANAN TAMBAHAN DI MEJA YANG SAMA (ADD-ON ORDER)

Seringkali tamu yang sudah duduk ingin memesan menu tambahan (contoh: tambah 2 gelas teh es, 1 porsi kentang goreng, atau nambah nasi putih). **Kasir TIDAK PERLU membuat nomor antrian baru!**

### Langkah Demi Langkah Tambah Menu Meja:
1. **Klik Nomor Meja Tamu**:
   - Klik nomor meja yang sedang aktif **🔴 Merah (OCCUPIED)** di grid atas (misal Meja No. 05).
   - Panel sebelah kanan akan menampilkan seluruh menu yang sebelumnya sudah dipesan oleh meja tersebut.
2. **Aktifkan Mode Tambah Menu**:
   - Tekan tombol biru **`[+ Tambah Menu]`** di atas daftar item.
   - Kotak berwarna biru bertuliskan **Keranjang Menu Tambahan** akan muncul.
3. **Pilih Menu Tambahan di Katalog**:
   - Klik hidangan tambahan yang diinginkan tamu di katalog kiri.
   - Menu akan masuk ke dalam kotak biru menu tambahan. Sesuaikan jumlah porsi (+ / -).
4. **Pilih Opsi Pembayaran Menu Tambahan**:
   - **`[⚡ Bayar Nanti]` (Rekomendasi)**:
     Nominal menu tambahan akan otomatis digabungkan (*diakumulasikan*) ke dalam total tagihan meja. Pelanggan akan melunasi seluruh tagihan sekaligus saat selesai makan.
   - **`[💵 Tunai]` / `[📱 QRIS]`**:
     Dipilih jika pelanggan ingin langsung membayar lunas menu tambahannya saat itu juga di kasir.
5. **Kirim Menu Tambahan ke Dapur**:
   - Klik tombol **`[🍳 Kirim Menu Tambahan ke Dapur]`**.
   - Sistem akan memunculkan dialog cetak tiket dapur khusus menu tambahan.

---

## BAB 7: KONSEP STRUK CERDAS: STRUK CUSTOMER & TIKET DAPUR

Sistem Palantea membedakan pencetakan antara kebutuhan Dapur dan Pelanggan agar operasional berjalan tanpa kekeliruan:

### 1. Tiket Dapur Khusus Pesanan Tambahan (Kitchen Add-On Ticket)
- **Masalah yang Kerap Terjadi di Restoran**: Koki dapur bingung saat melihat struk pesanan tambahan karena mengira seluruh hidangan dari awal harus dimasak ulang.
- **Solusi Cerdas Palantea**:
  Tiket dapur untuk pesanan tambahan **HANYA mencetak menu yang baru saja ditambahkan**. Dilengkapi header peringatan mencolok:
  ```text
  ========================================
     --- TICKET DAPUR (TAMBAHAN) ---
    ★ HANYA MASAK MENU TAMBAHAN INI ★
  ========================================
  NO. MEJA: NO. 05
  PELANGGAN: Bpk. Rudi
  WAKTU PESAN: 15/10/2026, 13.45
  ----------------------------------------
  DAFTAR MENU (MASAK):
  2X  TEH ES
      * CATATAN: MANIS SEDANG
  1X  FRENCH FRIES
  ========================================
  *** SEGERA ANTAR SAAT MATANG ***
  ```
  Dengan konsep ini, koki dapur **100% dijamin tidak akan memasak ulang** hidangan pertama yang sudah disajikan!

### 2. Struk Pelanggan Lengkap (Customer Receipt)
- Struk customer mencantumkan seluruh pesanan secara transparan dan dikelompokkan berdasarkan waktu pemesanan (*Batch*):
  ```text
  CENTRAL PALANTEA HIDROPONIK
  Jl. Melayu, Babussalam, Mandau
  ----------------------------------------
  NO. MEJA: NO. 05 (Order #CP-POS-20261015-001)
  PELANGGAN: Bpk. Rudi
  ----------------------------------------
  MENU PESANAN                    SUBTOTAL
  ----------------------------------------
  ▶ PESANAN AWAL               Rp 53.000
    1x Nasi Ayam Barendo       Rp 25.000
    1x Jus Kale                Rp 18.000
    1x Telur Dadar             Rp 10.000
  ----------------------------------------
  ▶ PESANAN TAMBAHAN #1        Rp 30.000
    2x Teh Es                  Rp 12.000
    1x French Fries            Rp 18.000
  ----------------------------------------
  Subtotal:                    Rp 83.000
  TOTAL:                       Rp 83.000
  Metode Pembayaran:           QRIS
  Bayar QRIS:                  Rp 83.000
  ----------------------------------------
  TERIMA KASIH ATAS KUNJUNGAN ANDA!
  ```
  Tamu dan kasir mendapatkan kejelasan mutlak tanpa ada menu atau hitungan yang terlewat.

---

## BAB 8: MONITOR PESANAN KASIR (PUSAT KENDALI PENGGANTI LAYAR DAPUR)

Halaman **Monitor Pesanan** (`/pos/monitor` atau klik tombol biru `[📺 Monitor Pesanan]` di header) adalah layar pantau operasional kasir untuk memastikan seluruh pesanan dimasak, diantar, dan dibayar tepat waktu.

### 1. Tiga Kartu KPI di Bagian Atas Monitor:
- **🍳 Sedang Berjalan**: Jumlah pesanan meja yang makanannya masih dalam proses memasak atau belum lengkap diantar.
- **⚠️ Belum Lunas (UNPAID)**: Jumlah meja yang belum membayar tagihan dan wajib ditagih sebelum pelanggan pulang.
- **✅ Selesai Hari Ini**: Jumlah pesanan yang telah lunas dan tamunya sudah selesai makan hari ini.

### 2. Fitur Checklist Pengantaran Menu (`[🍽️ Antar]` ➡️ `[✅ Diantar]`):
- Setiap hidangan pada kartu pesanan memiliki tombol pengantaran.
- Saat juru masak meletakkan piring di meja saji dan membawanya ke meja tamu, kasir/pramusaji mengklik tombol **`[🍽️ Antar]`**.
- Tombol langsung berubah warna menjadi hijau **`[✅ Diantar]`**.
- Progress bar kartu akan terisi (misal: *3 dari 4 menu sudah diantar / 75%*). Kasir dapat langsung mengetahui jika ada tamu yang hidangannya masih belum diantar.

### 3. Fitur Tagih Kasir Langsung (`[💳 Tagih & Bayar Kasir]`):
- Jika pesanan berstatus **UNPAID**, kartu pesanan memiliki tombol oranye **`[💳 Tagih & Bayar Kasir]`**.
- Kasir cukup mengklik tombol tersebut untuk membuka modal pembayaran kilat (Cash, QRIS, atau Split), memasukkan uang, dan mencetak struk lunas tanpa perlu membuka halaman kasir POS utama.

### 4. Fitur Menyelesaikan & Mengosongkan Meja (`[✅ Tandai Selesai & Meja Kosong]`):
- Ketika tamu telah selesai bersantap dan berdiri meninggalkan meja kantin:
- Tekan tombol hijau **`[✅ Tandai Selesai & Meja Kosong]`**.
- Pesanan dinyatakan rampung, dan nomor meja di kasir seketika otomatis kembali **🟢 Hijau (AVAILABLE)** siap diserahkan ke pelanggan baru berikutnya.

---

## BAB 9: LAPORAN PENJUALAN, REKAP CASH VS QRIS, & KOREKSI SALAH BAYAR

Halaman **Laporan Penjualan Kantin** (`/admin/pos-reports`) menyajikan analitik omzet dan sarana audit keuangan kasir secara transparan.

### 1. Quick Filter Waktu & Rentang Tanggal Khusus:
- Tombol Preset Cepat: Klik tombol **`[Hari Ini]`**, **`[Minggu Ini]`**, **`[Bulan Ini]`**, atau **`[Tahun Ini]`**.
- Custom Rentang Tanggal: Masukkan tanggal mulai (*start_date*) dan tanggal akhir (*end_date*) lalu klik **`[🔍 Terapkan]`**.

### 2. 5 Kartu Ringkasan Indikator Keuangan (KPI):
1. 🟢 **Total Penjualan**: Akumulasi seluruh omzet kotor pesanan yang lunas (`PAID`).
2. 💵 **Total Kas Tunai (Cash)**: Akumulasi penerimaan uang fisik di laci kasir (wajib cocok saat hitung fisik uang di kasir).
3. 📱 **Total Non-Tunai (QRIS)**: Akumulasi mutasi uang yang masuk ke rekening QRIS Palantea.
4. 🔵 **Total Transaksi**: Jumlah seluruh transaksi penjualan yang terjadi.
5. 🟣 **Menu Terlaris**: Hidangan dengan porsi penjualan terbanyak beserta kontribusi omzetnya.

### 3. Banner Visual Arus Kas Kasir:
Grafik bilah (*progress bar*) yang memperlihatkan persentase perbandingan pendapatan uang tunai (*Cash*) dan uang transfer non-tunai (*QRIS*).

### 4. Cara Mengoreksi Transaksi Kasir Salah Tekan (Cash ➡️ QRIS / Sebaliknya):
> **Kasus Nyata**: Kasir tidak sengaja menekan pilihan pembayaran **Cash**, padahal pelanggan sebenarnya membayar lewat transfer **QRIS**. Jika dibiarkan, pembukuan uang fisik kasir akan tekor (selisih) saat dihitung sore hari.

**Langkah Memperbaiki Transaksi yang Salah**:
1. Buka halaman **Laporan Penjualan** (`/admin/pos-reports`).
2. Di tabel ringkasan transaksi, cari transaksi yang ingin diperbaiki.
3. **Klik Badge Metode Bayar** pada transaksi tersebut (atau klik ikon pensil kuning **`[✏️ Edit]`**).
4. Pop-up **"Ubah Metode Bayar & Koreksi Kasir"** akan terbuka:
   - Klik pilihan metode pembayaran yang benar: **`[📱 QRIS]`** atau **`[💵 Cash]`** atau **`[⚡ SPLIT]`**.
   - Jika dipilih QRIS, sistem otomatis memindahkan 100% total tagihan ke pos QRIS dan mengenolkan uang tunai.
   - Anda juga dapat mengoreksi **Nama Pelanggan** atau **Nomor Meja** jika sebelumnya salah catat.
   - Masukkan alasan koreksi pada kolom catatan (contoh: *"Kasir salah tekan Cash, sebenarnya customer bayar QRIS"*).
5. Klik **`[💾 Simpan Perubahan]`**.
6. **Hasil Seketika**: Laporan Total Kas Tunai berkurang sesuai nilai transaksi dan Total QRIS bertambah secara otomatis! Pembukuan kasir kembali seimbang 100%!

### 5. Ekspor Laporan Multi-Format (PDF, Excel, CSV):
- Pada kartu katalog laporan penjualan atau menu terlaris, klik dropdown **`[Ekspor ▼]`**:
  - **PDF Resmi**: Mengunduh berkas PDF format A4 Landscape berlogo kop resmi Central Palantea, tabel transaksi rapi, dan tanda tangan pembukuan.
  - **Excel (.xlsx)**: Mengunduh lembar kerja Microsoft Excel untuk diolah lebih lanjut dengan rumus spreadsheet.
  - **CSV**: Mengunduh berkas format data standar untuk integrasi software akuntansi eksternal.

---

## BAB 10: PROSEDUR PELUNASAN PESANAN BELUM BAYAR (UNPAID)

Jika ada pesanan dengan status **⚠️ UNPAID (Belum Bayar)**, kasir dapat melunasinya melalui 3 tempat fleksibel di sistem:

### Pilihan 1: Melunasi dari POS Kasir Utama (`/order`)
1. Klik nomor meja yang berwarna merah/kuning dengan keterangan *UNPAID*.
2. Pada panel rincian sebelah kanan, klik tombol oranye besar:
   **`[💳 PROSES PEMBAYARAN (TAGIH CUSTOMER)]`**.
3. Pilih metode bayar yang digunakan tamu (**Cash**, **QRIS**, atau **SPLIT**).
4. Masukkan nominal uang yang diterima dan klik **`[Bayar Sekarang]`**.
5. Struk customer tanda lunas otomatis tercetak.

### Pilihan 2: Melunasi dari Monitor Pesanan (`/pos/monitor`)
1. Temukan kartu pesanan meja yang bersangkutan di layar monitor.
2. Klik tombol oranye **`[💳 Tagih & Bayar Kasir]`**.
3. Pilih metode bayar dan selesaikan transaksi.

### Pilihan 3: Melunasi dari Halaman Laporan Penjualan (`/admin/pos-reports`)
1. Buka tabel transaksi laporan penjualan.
2. Transaksi yang belum bayar memiliki badge kuning **`BELUM BAYAR`** dan tombol **`[💳 Bayar]`**.
3. Klik tombol **`[💳 Bayar]`**, tentukan metode pelunasan, lalu simpan.

---

## BAB 11: PROSEDUR PEMBATALAN MENU & PEMBATALAN PESANAN MEJA

### 1. Membatalkan Salah Satu Menu dalam Pesanan:
Jika koki dapur mengabarkan bahwa satu menu tidak bisa dimasak (misal stok telur dadar habis):
1. Buka nomor meja terkait di POS Kasir Utama (`/order`).
2. Cari nama menu yang ingin dibatalkan di daftar item sebelah kanan.
3. Klik ikon tempat sampah merah **`[🗑️]`** di sebelah kanan menu tersebut.
4. Muncul dialog konfirmasi: *"Batalkan Menu Ini? Tagihan meja akan disesuaikan otomatis"*. Klik **`[Ya, Batalkan Menu]`**.
5. Sistem otomatis mencoret menu tersebut, mengubah statusnya menjadi `CANCELLED`, dan **mengurangi total tagihan meja secara otomatis**.

### 2. Membatalkan Seluruh Pesanan Meja (Batal Total):
Jika tamu mendadak membatalkan seluruh pesanannya dan pulang:
1. Klik nomor meja terkait di POS Kasir.
2. Di bagian bawah panel pesanan, klik tombol merah **`[🗑️ Batal Order]`**.
3. Masukkan alasan pembatalan dan konfirmasi.
4. Seluruh tagihan dihapuskan, status pesanan menjadi `CANCELLED`, dan meja kembali **🟢 Hijau (AVAILABLE)**.

---

## BAB 12: NOTIFIKASI SUARA KASIR & PENGATURAN PRINTER THERMAL (58MM / 80MM)

### 1. Mengaktifkan Notifikasi Suara Kasir:
- Di header bagian atas POS Kasir dan Monitor Pesanan, terdapat tombol **`[🔔 Aktifkan Suara]`**.
- Klik tombol tersebut hingga berganti menjadi warna hijau bertuliskan **`[🔊 Suara Aktif]`**.
- **Fungsi Suara**:
  - Berbunyi nada lonceng (*chime*) saat pesanan baru berhasil dibuat.
  - Berbicara suara Bahasa Indonesia (Web Speech API) saat pesanan tambahan dikirim ke dapur: *"Menu tambahan nomor antrian 05 berhasil dikirim ke dapur"*.
  - Berbunyi saat hidangan selesai dimasak atau saat pembayaran berhasil.

### 2. Standar Pengaturan Printer Thermal Kasir di Browser (Chrome / Edge / Firefox):
Agar struk tercetak rapi, pas di tengah kertas, dan tidak terpotong:
1. Saat jendela cetak browser (*Print Dialog*) muncul, periksa setelan di bilah sebelah kanan:
   - **Destination**: Pilih nama printer thermal kasir Anda (misal: *POS-80, Thermal 58mm, Epson TM-T82, Xprinter*).
   - **Paper size**: Pilih sesuai lebar kertas printer Anda (**80mm x 297mm** atau **58mm**).
   - **Margins**: Wajib pilih **`None`** (Tanpa Batas Tepi).
   - **Scale**: Pilih **`Default`** atau `100%`.
   - **Options**:
     - Centang **`Background graphics`** (Wajib dicentang agar garis pembatas dan logo tercetak pekat).
     - Hilangkan centang pada **`Headers and footers`** (agar tanggal URL browser di pojok atas/bawah tidak ikut tercetak).
2. Setelan ini hanya perlu diatur 1 kali; browser akan otomatis mengingatnya untuk pencetakan berikutnya.

---

## BAB 13: STANDAR OPERASIONAL HARIAN (SOP BUKA & TUTUP KASIR)

### ☀️ SOP Buka Kasir (Pagi Hari Sebelum Buka):
1. Nyalakan komputer/laptop kasir dan printer thermal. Pastikan kertas thermal terisi penuh.
2. Buka browser dan login ke akun Kasir Central Palantea.
3. Buka menu **Manajemen Meja** (`/admin/pos-tables`) dan klik **`[🔄 Reset Semua Nomor]`** agar 30 meja berstatus hijau (*AVAILABLE*).
4. Siapkan 30 nomor antrian akrilik fisik di samping monitor kasir berurutan dari nomor 01 sampai 30.
5. Hitung uang modal kembalian di laci kasir (misal uang pecahan Rp 2.000, Rp 5.000, Rp 10.000).
6. Buka halaman POS Kasir (`/order`) dan klik tombol **`[🔊 Aktifkan Suara]`**. Kasir siap melayani tamu!

### 🌙 SOP Tutup Kasir (Sore / Malam Hari Setelah Tutup):
1. Pastikan seluruh meja di Monitor Pesanan (`/pos/monitor`) sudah ditandai **`[✅ Tandai Selesai]`** dan tidak ada pesanan tertinggal.
2. Buka halaman **Laporan Penjualan** (`/admin/pos-reports`), pilih preset filter **`[Hari Ini]`**.
3. Periksa nilai pada kartu **Total Kas Tunai (Cash)**:
   - Hitung seluruh uang fisik kertas dan koin yang ada di laci kasir (setelah dikurangi uang modal awal).
   - Jumlah uang fisik di laci **harus sama persis** dengan angka di kartu *Total Kas Tunai*.
4. Periksa nilai pada kartu **Total Non-Tunai (QRIS)**:
   - Cocokkan akumulasi transaksi QRIS dengan riwayat uang masuk di aplikasi merchant QRIS bank.
5. Klik tombol dropdown **`[Ekspor ▼]`** ➡️ pilih **PDF** untuk mengunduh dan mencetak rekap laporan penutupan kasir hari tersebut.
6. Serahkan fisik uang tunai beserta lembar cetak laporan PDF kepada manajer / pemilik Central Palantea.

---

## BAB 14: TROUBLESHOOTING & TANYA JAWAB (FAQ)

### Q1: Pelanggan meminta struk dicetak ulang karena struknya hilang atau sobek, bagaimana caranya?
> **Jawab**: Cari pesanan tersebut di tabel Laporan Penjualan (`/admin/pos-reports`) atau di Monitor Pesanan, lalu klik ikon printer **`[🖨️]`**. Pilih *Struk Customer* untuk mencetak ulang tanda terima pelanggan.

### Q2: Saat mencetak, kertas keluar panjang tapi tulisannya kosong/putih polos?
> **Jawab**: Kertas thermal terpasang terbalik. Buka tutup printer thermal dan balik posisi gulungan kertasnya (sisi yang licin mengarah ke kepala pemanas printer).

### Q3: Kenapa saat pesanan tambahan, struk dapur hanya keluar menu tambahannya saja?
> **Jawab**: Hal ini merupakan **fitur cerdas Palantea yang memang sengaja dirancang demikian**. Dapur hanya boleh menerima menu tambahan baru dengan tanda `★ HANYA MASAK MENU TAMBAHAN INI ★` agar juru masak tidak keliru memasak ulang hidangan pertama yang sudah dimakan tamu. Sementara itu, struk yang diberikan ke tamu (*Customer*) tetap mencantumkan menu awal dan tambahan secara lengkap.

### Q4: Jika listrik tiba-tiba padam atau koneksi internet terputus, apakah pesanan hilang?
> **Jawab**: Tidak hilang. Semua data pesanan yang sudah diklik simpan langsung tersimpan aman secara permanen di database server cloud. Begitu komputer dinyalakan kembali, cukup buka browser dan data pesanan meja akan langsung muncul seperti semula.

### Q5: Bagaimana jika ada pelanggan yang memesan untuk dibungkus pulang (Takeaway)?
> **Jawab**: Kasir dapat memilih salah satu nomor antrian yang tersedia (misal Meja 30), lalu tuliskan catatan *"BUNGKUS / TAKEAWAY"* di kolom catatan pesanan dan ketikkan nama pelanggan. Dapur akan otomatis membungkus hidangan tersebut dengan kotak makanan.

---
*Buku Pedoman Resmi Pengoperasian Sistem Kasir POS & Kantin Central Palantea Hidroponik — Versi Lengkap Oktober 2026*
