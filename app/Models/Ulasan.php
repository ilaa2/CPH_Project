<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{

    protected $table = 'ulasan';

    protected $fillable = [
        'pelanggan_id',
        'kunjungan_id',
        'pesanan_id',
        'komentar',
        'rating',
        'tanggal',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function kunjungan()
    {
        return $this->belongsTo(Kunjungan::class);
    }

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function fotos()
    {
        return $this->hasMany(UlasanFoto::class, 'ulasan_id');
    }
}
