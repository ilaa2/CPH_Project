<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    use HasFactory;

    protected $table = 'kunjungan';

    protected $fillable = [
        'user_id',
        'tanggal',
        'jam',
        'status',
        'tipe_id',
        'jumlah_dewasa',
        'jumlah_anak',
        'jumlah_balita',
        'total_biaya',
        // Payment columns
        'payment_status',
        'snap_token',
        'midtrans_order_id',
        'paid_at',
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
