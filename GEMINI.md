# Catatan Perubahan

## 15 Januari 2026

### Fix: Gambar Produk Tidak Muncul di Dashboard (Stok Menipis)
- **File**: `resources/js/Pages/Dashboard.jsx`
- **Masalah**: Gambar produk di bagian "Stok Menipis" tidak muncul karena menggunakan field yang salah (`p.foto` seharusnya `p.gambar`)
- **Solusi**: Mengganti `p.foto` menjadi `p.gambar` pada line 174 sesuai dengan field di model `Produk.php`
