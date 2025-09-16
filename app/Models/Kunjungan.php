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
        'jumlah_pengunjung',
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
    public function tipeKunjungan()
    {
        return $this->belongsTo(TipeKunjungan::class, 'tipe_kunjungan_id');
    }
}
