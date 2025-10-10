<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    use HasFactory;

    protected $table = 'kunjungan';

    protected $fillable = [
        'pelanggan_id',
        'tipe_id',
        'judul',
        'deskripsi',
        'tanggal',
        'jam',
        'jumlah_dewasa',
        'jumlah_anak',
        'jumlah_balita',
        'total_biaya',
        'status',
    ];


    /**
     * Relasi ke Pelanggan.
     * Dibuat eksplisit menunjuk ke foreign key 'pelanggan_id'.
     */
    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id');
    }

    /**
     * Relasi ke TipeKunjungan.
     */
    public function tipe()
    {
        return $this->belongsTo(TipeKunjungan::class, 'tipe_id');
    }


    /**
     * Relasi ke Ulasan. Satu kunjungan hanya punya satu ulasan.
     */
    public function ulasan()
    {
        return $this->hasOne(Ulasan::class);
    }
}
