import React, { useState } from 'react';
import {
  FiBookOpen, FiX, FiCheckCircle, FiDollarSign, FiTv,
  FiShoppingBag, FiCoffee, FiPrinter, FiEdit2, FiInfo,
  FiArrowRight, FiShield, FiAlertTriangle, FiSmartphone,
  FiGrid, FiFolderPlus, FiPlus, FiClock, FiHelpCircle, FiSettings
} from 'react-icons/fi';

export default function CashierGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('order_baru');

  if (!isOpen) return null;

  const tabs = [
    { id: 'order_baru', label: '1. Pesanan Baru', icon: FiShoppingBag },
    { id: 'pesanan_tambahan', label: '2. Pesanan Tambahan', icon: FiCoffee },
    { id: 'kelola_menu', label: '3. Input & Kelola Menu', icon: FiPlus },
    { id: 'kelola_kategori', label: '4. Input Kategori', icon: FiFolderPlus },
    { id: 'kelola_meja', label: '5. Manajemen 30 Meja', icon: FiGrid },
    { id: 'monitor', label: '6. Monitor Pesanan', icon: FiTv },
    { id: 'laporan_koreksi', label: '7. Laporan & Koreksi Bayar', icon: FiDollarSign },
    { id: 'struk_printer', label: '8. Struk & Printer Thermal', icon: FiPrinter },
    { id: 'sop_faq', label: '9. SOP & Troubleshooting FAQ', icon: FiHelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* HEADER MODAL */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <FiBookOpen size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                Buku Panduan Lengkap Operasional Kasir & Admin POS
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Central Palantea Hidroponik — Panduan Langkah demi Langkah Seluruh Fitur Website
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-gray-100/80 border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-gray-800 text-xs sm:text-sm leading-relaxed custom-scrollbar">

          {/* TAB 1: PESANAN BARU */}
          {activeTab === 'order_baru' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-black text-sm text-emerald-900 flex items-center gap-2 mb-1">
                  <FiCheckCircle className="text-emerald-600" /> Panduan Alur Pesanan Baru di Kasir (/order)
                </h4>
                <p className="text-xs text-emerald-800">
                  Dijalankan saat tamu baru tiba di kasir kantin untuk memesan makanan dan mengambil nomor meja.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-gray-50 border rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">1</div>
                  <div>
                    <h5 className="font-bold text-gray-900">Pilih Nomor Antrian / Meja Hijau (AVAILABLE)</h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Pada grid 30 nomor meja di bagian atas POS Kasir, klik salah satu nomor berlatar <strong>🟢 Hijau (Free)</strong>, misal Meja No. 05. Serahkan nomor antrian akrilik fisik yang bersangkutan kepada tamu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-gray-50 border rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">2</div>
                  <div>
                    <h5 className="font-bold text-gray-900">Pilih Menu Hidangan di Katalog</h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Klik kartu foto makanan atau minuman di katalog sebelah kiri. Menu otomatis masuk ke keranjang pesanan.
                    </p>
                    <ul className="list-disc pl-4 text-[11px] text-gray-600 mt-1 space-y-0.5">
                      <li><strong>Ubah Porsi:</strong> Klik tombol <strong>(+)</strong> atau <strong>(-)</strong> di keranjang.</li>
                      <li><strong>Cari Menu Cepat:</strong> Ketik nama hidangan pada kotak pencarian di atas katalog.</li>
                      <li><strong>Filter Kategori:</strong> Klik tab kategori (Makanan Utama, Olahan Mie, Snack, Kopi, Non-Kopi).</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-gray-50 border rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">3</div>
                  <div>
                    <h5 className="font-bold text-gray-900">Tulis Catatan Masakan & Nama Tamu (Opsional)</h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Isi catatan khusus pelanggan pada kolom catatan di bawah nama menu (misal: <em>"Pedas sedang"</em>, <em>"Es sedikit"</em>, <em>"Kuah dipisah"</em>). Catatan ini dijamin akan tercetak jelas di tiket dapur.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-gray-50 border rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">4</div>
                  <div>
                    <h5 className="font-bold text-gray-900">Pilih Metode Pembayaran (4 Opsi Fleksibel)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="p-2.5 bg-white border border-emerald-300 rounded-lg text-xs">
                        <strong className="text-emerald-700">💵 Tunai (Cash):</strong> Ketikkan nominal uang kertas yang diserahkan pelanggan. Sistem otomatis menghitung nominal kembalian.
                      </div>
                      <div className="p-2.5 bg-white border border-blue-300 rounded-lg text-xs">
                        <strong className="text-blue-700">📱 QRIS:</strong> Nominal tagihan otomatis diisikan 100% pas. Tunjukkan barcode stand QRIS Palantea ke tamu.
                      </div>
                      <div className="p-2.5 bg-white border border-purple-300 rounded-lg text-xs">
                        <strong className="text-purple-700">⚡ SPLIT (Tunai + QRIS):</strong> Pelanggan bayar sebagian tunai dan sisanya via QRIS. Masukkan nominal di masing-masing kolom.
                      </div>
                      <div className="p-2.5 bg-white border border-amber-300 rounded-lg text-xs">
                        <strong className="text-amber-700">⚠️ Bayar Nanti (UNPAID):</strong> Untuk tamu yang makan dahulu dan membayar saat hidangan tiba / selesai makan.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-gray-50 border rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">5</div>
                  <div>
                    <h5 className="font-bold text-gray-900">Kirim Pesanan ke Dapur & Cetak Struk</h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Klik tombol hijau <strong>"🍳 Kirim Pesanan ke Dapur & Cetak Struk"</strong>. Printer thermal akan mencetak 2 lembar: <strong>Lembar 1 (Struk Customer)</strong> untuk tamu dan <strong>Lembar 2 (Tiket Dapur)</strong> untuk juru masak.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PESANAN TAMBAHAN */}
          {activeTab === 'pesanan_tambahan' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-black text-sm text-blue-900 flex items-center gap-2 mb-1">
                  <FiCoffee className="text-blue-600" /> Panduan Pesanan Tambahan di Meja yang Sama (Add-On Order)
                </h4>
                <p className="text-xs text-blue-800">
                  Digunakan ketika pelanggan yang sedang duduk di meja ingin menambah makanan, minuman, atau camilan tanpa perlu mengganti nomor antrian meja.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900">Langkah 1: Klik Nomor Meja Merah (OCCUPIED)</h5>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Klik nomor meja tamu di grid atas (misal Meja 05). Panel kanan akan menampilkan seluruh menu yang sedang dinikmati tamu.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900">Langkah 2: Klik Tombol [+ Tambah Menu]</h5>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Tekan tombol biru <strong>[+ Tambah Menu]</strong>. Kotak biru bertuliskan <em>Keranjang Menu Tambahan</em> akan terbuka.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900">Langkah 3: Pilih Menu Tambahan di Katalog Menu</h5>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Klik hidangan yang ingin ditambah di katalog kiri (misal: tambah 2x Teh Es dan 1x French Fries). Atur jumlah porsi.
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900">Langkah 4: Pilih Opsi Pembayaran Menu Tambahan</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 text-xs">
                    <div className="p-2.5 bg-white border border-blue-300 rounded-lg">
                      <strong className="text-blue-800">⚡ Bayar Nanti (Default):</strong>
                      <p className="text-gray-600 text-[11px] mt-0.5">Nominal menu tambahan otomatis diakumulasikan ke total tagihan meja. Tamu membayar sekaligus saat selesai makan.</p>
                    </div>
                    <div className="p-2.5 bg-white border border-emerald-300 rounded-lg">
                      <strong className="text-emerald-800">💵 Tunai / 📱 QRIS:</strong>
                      <p className="text-gray-600 text-[11px] mt-0.5">Jika tamu ingin langsung membayar lunas menu tambahannya di kasir saat itu juga.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900">Langkah 5: Klik [🍳 Kirim Menu Tambahan ke Dapur]</h5>
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-1">
                    <strong>💡 Aturan Struk Cerdas:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      <li><strong>Dapur:</strong> Hanya mencetak <em>Ticket Dapur Tambahan</em> berisi menu yang baru dipesan dengan badge: <code>★ HANYA MASAK MENU TAMBAHAN INI ★</code>. Dapur dijamin tidak akan memasak ulang pesanan awal!</li>
                      <li><strong>Customer:</strong> Struk pelanggan mencantumkan seluruh pesanan secara transparan: <code>▶ PESANAN AWAL</code> dan <code>▶ PESANAN TAMBAHAN</code> lengkap dengan subtotal masing-masing dan Total Akumulasi Meja.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INPUT & KELOLA MENU */}
          {activeTab === 'kelola_menu' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <h4 className="font-black text-sm text-teal-900 flex items-center gap-2 mb-1">
                  <FiPlus className="text-teal-600" /> Panduan Input & Kelola Menu Makanan / Minuman (/admin/pos-foods)
                </h4>
                <p className="text-xs text-teal-800">
                  Panduan lengkap menambahkan menu baru ke kasir, mengupload foto produk, mengubah harga, dan menonaktifkan menu saat stok habis.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm text-emerald-800">
                    Cara Menambahkan Menu Baru:
                  </h5>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-700">
                    <li>Buka menu <strong>Kelola Menu Makanan</strong> di sidebar (atau via URL <code>/admin/pos-foods</code>).</li>
                    <li>Klik tombol hijau <strong>`[+ Tambah Menu]`</strong> di pojok kanan atas.</li>
                    <li>
                      <strong>Isi Kolom Formulir:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-gray-600">
                        <li><strong>Kategori Menu:</strong> Pilih kategori yang sesuai (misal: *Makanan Utama*).</li>
                        <li><strong>Nama Menu:</strong> Ketikkan nama hidangan lengkap (contoh: <em>"Nasi Ayam Barendo Palantea"</em>).</li>
                        <li><strong>Harga Satuan (Rp):</strong> Masukkan angka harga tanpa titik (contoh: ketik <code>25000</code>).</li>
                        <li><strong>Deskripsi Menu:</strong> Tuliskan keterangan rasa/porsi (contoh: <em>"Ayam kremes telur barendo khas Minang lengkap dengan sambal"</em>).</li>
                        <li><strong>Status Menu:</strong> Pilih <strong>Aktif</strong> agar menu langsung muncul di layar kasir.</li>
                        <li><strong>Foto Produk / Gambar:</strong> Klik <em>Choose File</em>, pilih foto PNG atau JPG hidangan (Maksimal 2 MB).</li>
                      </ul>
                    </li>
                    <li>Klik tombol hijau <strong>`[Simpan Menu Makanan]`</strong>. Menu baru seketika aktif dan siap dipesan!</li>
                  </ol>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm text-blue-800">
                    Cara Mengubah Harga atau Mengganti Foto Menu:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Cari menu yang ingin diubah di tabel, lalu klik tombol biru <strong>`[✏️ Edit]`</strong>. Ubah harga atau pilih foto baru, lalu klik <strong>`[Perbarui Menu]`</strong>.
                  </p>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm text-amber-800">
                    Cara Menandai Menu Habis (Sold Out) Tanpa Menghapusnya:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Jika bahan baku makanan habis sementara, <strong>jangan hapus menunya</strong>! Cukup klik <strong>`[✏️ Edit]`</strong>, ubah kolom Status menjadi <strong>`Tidak Aktif`</strong>, lalu simpan. Menu akan otomatis disembunyikan dari layar kasir sehingga tidak ada kasir yang keliru memesan menu yang habis.
                  </p>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm text-red-800">
                    Cara Menghapus Menu yang Sudah Tidak Dijual:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Klik tombol merah <strong>`[🗑️ Hapus]`</strong> pada baris menu. Menu akan dihapus secara aman (*soft delete*) sehingga riwayat laporan penjualan terdahulu yang pernah memuat menu ini tetap utuh dan aman.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INPUT KATEGORI */}
          {activeTab === 'kelola_kategori' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h4 className="font-black text-sm text-purple-900 flex items-center gap-2 mb-1">
                  <FiFolderPlus className="text-purple-600" /> Panduan Input & Kelola Kategori Menu (/admin/pos-foods)
                </h4>
                <p className="text-xs text-purple-800">
                  Kategori berfungsi sebagai tab filter cepat di layar kasir agar kasir dapat menemukan makanan dan minuman dalam 1 detik.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm">Langkah Menambahkan Kategori Baru:</h5>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-700">
                    <li>Buka halaman <strong>Kelola Menu Makanan</strong> (`/admin/pos-foods`).</li>
                    <li>Di samping tombol tambah menu, klik tombol hijau <strong>`[+ Tambah Kategori]`</strong>.</li>
                    <li>
                      <strong>Isi Data Kategori:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-gray-600">
                        <li><strong>Nama Kategori:</strong> Masukkan nama kategori baru (contoh: <code>Snack & Camilan</code>, <code>Minuman Kopi</code>, <code>Minuman Segar</code>, <code>Olahan Mie</code>).</li>
                        <li><strong>Deskripsi Kategori:</strong> Masukkan keterangan kelompok menu (contoh: <em>"Aneka camilan gurih dan gorengan khas Palantea"</em>).</li>
                      </ul>
                    </li>
                    <li>Klik tombol <strong>`[Simpan Kategori]`</strong>.</li>
                    <li>Kategori baru akan langsung tampil di tab POS kasir dan dropdown input menu.</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 border rounded-xl">
                  <h5 className="font-bold text-gray-900 text-xs sm:text-sm">💡 Tips Rekomendasi Struktur Kategori di Palantea:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="p-2 bg-white rounded border">
                      <strong>1. Makanan Utama:</strong> Nasi Ayam Barendo, Mienas, Nasi Dadar, Nasi Ramas.
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>2. Olahan Mie:</strong> Indomie Rebus Telur, Indomie Goreng, Pop Mie.
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>3. Snack & Camilan:</strong> Pempek Palantea, French Fries, Nugget, Risolles, Pisang Kipas.
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>4. Minuman Kopi:</strong> Kopi Hitam, Cappuccino, Kopi Susu, Kopi Ginseng.
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>5. Minuman Non-Kopi:</strong> Teh Es, Jus Kale, Matcha, Lychee Tea, Wedang Jahe.
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>6. Menu Ekstra:</strong> Nasi Putih, Telur Dadar, Telur Ceplok, Telur Rebus.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MANAJEMEN 30 MEJA */}
          {activeTab === 'kelola_meja' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-black text-sm text-amber-900 flex items-center gap-2 mb-1">
                  <FiGrid className="text-amber-600" /> Panduan Manajemen 30 Nomor Antrian Meja Kantin (/admin/pos-tables)
                </h4>
                <p className="text-xs text-amber-800">
                  Palantea menggunakan 30 nomor antrian meja fisik (akrilik No. 01 - No. 30). Pahami arti 4 warna meja berikut:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-green-50 border border-green-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500"></span>
                    <strong className="text-green-900 text-sm">🟢 AVAILABLE (Tersedia / Free)</strong>
                  </div>
                  <p className="text-gray-700">Meja dalam kondisi kosong dan bersih. Nomor antrian akrilik ada di meja kasir dan siap diserahkan ke tamu baru.</p>
                </div>

                <div className="p-3 bg-red-50 border border-red-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500"></span>
                    <strong className="text-red-900 text-sm">🔴 OCCUPIED (Terisi / Dipakai)</strong>
                  </div>
                  <p className="text-gray-700">Tamu sedang aktif duduk di meja menunggu masakan atau sedang makan. Klik meja ini untuk menambah menu atau memproses bayar.</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                    <strong className="text-amber-900 text-sm">🟡 NEEDS_CLEANING (Perlu Dibersihkan)</strong>
                  </div>
                  <p className="text-gray-700">Tamu sudah selesai makan dan lunas bayar. Setelah pelayan mengangkat piring kotor dan mengelap meja, kasir mengklik meja kuning ini lalu menekan tombol <strong>`[🧹 Kosongkan & Jadikan Tersedia]`</strong> agar meja kembali hijau.</p>
                </div>

                <div className="p-3 bg-gray-100 border border-gray-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-gray-400"></span>
                    <strong className="text-gray-800 text-sm">⚪ UNAVAILABLE (Tidak Tersedia)</strong>
                  </div>
                  <p className="text-gray-700">Nomor meja dinonaktifkan sementara (misal nomor akrilik hilang atau meja sedang diperbaiki).</p>
                </div>
              </div>

              <div className="p-3 bg-white border rounded-xl space-y-2">
                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">Fitur Reset Semua Meja di Pagi Hari (Tombol Oranye):</h5>
                <p className="text-xs text-gray-600">
                  Setiap pagi sebelum membuka kasir, Admin/Kasir cukup membuka halaman <code>/admin/pos-tables</code> lalu mengklik tombol oranye <strong>`[🔄 Reset Semua Nomor (Set Available)]`</strong>. Seluruh 30 nomor meja otomatis serentak kembali menjadi hijau bersih!
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: MONITOR PESANAN */}
          {activeTab === 'monitor' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h4 className="font-black text-sm text-indigo-900 flex items-center gap-2 mb-1">
                  <FiTv className="text-indigo-600" /> Monitor Pesanan Kasir (Pengganti Kitchen Display)
                </h4>
                <p className="text-xs text-indigo-800">
                  Pusat kendali operasional kasir untuk memantau makanan yang sedang dimasak, pesanan yang belum dibayar, dan pengantaran menu.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <FiCheckCircle className="text-emerald-600" /> Tombol 🍽️ Antar pada Tiap Menu:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Ketika staf kantin selesai memasak hidangan dan membawanya ke meja pelanggan, kasir cukup mengklik tombol <strong>[🍽️ Antar]</strong> pada menu tersebut. Tombol akan berubah menjadi <strong>[✅ Diantar]</strong> berwarna hijau. Kasir bisa melihat persentase pengantaran makanan di tiap meja.
                  </p>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <FiDollarSign className="text-amber-600" /> Tombol 💳 Tagih & Bayar Kasir Langsung:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Untuk pesanan yang berstatus <strong>UNPAID (Belum Bayar)</strong>, kartu monitor pesanan memiliki tombol oranye <strong>[💳 Tagih & Bayar Kasir]</strong>. Kasir dapat langsung menerima pembayaran (Cash, QRIS, Split) tanpa perlu berpindah ke halaman kasir POS.
                  </p>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <FiCheckCircle className="text-green-600" /> Tombol ✅ Tandai Selesai & Meja Kosong:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Ketika pelanggan telah selesai makan dan meninggalkan meja, tekan tombol hijau <strong>[✅ Tandai Selesai & Meja Kosong]</strong>. Pesanan dinyatakan selesai dan nomor meja otomatis kembali hijau <strong>(AVAILABLE)</strong> agar siap diberikan ke tamu berikutnya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LAPORAN & KOREKSI BAYAR */}
          {activeTab === 'laporan_koreksi' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h4 className="font-black text-sm text-purple-900 flex items-center gap-2 mb-1">
                  <FiDollarSign className="text-purple-600" /> Laporan Penjualan & Fitur Koreksi Salah Bayar (/admin/pos-reports)
                </h4>
                <p className="text-xs text-purple-800">
                  Solusi cepat jika kasir salah menekan metode bayar (misal tertekan Cash padahal pelanggan bayar via QRIS), serta pelunasan pesanan unpaid dari laporan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm text-amber-800">
                    <FiEdit2 className="text-amber-600" /> Cara Mengoreksi Salah Bayar (Cash ➡️ QRIS / Sebaliknya):
                  </h5>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-700">
                    <li>Buka menu <strong>Laporan Penjualan Kantin</strong> di sidebar (atau via URL <code>/admin/pos-reports</code>).</li>
                    <li>Cari transaksi yang ingin diperbaiki di tabel Overview Transaksi.</li>
                    <li>Klik <strong>Badge Metode Pembayaran</strong> (misal bertuliskan <em>"Cash"</em>) atau tekan tombol pensil kuning <strong>[✏️ Edit]</strong>.</li>
                    <li>Pilih metode pembayaran yang benar: <strong>[📱 QRIS]</strong> atau <strong>[💵 Cash]</strong> atau <strong>[⚡ SPLIT]</strong>.</li>
                    <li>Sistem otomatis mengalokasikan 100% nominal tagihan ke pos yang tepat. Kasir juga bisa memperbaiki nama pelanggan, nomor meja, atau mengisi catatan alasan koreksi.</li>
                    <li>Klik <strong>"💾 Simpan Perubahan"</strong>. Data omzet kas fisik dan mutasi rekening QRIS langsung diperbarui secara akurat!</li>
                  </ol>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm text-emerald-800">
                    <FiDollarSign className="text-emerald-600" /> Pelunasan Pesanan UNPAID dari Laporan:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Pada transaksi yang berstatus <strong>⚠️ BELUM BAYAR (UNPAID)</strong>, kasir dapat langsung menekan tombol kuning <strong>[💳 Bayar]</strong> di kolom aksi. Masukkan pembayaran (Cash / QRIS / Split) untuk melunasi tagihan saat itu juga.
                  </p>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-2">
                  <h5 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm text-blue-800">
                    <FiPrinter className="text-blue-600" /> Ekspor Laporan ke PDF, Excel, dan CSV:
                  </h5>
                  <p className="text-xs text-gray-600">
                    Klik dropdown <strong>`[Ekspor ▼]`</strong> pada kartu laporan: unduh berkas <strong>PDF Resmi</strong> (kop surat Palantea A4 landscape), <strong>Excel (.xlsx)</strong>, atau <strong>CSV</strong> untuk arsip pembukuan keuangan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STRUK & PRINTER THERMAL */}
          {activeTab === 'struk_printer' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <h4 className="font-black text-sm text-teal-900 flex items-center gap-2 mb-1">
                  <FiPrinter className="text-teal-600" /> Panduan Cetak Struk & Setting Printer Thermal (58mm / 80mm)
                </h4>
                <p className="text-xs text-teal-800">
                  Memahami setelan printer browser agar struk thermal tercetak pekat, pas di tengah kertas, dan tidak terpotong.
                </p>
              </div>

              <div className="p-3 bg-white border rounded-xl space-y-2">
                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">Setelan Wajib di Dialog Cetak Browser (Chrome / Edge):</h5>
                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                  <li><strong>Destination / Printer:</strong> Pilih printer kasir Anda (misal POS-80 atau Thermal 58mm).</li>
                  <li><strong>Paper Size:</strong> Pilih ukuran kertas sesuai printer (**80mm** atau **58mm**).</li>
                  <li><strong>Margins:</strong> Wajib diubah ke **`None`** (Tanpa Margin).</li>
                  <li><strong>Scale:</strong> Pilih **`Default`** atau 100%.</li>
                  <li><strong>Background graphics:</strong> Wajib **dicentang** agar logo dan garis pembatas tercetak tajam.</li>
                  <li><strong>Headers and footers:</strong> Wajib **dihilangkan centangnya** agar tanggal URL browser tidak ikut tercetak di atas/bawah struk.</li>
                </ul>
              </div>

              <div className="p-3 bg-white border rounded-xl space-y-2">
                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">Pilihan Mode Cetak di Layar Kasir:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 border rounded-lg">
                    <strong>✂️ 2 Lembar (Klik 2x):</strong> Lembar 1 untuk Customer, potong kertas, lalu klik tombol untuk mencetak Lembar 2 untuk Dapur.
                  </div>
                  <div className="p-2 bg-gray-50 border rounded-lg">
                    <strong>Customer Saja:</strong> Hanya mencetak struk rincian pembayaran untuk pelanggan.
                  </div>
                  <div className="p-2 bg-gray-50 border rounded-lg">
                    <strong>Dapur Saja:</strong> Hanya mencetak tiket masak huruf besar untuk koki dapur.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SOP & FAQ */}
          {activeTab === 'sop_faq' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-black text-sm text-green-900 flex items-center gap-2 mb-1">
                  <FiHelpCircle className="text-green-600" /> SOP Kasir Harian & Tanya Jawab (FAQ)
                </h4>
                <p className="text-xs text-green-800">
                  Prosedur buka/tutup kasir dan penanganan kendala yang sering dihadapi kasir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border rounded-xl space-y-1.5">
                  <strong className="text-emerald-800 font-bold block text-sm">☀️ SOP Pagi Hari (Buka Kasir):</strong>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>Nyalakan komputer kasir dan printer thermal. Cek isi kertas.</li>
                    <li>Buka menu <code>/admin/pos-tables</code>, klik tombol <strong>`[🔄 Reset Semua Nomor]`</strong> agar meja kembali hijau.</li>
                    <li>Tata 30 nomor antrian akrilik fisik di samping meja kasir.</li>
                    <li>Hitung uang modal kembalian di laci kasir.</li>
                    <li>Buka POS Kasir (`/order`), klik <strong>`[🔊 Aktifkan Suara]`</strong>.</li>
                  </ol>
                </div>

                <div className="p-3 bg-white border rounded-xl space-y-1.5">
                  <strong className="text-blue-800 font-bold block text-sm">🌙 SOP Malam Hari (Tutup Kasir):</strong>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                    <li>Pastikan semua pesanan di Monitor Pesanan sudah lunas dan selesai.</li>
                    <li>Buka Laporan Penjualan (`/admin/pos-reports`), pilih filter <strong>`[Hari Ini]`</strong>.</li>
                    <li>Hitung uang tunai fisik di laci kasir: wajib sama dengan angka di kartu <strong>Total Kas Tunai (Cash)</strong>.</li>
                    <li>Cocokkan mutasi QRIS dengan riwayat uang masuk rekening QRIS bank.</li>
                    <li>Unduh dan cetak <strong>PDF Laporan</strong> untuk diserahkan ke pemilik.</li>
                  </ol>
                </div>
              </div>

              <div className="p-3 bg-white border rounded-xl space-y-2 text-xs">
                <h5 className="font-bold text-gray-900 text-xs sm:text-sm">Pertanyaan yang Sering Diajukan (FAQ):</h5>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded border">
                    <strong className="text-gray-900 block">Q: Bagaimana jika tamu ingin dibungkus bawa pulang (Takeaway)?</strong>
                    <span className="text-gray-600 text-[11px]">Jawab: Pilih salah satu nomor meja kosong (misal No. 30), isi nama tamu dan tulis keterangan <em>"BUNGKUS / TAKEAWAY"</em> pada catatan pesanan. Dapur akan otomatis membungkus masakan tersebut.</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border">
                    <strong className="text-gray-900 block">Q: Printer mencetak kertas putih polos tanpa tulisan?</strong>
                    <span className="text-gray-600 text-[11px]">Jawab: Kertas thermal terpasang terbalik. Balik posisi gulungan kertas thermal Anda (sisi licin menghadap sensor printer).</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border">
                    <strong className="text-gray-900 block">Q: Jika listrik padam, apakah pesanan hilang?</strong>
                    <span className="text-gray-600 text-[11px]">Jawab: Tidak. Semua data tersimpan permanen di cloud database server. Saat komputer menyala, seluruh pesanan dan tagihan meja akan langsung muncul kembali.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 font-medium text-center sm:text-left">
            💡 Panduan ini juga dapat diunduh/dicetak dari file: <code>docs/BUKU_PANDUAN_KASIR_POS_PALANTEA.md</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors w-full sm:w-auto"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
}
