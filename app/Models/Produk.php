<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $table = 'products';

    protected $fillable = ['nama', 'id_kategori', 'harga', 'stok', 'gambar', 'status', 'deskripsi']; // ✅ tambah 'status'

    public function kategori()
    {
        // Lihat baris ini
        return $this->belongsTo(ProductCategory::class, 'id_kategori');
    }


}
