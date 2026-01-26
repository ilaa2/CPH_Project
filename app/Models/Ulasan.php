<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{

    protected $table = 'ulasan';

    protected $fillable = [
        'user_id',
        'kunjungan_id',
        'pesanan_id',
        'produk_id',
        'komentar',
        'rating',
        'tanggal',
        'balasan',
        'tanggal_balasan',
    ];

    /**
     * Relasi ke User.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Alias for backward compatibility
     * @deprecated Use user() instead
     */
    public function pelanggan()
    {
        return $this->user();
    }

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class);
    }

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function fotos()
    {
        return $this->hasMany(UlasanFoto::class, 'ulasan_id');
    }
}
