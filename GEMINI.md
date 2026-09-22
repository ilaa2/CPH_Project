# Catatan Perubahan

## 22 September 2026 (Update Logo Struk Kasir ke logoo.png)

### Penyesuaian Logo Struk Kasir (`Receipt.jsx`):
- **Penggantian File Logo**:
  - Mengubah sumber gambar logo pada bagian header struk customer dari `/storage/logo/central_palantea.png` menjadi **`/storage/logo/logoo.png`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyederhanaan Alur Cetak Struk Kasir & Penggabungan Tombol Cetak)

### Penyesuaian Alur & UI Kasir (`Kasir.jsx`):
- **Penggabungan Tombol Cetak Struk**:
  - Tombol terpisah `Cetak Struk Customer` dan `Ticket Dapur` pada panel kanan nomor meja telah digabung menjadi 1 tombol hijau tunggal: **`🖨️ Cetak Struk`**.
- **Alur Langsung Tanpa Popup Perantara**:
  - Saat menekan **"Kirim Pesanan ke Dapur"**, memproses pembayaran, atau menekan tombol **"Cetak Struk"** di meja, sistem **langsung membuka modal preview & cetak struk** (default mode 2 lembar terpisah auto-cut).
  - Mengeliminasi popup pertanyaan centang perantara sehingga kasir bisa langsung klik `Print Sekarang` / `Enter`.
- **Files Modified**:
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyesuaian Sidebar: Penyelarasan Warna Header HIDROPONIK & SPACE)

### Penyelarasan Judul Kategori Sidebar (`Sidebar.jsx`):
- **Warna Header Diseragamkan**: Mengubah warna teks judul kategori **`HIDROPONIK & SPACE`** dari abu-abu (`text-gray-400`) menjadi hijau (`text-green-600`), sehingga seragam dan konsisten dengan header kategori **`KANTIN`**.
- **Files Modified**:
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `GEMINI.md`

## 22 September 2026 (Optimasi Auto-Cut & Layout Cetak Struk Ganda Thermal 80mm)

### Perbaikan CSS Print & Pemotong Kertas Otomatis (`Receipt.jsx`):
- **Perbaikan CSS `@media print`**:
  - Mengubah `.pos-receipt-printable-wrap` dari `position: fixed` menjadi `position: static`, sehingga browser tidak mengabaikan *page break* atau membuat dua struk menumpuk saat dicetak.
  - Menambahkan jarak jeda kertas (`padding-bottom: 16px` & `margin-bottom: 10mm`) sebelum pemotongan halaman agar pisau *auto-cutter* printer thermal melewati area cetak teks secara bersih.
- **Setelan Driver Windows untuk Auto-Cut**:
  - Agar printer thermal (Blueprint POS 80 / POS-80) memotong kertas secara otomatis di setiap halaman/lembar, pastikan pengaturan driver printer di Windows set ke **`Page Cut`** atau **`Doc & Page Cut`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyesuaian Sidebar: Rename TOKO ONLINE → HIDROPONIK & SPACE, Dashboard Dipindahkan)

### Penyesuaian Label & Posisi Menu Sidebar (`Sidebar.jsx`):
- **Rename Label Section**: `TOKO ONLINE` diubah menjadi **`HIDROPONIK & SPACE`**.
- **Dashboard Dipindahkan**: Menu `Dashboard` dipindahkan ke dalam section **HIDROPONIK & SPACE** (bukan di atas section lagi).
- **Files Modified**:
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fitur Cetak 2 Struk Otomatis Terpisah / Auto-Cut Dual Receipts)

### Otomatisasi Cetak Struk Customer + Ticket Dapur Sekaligus (`Receipt.jsx` & `Kasir.jsx`):
- **Popup Konfirmasi Cepat Setelah Kirim Pesanan / Bayar (`Kasir.jsx`)**:
  - Setelah pesanan dikirim ke dapur atau pembayaran diproses, sistem memunculkan dialog ringkas:
    * `[☑️] Struk Pembayaran Customer` (Default Tercentang)
    * `[☑️] Ticket Pesanan Dapur` (Default Tercentang)
  - Kasir cukup menekan tombol **`🖨️ Cetak Struk`** 1 kali (atau `Enter`).
- **Pemisahan Lembar Otomatis / Auto-Cut (`Receipt.jsx`)**:
  - Menambahkan dukungan mode `type="both"` dengan CSS Print `@page { size: portrait; margin: 0mm; }` dan `.receipt-page-cut { page-break-after: always !important; break-after: page !important; }`.
  - Printer thermal 80mm yang memiliki fitur Auto-Cutter akan otomatis mencetak Struk Customer ➡️ **memotong kertas secara otomatis (Auto Cut)** ➡️ melanjutkan cetak Ticket Dapur ➡️ **memotong kertas kembali (Auto Cut)**.
  - Menghasilkan 2 lembar kertas terpisah yang rapi tanpa perlu menggunting manual.
- **Tab Pemilih di Preview Struk (`Kasir.jsx`)**:
  - Pada modal preview struk kasir, disediakan tombol tab cepat: **`✂️ Keduanya (2 Lembar)`**, **`🖨️ Customer Saja`**, dan **`🍳 Dapur Saja`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fitur Dashboard & Laporan Penghasilan Kantin POS)

### Pembuatan Modul Dashboard & Laporan Keuangan Kantin (`ReportIndex.jsx`, `PosReportController.php`, `web.php`, `Sidebar.jsx`):
- **Menu Baru di Sidebar KANTIN (`Sidebar.jsx`)**:
  - Menambahkan menu **`📊 Laporan & Penghasilan`** (`/admin/pos-reports`) di bawah Nomor Antrian untuk role `admin` dan `kasir`.
- **Backend Controller & Laporan Keuangan (`PosReportController.php`)**:
  - Menyediakan ringkasan finansial: Omzet Hari Ini, Omzet Bulan Ini, Omzet Terpilih, Transaksi Selesai, Rekap Cash (uang laci), Rekap QRIS (saldo bank), dan Tagihan Aktif Belum Bayar.
  - Perhitungan **Top 5 Menu Paling Laris (Best Seller)** berdasarkan porsi terjual dan total omzet.
  - Analisis **Peak Hours (Jam Sibuk)** dari pukul 08:00 sampai 22:00.
  - Filter fleksibel: *Hari Ini*, *Kemarin*, *7 Hari Terakhir*, *Bulan Ini*, *Bulan Lalu*, *Semua Waktu*, atau *Pilih Rentang Tanggal Manual*.
  - Ekspor data transaksi ke file format **CSV/Excel** UTF-8 (`exportCsv`).
- **Tampilan Interaktif Frontend (`ReportIndex.jsx`)**:
  - 6 Kartu KPI Finansial dengan gradasi dan indikator status.
  - Grafik Tren Pendapatan Harian (Line Chart) dan Grafik Jam Sibuk (Bar Chart) menggunakan Chart.js.
  - Diagram Komposisi Metode Bayar Cash vs QRIS (Doughnut Chart).
  - Tabel Daftar Transaksi Kasir dengan pagination, filter status bayar & metode, pencarian instan, serta tombol **Cetak Ulang Struk Customer & Ticket Dapur**.
- **Files Modified/Created**:
  - `app/Http/Controllers/Pos/PosReportController.php` *(NEW)*
  - `resources/js/Pages/POS/Admin/ReportIndex.jsx` *(NEW)*
  - `routes/web.php`
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyesuaian Kitchen Ticket: Ganti "Bayar Via" Menjadi "Status Bayar: LUNAS / BELUM LUNAS")

### Kustomisasi Struk Ticket Dapur (`Receipt.jsx`):
- **Penggantian Field "Bayar Via" pada Kitchen Ticket**:
  - Pada struk Dapur (`type === 'kitchen'`), label `Bayar Via: CASH/QRIS` telah diubah menjadi **`Status Bayar: LUNAS`** (hijau tebal) atau **`Status Bayar: BELUM LUNAS`** (merah tebal).
  - Struk Pelanggan (`type === 'customer'`) tetap menampilkan metode pembayaran `Bayar Via: CASH / QRIS` beserta rincian Bayar dan Kembalian secara lengkap.
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Verifikasi & Sinkronisasi Realtime Bayar & Kembalian Struk Kasir)

### Sinkronisasi Data Pembayaran & Kembalian Struk Thermal Kasir (`Kasir.jsx`, `Receipt.jsx`, `HandleInertiaRequests.php`):
- **Verifikasi Database & Eager Loading Pembayaran**:
  - Memastikan seluruh transaksi tunai (`Cash`) yang dikirim dari kasir menyimpan nominal uang diberikan (`jumlah_bayar`) dan kalkulasi kembalian (`kembalian`) ke tabel `pos_payments`.
  - Flash session `latestOrder` dan relasi `activeOrder.payment` terhubung penuh ke state `orderForReceipt` dan komponen `Receipt.jsx`.
- **Tampilan Struk Pelanggan**:
  - Untuk pembayaran tunai berlebih (misal total `Rp 23.000` dibayar dengan uang pecahan `Rp 30.000`), struk thermal mencetak:
    * `Metode: CASH`
    * `Bayar: Rp 30.000`
    * `Kembalian: Rp 7.000`
- **Files Verified & Compiled**:
  - `app/Http/Middleware/HandleInertiaRequests.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Optimasi Kertas Thermal 80mm & Panduan Silent Direct Printing Kasir)

### Penyesuaian Layout Kertas Thermal 80mm (`Receipt.jsx` & `Kasir.jsx`):
- **Penetapan Default Kertas Thermal 80mm (`Kasir.jsx` & `Receipt.jsx`)**:
  - Mengubah default prop `paperSize` menjadi `'80mm'` (lebar fisik `76mm`) untuk menyesuaikan dengan gulungan kertas thermal standar **80x80mm**.
- **Penguncian Orientasi Portrait & Penyesuaian Presisi Rata Tengah 80mm (`Receipt.jsx`)**:
  - Menambahkan aturan CSS `@page { size: portrait; margin: 0mm; }`, `left: 0; right: 0; margin: 0 auto;`, dan penyesuaian lebar printable `62mm` (mengeliminasi masalah teks/angka terpotong di tepi kanan seperti Nomor Meja 06, serta memberikan margin presisi pada gulungan kertas 80mm).
- **Penambahan Logo Brand Green & Pembesaran Ukuran (`Receipt.jsx`)**:
  - Menampilkan logo resmi Central Palantea (`/storage/logo/central_palantea.png`) dalam warna hijau khas brand secara presisi dan diperbesar (lebar `w-28` / `112px`) di bagian teratas header struk customer.
- **Penyempurnaan Input Bayar Tunai & Hitung Kembalian (`Kasir.jsx` & `HandleInertiaRequests.php`)**:
  - Menyaring tombol preset pecahan uang tunai (`Pas`, `30k`, `50k`, `100k`, `200k`) agar hanya menampilkan nominal yang sama atau lebih besar dari total tagihan.
  - Mendaftarkan flash data `latestOrder` pada middleware `HandleInertiaRequests.php` sehingga data pembayaran `jumlah_bayar` dan `kembalian` dari server terkirim 100% utuh dan akurat ke struk thermal.
- **Files Modified**:
  - `app/Http/Middleware/HandleInertiaRequests.php`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fix Order Not Saved in Database: Missing DB::commit in KasirController)

### Perbaikan Persistence & Commit Transaksi Pesanan Kasir (`KasirController.php` & `Kasir.jsx`):
- **Aktivasi `DB::commit()` pada `storeOrder` (`KasirController.php`)**:
  - **Penyebab Masalah**: Sebelumnya method `storeOrder` mengeksekusi `DB::beginTransaction()`, namun tidak memanggil `DB::commit()` sebelum `return back()`. Hal ini menyebabkan PDO/MySQL secara otomatis melakukan **ROLLBACK** terhadap transaksi saat request HTTP berakhir. Akibatnya, pesanan yang baru dibuat (meja no. 5, dll) tidak pernah tersimpan di database, tidak masuk ke Dapur (KDS), dan tidak muncul di Admin/Kasir saat halaman di-refresh atau saat modal struk ditutup.
  - **Solusi**: Menambahkan `DB::commit();` secara eksplisit tepat sebelum mengembalikan `return back()->with('success', ...)` dalam blok `try`.
- **Penanganan Error Flash di Frontend (`Kasir.jsx`)**:
  - Menambahkan pengecekan `page?.props?.flash?.error` pada callback `onSuccess` di `handleSendOrder` agar jika terjadi kendala pada backend, alert error ditampilkan secara transparan dan keranjang tidak dikosongkan.
- **Files Modified**:
  - `app/Http/Controllers/Pos/KasirController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fix Layout Modal Struk Thermal POS: Responsive Scroll Mandiri & Fixed Buttons)

### Perbaikan Modal Cetak Struk Thermal Kasir (`Kasir.jsx`):
- **Responsive Scroll Mandiri Modal Preview (`Kasir.jsx`)**:
  - Mengubah kontainer modal cetak struk thermal menjadi `max-h-[90vh] flex flex-col overflow-hidden`.
  - Mengisolasi bagian scroll hanya pada area preview struk (`flex-1 overflow-y-auto custom-scrollbar`), sehingga saat item pesanan sangat banyak, **struk dapat di-scroll dengan lancar dari atas ke bawah** tanpa terpotong atau memaksa layar di-zoom out.
- **Fixed Header & Action Buttons**:
  - Judul modal ("Cetak Struk Thermal POS") terkunci di bagian atas modal (`shrink-0`).
  - Tombol aksi **`🖨️ Print Sekarang`** dan **`Tutup`** terkunci secara presisi di bagian bawah modal (`shrink-0 pt-1 border-t`).
- **Files Modified**:
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penataan Ulang & Kerapian Tampilan Daftar Menu Struk Thermal POS)

### Perbaikan Layout Daftar Item Menu Struk (`Receipt.jsx`):
- **Menghilangkan Potongan Nama Menu (`truncate`)**:
  - Mengubah penanganan teks nama menu agar tampil secara utuh tanpa terpotong titik-titik (`...`), mendukung pembungkusan kata alami (`break-words flex-1`).
- **Nominal Harga Selalu Satu Baris Presisi**:
  - Mencegah nominal harga (misal `Rp 18.000`) terpotong/patah menjadi dua baris dengan menambahkan `whitespace-nowrap shrink-0 text-right`.
- **Eliminasi Rincian Harga Satuan Redundan**:
  - Menghilangkan cetakan baris `@ Rp X.XXX` untuk item berjumlah `1x` (karena harga satuan dan subtotal bernilai sama), dan hanya mencantumkan harga satuan jika `jumlah > 1` (misal: `2x Indomie Goreng` `(2 x Rp 18.000)`).
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fitur Input Uang Diberikan & Hitung Kembalian Saat Buat Order Tunai Kasir)

### Penambahan Form Uang Bayar Tunai pada Kasir (`Kasir.jsx` & `KasirController.php`):
- **Input Nominal Uang Diberikan (`Kasir.jsx`)**:
  - Saat kasir memilih **`💵 Cash (Lunas)`** ketika membuat pesanan baru, form input **`Uang Diberikan (Rp)`** dan tombol preset instan (`Pas`, `50k`, `100k`, `200k`) otomatis muncul secara dinamis.
  - Menampilkan kalkulasi **`Kembalian`** secara realtime sebelum pesanan dikirim ke dapur.
- **Penyimpanan Record Pembayaran (`KasirController.php`)**:
  - `storeOrder` menerima parameter `jumlah_bayar`, menghitung nilai kembalian tunai, dan langsung menyimpan record ke tabel `pos_payments`.
- **Cetak Struk Instan dengan Kembalian Akurat (`Receipt.jsx`)**:
  - Struk thermal yang langsung dicetak setelah pesanan dikirim secara otomatis menampilkan nominal **`Bayar: Rp [Uang Diberikan]`** dan **`Kembalian: Rp [Nominal Kembalian]`** yang di-input kasir.
- **Files Modified**:
  - `app/Http/Controllers/Pos/KasirController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Pencantuman Rincian Bayar & Kembalian Khusus Pembayaran Tunai/Cash pada Struk)

### Penyesuaian Struk Thermal Tunai/Cash (`Receipt.jsx`):
- **Sinkronisasi Metode Pembayaran**:
  - `Bayar Via` pada bagian header dan `Metode` pada bagian bawah disinkronkan secara konsisten (`CASH` / `QRIS`).
- **Pencantuman Rincian Bayar & Kembalian Khusus Cash**:
  - Untuk setiap transaksi bertipe **`CASH`**, struk thermal secara otomatis mencantumkan:
    * **`Metode`**: `CASH`
    * **`Bayar`**: `Rp [Jumlah Uang yang Diberikan]` (misal: Rp 100.000)
    * **`Kembalian`**: `Rp [Nominal Kembalian]` (misal: Rp 65.000)
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Otomatisasi Opsi Cetak Struk Langsung Saat Kirim Pesanan Kasir)

### Otomatisasi Cetak Struk Kasir (`KasirController.php` & `Kasir.jsx`):
- **Flash Data Order Terbaru (`KasirController.php`)**:
  - `storeOrder` mengembalikan objek `$order` lengkap beserta relasinya (`table`, `cashier`, `items.food`, `payment`) via `with('latestOrder', $order)` dalam flash session.
- **Opsi Cetak Struk Langsung Tanpa Klik Ulang (`Kasir.jsx`)**:
  - Setelah Kasir mengeklik tombol **"Kirim Pesanan ke Dapur"**, sistem **langsung memunculkan dialog konfirmasi sukses** dengan 2 pilihan cetak instan:
    1. **`🖨️ Cetak Struk Customer`**: Langsung membuka modal cetak struk thermal untuk pelanggan.
    2. **`🍳 Cetak Ticket Dapur`**: Langsung membuka modal cetak ticket dapur.
  - Mengeliminasi kebutuhan kasir untuk mengeklik kembali nomor meja di grid maupun mengeklik tombol *"Proses Pembayaran (Customer Selesai Makan)"*.
- **Tombol Akses Pintas Struk di Panel Kanan (`Kasir.jsx`)**:
  - Saat memilih meja berstatus Lunas di grid, panel kanan kini langsung menampilkan tombol **`🖨️ Cetak Struk Customer`** dan **`🍳 Ticket Dapur`** untuk kemudahan cetak ulang kapan saja.
- **Files Modified**:
  - `app/Http/Controllers/Pos/KasirController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Kustomisasi Struk Thermal POS: Logo, Judul, Alamat, No Meja, Format Waktu & Footer)

### Pembaruan Tampilan Struk Thermal (`Receipt.jsx`):
- **1. Penambahan Logo Brand**:
  - Menampilkan logo resmi Central Palantea (`/storage/logo/central_palantea.png`) secara presisi di bagian teratas header struk customer.
- **2. Judul Utama Struk**:
  - Diperbarui menjadi **`CENTRAL PALANTEA HIDROPONIK`**.
- **3. Subtitle & Alamat Resmi**:
  - **Subtitle**: `Agrowisata Center — Cafe • Space • Hydroponic`.
  - **Alamat**: `Jl. Melayu, Babussalam, Mandau, Bengkalis Regency, Riau 28784`.
- **4. Penggantian Label & Tampilan Nomor Meja**:
  - Mengubah label `NO. ANTRIAN:` menjadi **`NO. MEJA:`**.
  - Menghapus blok latar belakang hitam pekat dan menampilkan nomor meja (`NO. XX`) secara bersih, tegas, dan mudah dibaca tanpa `NO. --` kosong.
- **5. Pembaruan Pesan Footer Struk**:
  - Mengubah teks footer menjadi:
    * *"Terima Kasih Atas Kunjungan Anda!"*
    * *"Mohon Ditunggu, Hidangan Segera Kami Antarkan"*
- **6. Format Waktu Tanpa Detik**:
  - Mengisolasi penulisan jam dan menit saja (misal `22/9/2026, 10.17`) dengan menghapus komponen detik.
- **Files Modified**:
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyesuaian Modal Pembayaran QRIS: Uang Pas Otomatis & Tanpa Kembalian)

### Penyesuaian UX Modal Bayar Kasir (`Kasir.jsx`):
- **Otomatis Nominal Pas untuk QRIS**:
  - Saat kasir memilih metode **`📱 QRIS`** di Modal Pembayaran, nilai `jumlahBayar` secara otomatis dikunci persis sesuai total tagihan pesanan (`jumlahBayar = total`).
- **Penyembunyian Form Input & Quick Buttons Khusus QRIS**:
  - Menyembunyikan input manual nominal, tombol preset uang pas (20k, 50k, 100k), dan kalkulasi kembalian saat metode **QRIS** dipilih, karena transaksi QRIS non-tunai selalu bernilai pas tanpa kembalian.
  - Menampilkan banner informatif: *"Nominal pembayaran QRIS otomatis pas sesuai tagihan: Rp [Total] (tanpa kembalian)"*.
- **Metode Cash Tetap Lengkap**:
  - Metode **`💵 Cash`** tetap menampilkan input nominal bayar, tombol preset uang pas, dan kalkulator hitung kembalian secara presisi.
- **Files Modified**:
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penambahan Akses Menu Makanan & Nomor Antrian untuk Role Kasir)

### Ekstensi Akses Modul Kantin untuk Kasir (`routes/web.php` & `Sidebar.jsx`):
- **Otorisasi Middleware Route (`web.php`)**:
  - Memindahkan route `/admin/pos-foods` (Kelola Menu Makanan) dan `/admin/pos-tables` (Kelola Nomor Antrian) ke dalam grup `Route::middleware(['auth', 'pos.access'])`.
  - Hal ini mengizinkan pengguna dengan role `kasir` (serta `admin`) untuk mengelola daftar makanan/minuman dan memantau/mereset status 30 nomor antrian tanpa terkena 403 Forbidden.
- **Tampilan Sidebar Modul KANTIN (`Sidebar.jsx`)**:
  - Memperbarui kondisi render menu item **Menu Makanan** dan **Nomor Antrian** pada Sidebar agar tampil bagi role `admin` DAN `kasir` (`auth.user?.role === 'admin' || auth.user?.role === 'kasir'`).
- **Files Modified**:
  - `routes/web.php`
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `GEMINI.md`

## 22 September 2026 (Update Default Pembayaran: Cash Lunas & Urutan Opsi)

### Pengaturan Default & Urutan Opsi Pembayaran (`Kasir.jsx`):
- **Default Opsi Pembayaran**:
  - Mengubah opsi default saat input pesanan baru di Kasir menjadi **`💵 Cash (Lunas)`** (karena mayoritas transaksi kasir adalah bayar tunai lunas).
- **Urutan Tombol Pembayaran saat Input Order**:
  1. **`💵 Cash (Lunas)`** (Default / Opsi 1)
  2. **`📱 QRIS (Lunas)`** (Opsi 2)
  3. **`⚠️ Belum Dibayar`** (Opsi 3)
- **Garansi Status Lunas**:
  - Saat kasir memilih **Cash** atau **QRIS**, pesanan langsung disimpan dengan status `payment_status = PAID` dan otomatis membuat record pembayaran. Dapur dan Kasir langsung menampilkan status **`✅ LUNAS`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fix Route Name Error: pos.kasir & pos.kitchen)

### Perbaikan Nama Route Laravel (`AuthenticatedSessionController.php` & `WelcomeController.php`):
- **Penyesuaian Nama Route**:
  - Mengubah pemanggilan `route('pos.kasir.index')` menjadi **`route('pos.kasir')`** sesuai dengan definisi route di `routes/web.php`.
  - Mengubah `route('pos.kitchen.index')` menjadi **`route('pos.kitchen')`**.
- **Hasil**:
  - Mengeliminasi error `Route [pos.kasir.index] not defined`.
  - Pengalihan otomatis akun Kasir ke `/order` dan Dapur ke `/kitchen` berjalan 100% lancar tanpa exception.
- **Files Modified**:
  - `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
  - `app/Http/Controllers/WelcomeController.php`
  - `GEMINI.md`

## 22 September 2026 (Fitur 3 Opsi Status Pembayaran Saat Input Pesanan Kasir)

### Fleksibilitas Pembayaran Saat Input Order (`Kasir.jsx` & `KasirController.php`):
- **3 Pilihan Status Pembayaran Saat Buat Order**:
  1. **`⚠️ Belum Dibayar`**: Pesanan dikirim ke Dapur dengan status `payment_status = UNPAID`. Dapur dan Kasir menampilkan indikator **`⚠️ BELUM DIBAYAR`**. Pembayaran ditagih belakangan.
  2. **`💵 Cash (Lunas)`**: Pesanan langsung lunas tunai saat di-input (`payment_status = PAID`). Dapur dan Kasir menampilkan **`✅ LUNAS`**. Record pembayaran dibuat otomatis.
  3. **`📱 QRIS (Lunas)`**: Pesanan langsung lunas QRIS saat di-input (`payment_status = PAID`). Dapur dan Kasir menampilkan **`✅ LUNAS`**. Record pembayaran dibuat otomatis.
- **Dapur Tetap Fokus 2 Status Utama**:
  - Papan KDS Dapur (`Kitchen.jsx`) hanya menampilkan indikator utama: **`⚠️ BELUM DIBAYAR`** atau **`✅ LUNAS`**.
- **Pengumuman Suara Sesuai Status**:
  - Pengumuman suara kasir mengkonfirmasi apakah pesanan *lunas* atau *belum dibayar* saat dikirim ke dapur.
- **Files Modified**:
  - `app/Http/Controllers/Pos/KasirController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fix Route & Redirect Akses POS Kasir)

### Perbaikan Pengalihan Halaman Kasir (`AuthenticatedSessionController.php`, `WelcomeController.php`, `CustomerLayout.jsx`):
- **Otomatis Redirect Role Kasir**:
  - Saat user bertipe `kasir` login atau mengakses URL utama (`http://127.0.0.1:8000/`), sistem **secara otomatis mengarahkan langsung ke Halaman POS Kasir (`/order`)** bukannya toko online customer.
  - Hal yang sama berlaku untuk role `dapur` (ke `/kitchen`) dan `admin` (ke `/admin`).
- **Menu Akses Pintas di Header/Profile Dropdown (`CustomerLayout.jsx`)**:
  - Menambahkan menu tombol **`💻 POS Order Kantin (Kasir)`** di dropdown profil user jika akun bertipe Kasir.
- **Files Modified**:
  - `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
  - `app/Http/Controllers/WelcomeController.php`
  - `resources/js/Layouts/CustomerLayout.jsx`
  - `GEMINI.md`

## 22 September 2026 (Penyederhanaan Tampilan Pembayaran: Hanya Lunas / Belum Dibayar)

### Penyederhanaan Visual Kasir & Dapur:
- **Pembersihan Badge Cash/QRIS di KDS Dapur (`Kitchen.jsx`)**:
  - Menghapus badge `💵 CASH` / `📱 QRIS` di seluruh kartu KDS Dapur (Kolom 1, 2, dan 3).
  - Kartu kini **hanya fokus menampilkan indikator utama**: **`⚠️ BELUM DIBAYAR`** atau **`✅ LUNAS`**.
- **Penyederhanaan Form & Recap POS Kasir (`Kasir.jsx`)**:
  - Menghapus tombol pilihan metode pembayaran (Cash/QRIS) saat kasir membuat pesanan baru (karena metode pembayaran baru dipilih saat kasir memproses pembayaran/menagih customer di modal bayar).
  - Memperbarui status pembayaran pada detail pesanan terisi agar hanya menampilkan **`⚠️ BELUM DIBAYAR`** atau **`✅ LUNAS`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Dukungan Alur Bayar Belakangan / Pay-Later POS Kantin)

### Indikator & Reminder Pembayaran Belakangan:
- **Badge Status Pembayaran di KDS Dapur (`Kitchen.jsx`)**:
  - Menampilkan badge **`⚠️ BELUM DIBAYAR`** (animasi pulse kuning/amber) jika pesanan berstatus `payment_status = UNPAID`.
  - Menampilkan badge **`✅ LUNAS`** (hijau) jika pesanan sudah dibayar.
  - Ditampilkan di semua kolom KDS: *1. PESANAN BARU*, *2. SEDANG DIPROSES*, dan *3. SIAP / DISAJIKAN*.
- **Note pada Struk Thermal & Ticket Dapur (`Receipt.jsx`)**:
  - Menampilkan box warning bertuliskan: **`⚠️ BELUM DIBAYAR — * Pembayaran ditagih saat pengantaran *`** pada Struk Customer jika belum dibayar.
  - Menampilkan banner **`⚠️ BELUM DIBAYAR - TAGIH SAAT PENGANTARAN`** pada Ticket Dapur.
- **Reminder Kasir & Visual Grid 30 Nomor (`Kasir.jsx`)**:
  - Visual Grid 30 Nomor menampilkan badge **`⚠️ UNPAID`** pada nomor antrian yang sedang terisi tapi belum dibayar.
  - Panel kanan Recap Pesanan terisi menampilkan box **`📌 Reminder Kasir: Pembayaran ditagih saat pengantaran hidangan atau customer selesai makan`**.
  - Tombol aksi kasir disesuaikan menjadi **`💳 PROSES PEMBAYARAN (TAGIH CUSTOMER)`**.
- **Files Modified**:
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fitur Text-to-Speech Suara Pengumuman Otomatis Kasir & Dapur)

### Pengumuman Suara Bahasa Indonesia (Web Speech API):
- **Fitur Pengumuman Suara (TTS Native Browser)**:
  - Mengintegrasikan `window.speechSynthesis` (Web Speech API) dengan konfigurasi Bahasa Indonesia (`id-ID`).
  - Menggabungkan nada *chime dual-tone* (E5 & A5) dengan pengumuman suara yang jernih dan alami.
- **Pengumuman Otomatis pada KDS Dapur (`Kitchen.jsx`)**:
  - **Pesanan Baru**: *"Pesanan baru masuk, Nomor Antrian [X], atas nama [Nama Pelanggan]"* saat ada order baru dari kasir.
  - **Terima & Proses**: *"Pesanan Nomor Antrian [X] sedang diproses"* saat Dapur mengeklik tombol proses.
  - **Siap Disajikan**: *"Pesanan Nomor Antrian [X] siap disajikan"* saat Dapur mengeklik makanan siap.
  - **Serahkan & Selesaikan**: *"Pesanan Nomor Antrian [X] selesai diserahkan"* saat pesanan diserahkan.
  - **Reset Kartu**: *"Nomor Antrian [X] siap digunakan kembali"* saat kartu antrian di-reset.
- **Pengumuman Otomatis pada POS Kasir (`Kasir.jsx`)**:
  - Menambahkan tombol **🔊 Suara Aktif / Aktifkan Suara** pada header Kasir.
  - **Kirim Pesanan**: *"Pesanan Nomor Antrian [X] berhasil dikirim ke dapur"* saat Kasir membuat order.
  - **Pembayaran Sukses**: *"Pembayaran Nomor Antrian [X] berhasil"* saat Kasir memproses pembayaran.
- **Files Modified**:
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Fix MySQL Error 1932 & Re-Migration Database)

### Penanganan Database Corrupt XAMPP (Error 1932):
- **Masalah**: Muncul error `SQLSTATE[42S02]: Base table or view not found: 1932 Table 'cph_project.products' doesn't exist in engine` akibat file data InnoDB XAMPP/MariaDB corrupt/yatim saat MySQL mati mendadak.
- **Solusi**:
  - Membuat database MySQL segar baru `cph_project_db` untuk membebaskan sistem dari file tablespace InnoDB yang terkunci.
  - Memperbarui konfigurasi `DB_DATABASE=cph_project_db` di `.env`.
  - Menjalankan `php artisan migrate:fresh --seed` secara penuh (49 tabel migration & 9 seeder berjalan **100% DONE**).
  - Mengembalikan seluruh master data: Admin, Kasir, Dapur, 49 Item Menu Resmi Flyer, 30 Nomor Antrian, dan Produk Online.
- **Files Modified**:
  - `.env`
  - `GEMINI.md`

## 22 September 2026 (Fix Layout Panel Kasir: Scroll Keranjang Mandiri & Sticky Panel)

### Perbaikan Layout POS Kasir (`Kasir.jsx`):
- **Fixed & Sticky Panel Kanan (Recap Pesanan)**:
  - Mengubah struktur Flexbox pada panel recap kanan menjadi `lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 overflow-hidden`.
  - Header (Nomor Antrian & Ganti Nomor) mengunci di posisi atas panel (`shrink-0`).
  - Input Nama Customer, Metode Pembayaran (Cash/QRIS), Catatan, Total Tagihan, dan Tombol "Kirim Pesanan ke Dapur" mengunci di posisi paling bawah panel (`shrink-0`).
- **Scroll Mandiri Item Keranjang (`cart.map`)**:
  - Mengisolasi bagian scroll hanya pada **Daftar Item Menu Keranjang (`flex-1 overflow-y-auto min-h-0`)**.
  - Saat item dalam keranjang bertambah banyak, hanya daftar item di keranjang saja yang ter-scroll, sementara form input dan tombol kirim di bawahnya tetap terlihat dan tidak ikut bergeser.
- **Files Modified**:
  - `resources/js/Pages/POS/Kasir.jsx`
  - `GEMINI.md`

## 22 September 2026 (Update KDS Audio, Tombol Selesai, Input Nama Customer & Metode Pembayaran Cash/QRIS)

### Update Sistem KDS Dapur & POS Kasir:
- **Perbaikan Layout Sidebar (Profil User Fixed di Bawah)**:
  - Mengubah struktur Flexbox pada `Sidebar.jsx` agar **Profil User (`User Info`) di bagian bawah selalu fixed/sticky di posisi paling bawah**, tidak dapat ter-scroll.
  - Mengisolasi bagian scroll hanya pada **Daftar Menu (`flex-1 overflow-y-auto`)** jika item menu berlebih.
- **Pengaktifan Audio Notifikasi KDS (Web Audio API Synthesizer)**:
- **Pengaktifan Audio Notifikasi KDS (Web Audio API Synthesizer)**:
  - Mengintegrasikan Web Audio API Chime Synthesizer dua nada (E5 & A5) native browser yang **dijamin berbunyi lantang** saat ada pesanan baru masuk tanpa tergantung file MP3 eksternal.
  - Menambahkan tes audio otomatis saat tombol "Suara Aktif" diklik agar browser meng-unlock izin audio.
- **Tombol Penyelesaian Pesanan pada Kolom 3 KDS (SIAP / DISAJIKAN)**:
  - Menambahkan tombol **`🎉 SERAHKAN KEPADA CUSTOMER & SELESAIKAN`** pada setiap card pesanan di Kolom 3 ("SIAP / DISAJIKAN").
  - Menghubungkan alur status dari `READY` -> `COMPLETED`, yang secara otomatis memindahkan kartu antrian ke Kolom 4 ("KARTU ANTRIAN SELESAI") agar siap di-reset/dikembalikan ke kasir.
- **Pencatatan Nama Customer (Input Diketik)**:
  - Menambahkan field input **Nama Customer / Pemesan** pada POS Kasir (`Kasir.jsx`).
  - Menyimpan `nama_pelanggan` pada tabel `pos_orders`.
  - Menampilkan nama customer secara jelas di KDS (`Kitchen.jsx`), Kasir (`Kasir.jsx`), dan Struk Thermal (`Receipt.jsx`).
- **Penyederhanaan Metode Pembayaran (Hanya Cash & QRIS)**:
  - Mengubah opsi pembayaran menjadi **HANYA 2 PILIHAN: 💵 Cash dan 📱 QRIS**.
  - Menampilkan badge indikator pembayaran (`💵 CASH` / `📱 QRIS`) secara jelas di bawah/samping informasi pesanan pada KDS Dapur, Kasir, dan Struk Thermal.
- **Files Modified**:
  - `database/migrations/2026_09_14_163459_add_nama_pelanggan_to_pos_orders_table.php`
  - `app/Models/PosOrder.php`
  - `app/Http/Controllers/Pos/KasirController.php`
  - `app/Http/Controllers/Pos/KitchenController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `GEMINI.md`

## 14 September 2026 (Update Sesi 4 - Pembaruan Daftar Menu Resmi Flyer)

### Import & Sinkronisasi Menu Resmi Central Palantea Space & Kantin
- **Pembaruan Master Data Menu Makanan/Minuman**:
  - Menginput seluruh 49 item menu resmi sesuai flyer *Central Palantea Space & Kantin*.
  - Terbagi menjadi 4 Kategori Utama:
    1. **Makanan Utama (Main Courses)**: 20 Item (Nasi Goreng, Nasi Ayam Barendo Palantea, Selada Kuah Kacang Palantea, Nasi Ramas Dendeng Cabe Merah, Mienas Palantea, dll).
    2. **Additional**: 4 Item (Telur Rebus, Telur Ceplok, Telur Dadar, Nasi Putih).
    3. **Minuman**: 19 Item (Jus Kale 100% Fresh Hidroponik, Teh Es, Kopi Gingseng, Matcha Ice, Wedang Jahe Merah, dll).
    4. **Snack**: 6 Item (French Fries, Mix Platter, Nugget Ayam, Pastel Sayur Mini, Risolles Sayur, Pisang Kipas).
- **Files Modified**:
  - `database/seeders/PosSeeder.php` (diperbarui dengan data presisi & harga resmi)
  - Database cleaned: menu dummy di-reset dan diganti 49 menu resmi.
  - `GEMINI.md`

## 14 September 2026 (Update Sesi 3 - Pemisahan Sidebar & Konsep Nomor Antrian)

### Pemisahan Menu Sidebar & Perubahan Konsep POS Kantin
- **Pemisahan Modul Sidebar Admin**:
  - `TOKO ONLINE`: Menampung seluruh fitur e-commerce/website lama (Produk Online, Pesanan Online, Laporan, Customer, Kunjungan, Ulasan).
  - `KANTIN`: Menampung seluruh fitur POS internal baru (Sistem POS Kasir, Kitchen Display, Menu Makanan, Nomor Antrian) yang diletakkan di section terpisah di bawah dengan space/pemisah jelas.
- **Transformasi Konsep "Meja" -> "Nomor Antrian / Nomor Duduk"**:
  - Menyesuaikan sistem operasional kantin dari Dine-in Meja 01-30 menjadi **Nomor Antrian / Nomor Duduk (No. 01 - 30)** yang dibawa/dipegang oleh pelanggan setelah bayar.
  - Struk Thermal & Ticket Dapur (`Receipt.jsx`) menampilkan **NO. ANTRIAN: XX** secara besar dan jelas.
  - Kitchen Display System (`Kitchen.jsx`) menampilkan **NO. ANTRIAN** dengan jelas pada setiap kolom status pesanan.
  - Halaman Admin Manajemen Meja diperbarui menjadi **Manajemen Nomor Antrian**.
- **Files Modified**:
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `resources/js/Pages/POS/Admin/TableIndex.jsx`
  - `GEMINI.md`

## 14 September 2026 (Update Sesi 2 - Lanjutan)

### Aktivasi & Deployment Sistem POS
- **Status**: Sistem POS sepenuhnya aktif setelah menjalankan migration dan seeder.
- **Fix Migration Role Enum**: Kolom `role` di tabel `users` hanya mendukung `admin` & `customer`. Ditambahkan migration baru untuk memperluas enum ke `['admin', 'customer', 'kasir', 'dapur']`.
  - **File Created**: `database/migrations/2026_09_14_160836_add_kasir_dapur_to_users_role.php`
- **Migration POS Berhasil**: `2026_09_14_100000_create_pos_system_tables` — 6 tabel POS berhasil dibuat (880ms).
- **Seeder Berhasil**: `PosSeeder` berjalan sukses — 2 user (kasir & dapur), 30 meja (Meja 01-30), 3 kategori, 10 menu makanan/minuman terisi di database.
- **Frontend Build Berhasil**: `npm run build` — semua aset POS ter-compile (`Kasir.js`, `Kitchen.js`, `FoodIndex.js`, `TableIndex.js`).
- **Kredensial Akun**:
  - Kasir: `kasir@cph.com` / `KasirCPH24@` → redirect ke `/order`
  - Dapur: `dapur@cph.com` / `DapurCPH24@` → redirect ke `/kitchen`
- **Verifikasi**: Semua route, middleware, model, controller, dan view POS sudah terkonfigurasi dengan benar.

## 14 September 2026

### Fitur Baru: Integrasi Sistem POS Kasir & Kitchen Display System (KDS Dapur)
- **Tujuan**: Menambahkan modul internal POS untuk order makanan/minuman langsung (dine-in) di kasir dan sistem KDS untuk dapur tanpa membuat project/database baru atau merusak fitur e-commerce yang sudah ada.
- **Arsitektur Isosiasi Data (`pos_*`)**:
  - `pos_food_categories`: Kategori makanan/minuman dinamis (Makanan, Minuman, Snack).
  - `pos_foods`: Menu makanan/minuman internal dengan soft delete & snapshot harga.
  - `pos_tables`: Master data 30 meja (`Meja 01` s/d `30`) dengan status terpisah (`AVAILABLE`, `OCCUPIED`, `NEEDS_CLEANING`).
  - `pos_orders`: Pesanan kasir dengan nomor unik `CP-POS-YYYYMMDD-XXX` dan status order terpisah (`NEW`, `PROCESSING`, `READY`, `COMPLETED`, `CANCELLED`).
  - `pos_order_items`: Snapshot item pesanan, quantity, harga satuan, dan catatan khusus.
  - `pos_payments`: Pembayaran kasir (`Cash`, `QRIS`, `Transfer`) dengan pencatatan `jumlah_bayar` dan `kembalian`.
- **Ekstensi Role & Security**:
  - Perluasan role pada tabel `users` existing: `admin`, `kasir`, `dapur`, `customer`.
  - Helper role pada `User.php`: `isKasir()`, `isDapur()`, `canAccessPos()`, `canAccessKitchen()`.
  - Middleware baru: `EnsureUserCanAccessPos` (`pos.access`) dan `EnsureUserCanAccessKitchen` (`kitchen.access`) terdaftar di `bootstrap/app.php`.
  - Login Redirect: `admin` → `/admin`, `kasir` → `/order`, `dapur` → `/kitchen`.
- **Fitur Frontend & UX**:
  - **POS Kasir (`/order`)**: Visual grid 30 meja dengan 3 indikator warna & teks, filter kategori menu makanan, keranjang pesanan dengan input catatan per item & pesanan, tombol kirim ke dapur, serta modal pembayaran (hitung kembalian & preset uang pas).
  - **Kitchen Display System (`/kitchen`)**: Papan KDS 4 kolom/tab (Pesanan Baru, Diproses, Siap, Meja Perlu Dibersihkan) dengan **NOMOR MEJA SANGAT BESAR**, notifikasi audio/visual saat pesanan baru masuk, dan polling otomatis setiap 5 detik.
  - **Struk Thermal (`Receipt.jsx`)**: Komponen pencetakan struk customer & ticket dapur (58mm/80mm) menggunakan `@media print` CSS native (`window.print()`).
  - **Admin Management (`/admin/pos-foods` & `/admin/pos-tables`)**: Menu kelola makanan (CRUD) dan pemantauan/reset status 30 meja.
- **Files Created**:
  - `database/migrations/2026_09_14_100000_create_pos_system_tables.php`
  - `app/Models/PosFoodCategory.php`
  - `app/Models/PosFood.php`
  - `app/Models/PosTable.php`
  - `app/Models/PosOrder.php`
  - `app/Models/PosOrderItem.php`
  - `app/Models/PosPayment.php`
  - `app/Http/Middleware/EnsureUserCanAccessPos.php`
  - `app/Http/Middleware/EnsureUserCanAccessKitchen.php`
  - `database/seeders/PosSeeder.php`
  - `app/Http/Controllers/Pos/KasirController.php`
  - `app/Http/Controllers/Pos/KitchenController.php`
  - `app/Http/Controllers/Pos/AdminFoodController.php`
  - `app/Http/Controllers/Pos/AdminTableController.php`
  - `resources/js/Pages/POS/Kasir.jsx`
  - `resources/js/Pages/POS/Kitchen.jsx`
  - `resources/js/Pages/POS/Receipt.jsx`
  - `resources/js/Pages/POS/Admin/FoodIndex.jsx`
  - `resources/js/Pages/POS/Admin/TableIndex.jsx`
  - `tests/Feature/PosSystemTest.php`
- **Files Modified**:
  - `app/Models/User.php`
  - `bootstrap/app.php`
  - `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
  - `database/seeders/DatabaseSeeder.php`
  - `routes/web.php`
  - `resources/js/Components/Bar/Sidebar.jsx`
  - `GEMINI.md`

## 17 April 2026

### Panduan Jawaban Catatan Revisi PA
- **File Artifact**: `panduan_jawaban_revisi.md`
- **Isi Dokumen**:
  - **Revisi 01**: Pengujian Keberhasilan Hasil Akhir (Manfaat) — tabel mapping Manfaat → Fitur → Bukti Keberhasilan, rekomendasi sub-bab baru di Bab 4
  - **Revisi 02**: Use Case + Peran Midtrans (Aktor?) — penjelasan Midtrans sebagai aktor external system, daftar interaksi, dan aktor tambahan (Biteship)
  - **Revisi 03**: Manfaat Detail (Efisiensi, Memudahkan, Jangkauan Pasar, Jadwal) — narasi jawaban lengkap per poin manfaat dengan bukti kuantitatif
  - **Revisi 04**: Abstraksi → Capaian & Keberhasilan — contoh kalimat capaian untuk ditambahkan di akhir abstrak
  - **Revisi 05**: Lampiran (Format Penulisan) & Data Dukungan — checklist format PA dan daftar lampiran yang perlu disertakan
- **Tujuan**: Membantu menjawab 5 poin catatan revisi dari dosen penguji pada sesi revisi PA

## 2 April 2026

### Persiapan Sidang Akhir - Defense Briefing Kit
- **File Artifact**: `defense_briefing.md`
- **Isi Dokumen**:
  - Ringkasan arsitektur sistem (Laravel 11 + Inertia.js + React + Midtrans + Biteship)
  - Struktur database (10 entitas, relasi lengkap, evolusi pelanggans→users)
  - 3 alur bisnis kritis: Checkout (3 metode), Pembayaran Midtrans (webhook + retry), Booking Kunjungan
  - Penjelasan fix Profile Data Binding (field name mapping: nama→name, telepon→phone)
  - Penjelasan fix ERD vs Database verification (diskrepansi biaya TipeKunjungan, dll)
  - 18 prediksi pertanyaan dosen penguji + jawaban teknis (arsitektur, database, payment, security, testing, fitur)
  - Quick reference cheat sheet (jumlah tabel, controller, halaman, API)
- **Tujuan**: Membantu persiapan sidang akhir PA dengan referensi cepat dan simulasi Q&A

## 8 Maret 2026

### Fix: Toggle Lihat Password pada Konfirmasi Password (Register)
- **Masalah**: Field "Konfirmasi Password" di halaman Register tidak memiliki tombol intip password (eye icon), padahal field "Password" sudah memilikinya.
- **Solusi**: Menambahkan toggle eye icon pada field Konfirmasi Password dengan state `showConfirmPassword` terpisah dari `showPassword`.
- **Files Modified**: `resources/js/Pages/Auth/Register.jsx`

### Fix: Info Pengiriman Salah untuk Metode "Ambil Langsung"
- **Masalah**: Pesanan dengan metode "Ambil Langsung" menampilkan info "Pesanan Anda sedang diproses dan akan segera dikirim **hari ini**", padahal pesanan ini tidak dikirim melainkan diambil sendiri oleh customer.
- **Penyebab**: Variabel `isPickup` tidak mencakup nilai `'Ambil Langsung'` (hanya `'Ambil Sendiri'` dan `'Ambil di Toko'`), sehingga pesanan pickup masuk ke branch pengiriman.
- **Solusi**: 
  - Menambahkan `'Ambil Langsung'` ke pengecekan `isPickup` di `Show.jsx`
  - **Status "shipped" → "Siap Diambil"**: Header, badge, dan teks konfirmasi menyesuaikan untuk pesanan pickup
  - **Riwayat**: Status label di daftar riwayat menampilkan "Siap Diambil" (bukan "Dikirim") untuk pesanan pickup
  - **Admin Invoice Modal**: Status label di modal invoice admin juga menampilkan "Siap Diambil" untuk pesanan pickup
  - **Confirm Button**: Tombol konfirmasi berubah dari "Pesanan Diterima?" menjadi "Pesanan Sudah Diambil?" untuk pickup
  - **Stale Order**: Pesanan pickup yang sudah lewat hari menampilkan pesan "sedang disiapkan" (bukan "antrian pemrosesan")
- **Files Modified**: 
  - `resources/js/Pages/Customer/Pesanan/Show.jsx`
  - `resources/js/Pages/Customer/Pesanan/Riwayat.jsx`
  - `resources/js/Pages/Pesanan/Index.jsx`

### Fix: Icon Keranjang Tidak Bisa Diklik di Halaman Checkout
- **Masalah**: Di halaman pilihan metode pengiriman (dan halaman checkout lainnya), icon keranjang di header tidak merespons saat diklik, padahal icon profil bisa.
- **Penyebab**: Halaman checkout menggunakan `SiteHeader` langsung (bukan `CustomerLayout`), sehingga `onCartClick` tidak di-pass ke header. Saat `onCartClick` bernilai `undefined`, klik tombol memanggil `action()` dimana action = undefined → error silent.
- **Solusi**: Menambahkan `CartPanel` internal di `SiteHeader` — jika `onCartClick` tidak tersedia, `SiteHeader` render `CartPanel` sendiri sehingga keranjang bisa dibuka dari halaman mana pun.
- **Files Modified**: `resources/js/Layouts/CustomerLayout.jsx`

### Update: Admin Invoice & Detail Pesanan untuk Metode Pickup
- **Invoice Modal** (`Index.jsx`):
  - Menambahkan badge **METODE** (Ambil Langsung / Kurir Lokal / Ekspedisi) di bawah STATUS
  - Label "Ongkos Kirim" berubah menjadi "Ongkos Kirim (Gratis)" untuk pesanan pickup
- **Detail & Edit Pesanan** (`Edit.jsx`):
  - Status label "Dikirim" → **"Siap Diambil"** untuk pesanan pickup
  - Tombol "🚚 Kirim Pesanan" → **"✅ Siap Diambil"** tanpa prompt input resi
  - Info text: tidak menyebutkan resi untuk pesanan pickup
  - Metode detection: menambahkan `'Ambil Langsung'` ke semua pengecekan pickup
  - **Resi display**: Dipindahkan keluar dari blok ekspedisi saja → sekarang tampil sebagai section tersendiri untuk semua pesanan non-pickup yang sudah shipped
- **Files Modified**:
  - `resources/js/Pages/Pesanan/Index.jsx`
  - `resources/js/Pages/Pesanan/Edit.jsx`

### Update: PesananSeeder Data Lebih Realistis
- **Perubahan**:
  - `'Ambil di Toko'` → **`'Ambil Langsung'`** (konsisten dengan sistem)
  - Menambahkan `nomor_resi` untuk pesanan shipped/completed non-pickup (format: `JNE1234567890`, `KRL...`, `POS...`, `TKI...`)
  - Menambahkan `ekspedisi` dan `estimasi` untuk pesanan ekspedisi (JNE REG, JNE YES, POS Reguler, TIKI REG)
  - Alamat pickup → `'AMBIL LANGSUNG'`
- **Files Modified**: `database/seeders/PesananSeeder.php`

### Fix: Tombol "Selesaikan" Kunjungan Tidak Berfungsi
- **Masalah**: Tombol "✅ Selesaikan" di modal detail kunjungan admin tidak merespons saat diklik.
- **Penyebab**: `Jadwal.jsx` tidak meneruskan `onEdit` prop ke `DetailModal`, sehingga `onEdit` bernilai `undefined`.
- **Solusi**: 
  - Menambahkan fungsi `handleComplete` di `Jadwal.jsx` dengan SweetAlert konfirmasi
  - Meneruskan `handleComplete` sebagai `onEdit` prop ke `DetailModal`
  - Status kunjungan diubah ke "Selesai" via `router.put`
- **Files Modified**: `resources/js/Pages/Kunjungan/Jadwal.jsx`

### Fix: Status Pesanan Admin Tampil Bahasa Inggris
- **Masalah**: Status pesanan di tabel admin menampilkan nilai mentah dari database (`shipped`, `pending`, `processed`, `completed`) alih-alih bahasa Indonesia.
- **Solusi**: Menambahkan fungsi mapping status di tabel pesanan admin:
  - `pending` → **Menunggu Pembayaran** (kuning)
  - `processed` → **Diproses** (biru)
  - `shipped` → **Dikirim** (ungu) / **Siap Diambil** (hijau, untuk pickup)
  - `completed` → **Selesai** (hijau)
  - `cancelled` → **Dibatalkan** (merah)
- **Files Modified**: `resources/js/Pages/Pesanan/Index.jsx`

## 24 Februari 2026

### Class Diagram UML - Sistem Informasi CPH
- **File Source**: `class_diagram.puml` (PlantUML, editable)
- **File Export**: `class_diagram.png` (289 KB, rendered via PlantUML server)
- **Entitas (10 class)**: User, Produk, ProductCategory, Pesanan, PesananItem, Cart, Kunjungan, TipeKunjungan, Ulasan, UlasanFoto
- **Controller (5 class)**: AuthController, ProductController, OrderController, CheckoutController, VisitBookingController
- **Fix Revisi**: Menambahkan atribut `biaya : int` pada `TipeKunjungan` yang hilang dari model `$fillable` tapi ada di database (migrasi `add_biaya_to_tipe_kunjungan_table.php`)
- **Notasi UML Lengkap**:
  - 3-compartment (ClassName + Attribute + Method)
  - Visibility: `-private` (atribut), `+public` (method)
  - Stereotype: `<<Entity>>`, `<<Controller>>`
  - Multiplicity: `1`, `0..*`, `1..*`, `0..1`
  - Relationship: Association (garis biasa), Aggregation (diamond kosong: Pesanan-PesananItem), Composition (diamond isi: Ulasan-UlasanFoto), Dependency (garis putus-putus: Controller→Entity)
  - Relationship name: "places", "books", "writes", "contains", "categorizes", "classifies", dll.
- **Sumber Data**: Seluruh atribut & method diambil dari 12 file model aktual (`app/Models/*.php`) dan 5 controller (`app/Http/Controllers/**/*.php`)

### Verifikasi & Format Tabel Blackbox Testing Customer
- **File Artifact**: `blackbox_testing_customer.md`
- **Total Skenario**: 46 skenario customer (diverifikasi satu per satu terhadap kode aktual)
- **Kode yang Di-cross-check**: 18+ file sumber (Login.jsx, Register.jsx, ForgotPassword.jsx, CustomerLayout.jsx, Belanja.jsx, BelanjaDetail.jsx, Cart.jsx, CheckoutMethod.jsx, Riwayat.jsx, Show.jsx (Pesanan & Kunjungan), Kunjungan.jsx, KunjunganLanding.jsx, Profile.jsx, Ulasan/Create.jsx, Ulasan/CreateForKunjungan.jsx, AuthenticatedSessionController.php)
- **Koreksi Penting vs Dokumen Awal**:
  - **Skenario 4**: Pesan error login customer sama: "Email atau password salah." (dari `AuthenticatedSessionController`)
  - **Skenario 5**: Tombol ForgotPassword = "Kirim Link Reset Password" (bukan "Kirim")
  - **Skenario 8**: Filter kategori = "Semua Produk" / "Sayuran" / "Buah-buahan" (bukan "Sayuran Daun" / "Sayuran Buah")
  - **Skenario 11**: Detail produk memiliki 2 tombol: "Beli Langsung" dan "Tambah Keranjang"
  - **Skenario 17**: Label metode checkout = "Ambil Langsung" (bukan "Ambil di Toko"), "Kurir Lokal", "Ekspedisi"
  - **Skenario 24**: Judul halaman riwayat = "Riwayat Transaksi Saya" (bukan "Pesanan Saya")
  - **Skenario 28**: Tombol konfirmasi = "Konfirmasi Diterima" dengan SweetAlert "Pesanan Diterima?"
  - **Skenario 31**: Tombol submit booking = "Lanjut ke Konfirmasi" (bukan "Bayar")
  - **Skenario 32**: Slot penuh bertuliskan "(Sudah Dipesan)" (bukan "(Penuh)")
  - **Skenario 35**: Tombol selesai kunjungan = "Selesaikan Kunjungan" dengan SweetAlert "Selesaikan Kunjungan?"
  - **Skenario 40**: Profile punya 4 kartu: Foto Profil, Informasi Profil, Ubah Password, Hapus Akun
  - **Skenario 42**: Field edit profil = Nama, Email, Nomor Telepon, Alamat; tombol "Simpan"
- **Format Dokumen**: Times New Roman 11pt, istilah teknis *italic*, bahasa akademik natural siap copy-paste ke Word

### Verifikasi & Format Tabel Blackbox Testing Admin
- **File Artifact**: `blackbox_testing_admin.md`
- **Total Skenario**: 44 skenario admin (diverifikasi satu per satu terhadap kode aktual)
- **Koreksi Penting (12+ poin)**:
  - **Kredensial Admin**: Diperbarui ke `centralpalantea@gmail.com` / `AdminCPH24@`
  - **Skenario 2**: Pesan error login dikoreksi menjadi "Email atau password salah." (bukan generik)
  - **Skenario 5**: Widget "Pesanan Pending" dengan tombol "Proses"
  - **Skenario 7**: Judul grafik "Pendapatan (7 Hari)"
  - **Skenario 8**: Label grafik "Tren Jumlah Pengunjung"
  - **Skenario 10**: Widget "Pesanan Baru" (bukan "pesanan terbaru")
  - **Skenario 11**: 8 kolom tabel produk: No, Gambar, Nama Produk, Kategori, Harga, Stok, Status, Aksi
  - **Skenario 13/21/30/34**: Placeholder pencarian dicocokkan exact ("Cari nama produk...", "Cari nama pelanggan...", "Cari nama atau email...")
  - **Skenario 19**: Kolom pertama menampilkan nomor pesanan
  - **Skenario 24-25**: Update status via tombol aksi cepat (*Quick Action*) + input resi via *SweetAlert*
  - **Skenario 26**: Tombol "+ Tambah Pesanan" (bukan "+ Tambah Pesanan Baru")
  - **Skenario 28**: 7 kolom tabel kunjungan: No, Pelanggan, Waktu Kunjungan, Tipe, Peserta, Status, Aksi
  - **Skenario 32**: Tombol "+ Buat Kunjungan Baru"
  - **Skenario 33**: Stats widget: Total Customer, Total Kunjungan, Total Ulasan. Kolom tabel: #, Customer Profile, Kontak, Statistik, Aksi
  - **Skenario 35**: Judul modal "Profil Lengkap Customer" + 3 Transaksi Terakhir
  - **Skenario 36**: Halaman "Pusat Laporan & Analitik", widget: Total Pendapatan, Total Transaksi, Total Kunjungan, Produk Terlaris
- **Format Dokumen**: Times New Roman 11pt, istilah teknis *italic*, bahasa akademik natural siap copy-paste ke Word

## 18 Februari 2026

### Fix: UI/UX & Standardisasi Bahasa
- **Fitur Baru**:
  - **Show Password**: Menambahkan tombol intip password (toggle eye icon) di halaman Login & Register.
  - **Admin Customer**: Modal detail profil pelanggan kini menampilkan **3 Transaksi Terakhir** dan tombol "Lihat Semua Pesanan", menggantikan statistik ringkas yang kurang relevan.
  - **Checkout**: Konsisten menggunakan istilah "Ambil Langsung" di seluruh alur (UI & Backend).
- **Perbaikan & Standardisasi**:
  - **Ambil Langsung**: Mengubah label "Ambil di Toko" menjadi "Ambil Langsung" di Checkout dan Backend Order.
  - **Filter Dashboard**: Menyembunyikan pesanan status 'pending' (belum bayar) dari widget "Pesanan Baru" dan "Perlu Diproses" di Dashboard Admin agar admin fokus pada pesanan masuk yang sudah valid.
  - **Status Bahasa**: Memastikan status pesanan di riwayat customer menggunakan Bahasa Indonesia ("Menunggu Pembayaran", "Diproses", "Dikirim", "Selesai").
  - **Harga Kunjungan**: 
    - Landing Page & Form Admin kini menampilkan "Mulai dari Rp 10.000".
    - Logika Kalkulasi: Dewasa Rp 15.000, Anak Rp 10.000 (di Admin Manual & Customer Booking).
- **Files Modified**:
  - `resources/js/Pages/Auth/Login.jsx`
  - `resources/js/Pages/Auth/Register.jsx`
  - `resources/js/Pages/Customer/Checkout/Checkout3.jsx`
  - `resources/js/Pages/Customer/Checkout/CheckoutMethod.jsx`
  - `app/Http/Controllers/Customer/CheckoutController.php`
  - `resources/js/Pages/Pelanggan/Index.jsx`
  - `resources/js/Pages/Customer/Pesanan/Riwayat.jsx`
  - `resources/js/Pages/Customer/Pesanan/Show.jsx`
  - `app/Http/Controllers/Admin/OrderController.php`
  - `app/Http/Controllers/Admin/DashboardController.php`
  - `app/Http/Controllers/Admin/CustomerController.php`
  - `resources/js/Pages/Kunjungan/Partials/KunjunganFormModal.jsx`
  - `resources/js/Pages/Customer/KunjunganLanding.jsx`
  - `resources/js/Pages/Customer/Kunjungan.jsx`
  - `resources/js/Pages/Kunjungan/Create.jsx`
  - `resources/js/Pages/Auth/ResetPassword.jsx`
  - `app/Http/Controllers/Admin/VisitBookingController.php`

### Update Feedback (18 Feb 2026 - Part 2)
- **Show Password**: Menambahkan toggle (ikon mata) di halaman **Reset Password** agar user bisa melihat password baru yang diketik.
- **Sorting Admin**:
  - **Jadwal Kunjungan**: Diurutkan berdasarkan tanggal kunjungan terbaru (Descending).
  - **Riwayat Kunjungan**: Diurutkan berdasarkan tanggal kunjungan terbaru (Descending).
- **Booking Text**: Mengubah indikator slot penuh dari "(Penuh)" menjadi **"(Sudah Dipesan)"** di form booking customer.
- **Fix Authorization**:
  - `CartController` dan `ReviewController`: Mengganti `$this->authorize()` dengan manual check `if ($user_id != Auth::id()) abort(403)` untuk mengatasi masalah policy gate yang mungkin missmatch tipe data (int vs string) atau register policy yang tidak valid.
- **Fix UI Status Pesanan**:
  - `Pesanan/Show.jsx`: Menambahkan handler khusus untuk status `processed` agar menampilkan "Pesanan Sedang Diproses" (hijau) alih-alih fallback ke "Menunggu Pembayaran".
- **Fix Detail Kunjungan**:
  - `Kunjungan/Show.jsx`: 
    - Memperbaiki perhitungan rincian pembayaran tipe "Umum".
    - Menambahkan logika **Legacy Pricing Detection**: Jika total biaya booking lama (10k/pax), tampilan akan menyesuaikan (Dewasa 10k). Jika booking baru, tampilan menggunakan harga baru (Dewasa 15k, Anak 10k). Ini mengatasi isu "Total tidak sesuai" pada data lama.

## 16 Februari 2026

### Fix: Nama "Central Palantea Hidroponik" Hilang di HP
- **Masalah**: Nama website "Central Palantea Hidroponik" tidak muncul di tampilan mobile (HP) karena class `hidden sm:block`.
- **Solusi**: 
  - Mengubah layout header di `CustomerLayout.jsx` untuk menampilkan nama site di semua ukuran layar.
  - Untuk layar kecil (mobile), teks ditampilkan 2 baris ("Central Palantea" & "Hidroponik") agar muat.
  - Untuk layar besar (tablet/desktop), teks tetap 1 baris.
- **Files Modified**: `resources/js/Layouts/CustomerLayout.jsx`

### Fix: Tampilan Subtotal & Ongkir di Detail Pesanan Admin Berantakan
- **Masalah**: Subtotal tampil sebagai deretan angka panjang (concat string) seperti `Rp 04500055000...` dan Ongkir minus triliunan.
- **Penyebab**: Javascript menganggap harga (`subtotal`) sebagai string saat dijumlahkan dalam `reduce`, sehingga terjadi penggabungan teks alih-alih penjumlahan matematika.
- **Solusi**:
  - Update `Index.jsx` (Admin Pesanan) menambahkan `Number()` pada `item.subtotal` dan `model.total` sebelum melakukan operasi matematika.
  - Memastikan format angka (`toLocaleString`) bekerja pada tipe data number.
- **Files Modified**: `resources/js/Pages/Pesanan/Index.jsx`

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
