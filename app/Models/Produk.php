<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produk extends Model
{
    use SoftDeletes;

    protected $table = 'products';

    protected $fillable = ['nama', 'id_kategori', 'harga', 'stok', 'gambar', 'status', 'deskripsi', 'berat'];

    protected static function boot()
    {
        parent::boot();

        // Auto non-aktifkan produk jika stok habis
        static::saving(function ($produk) {
            if ($produk->stok <= 0) {
                $produk->status = 'Tidak Aktif';
            }
        });
    }

    public function kategori()
    {
        // Lihat baris ini
        return $this->belongsTo(ProductCategory::class, 'id_kategori');
    }

    public function ulasan()
    {
        return $this->hasMany(Ulasan::class, 'produk_id');
    }


}
