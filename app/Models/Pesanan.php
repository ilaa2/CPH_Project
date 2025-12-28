<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    use HasFactory;

    protected $table = 'pesanan';

    /**
     * Daftarkan SEMUA kolom di sini agar bisa disimpan dari CheckoutController.
     * Ini adalah bagian terpenting yang harus diperbaiki.
     */
    protected $fillable = [
        'id_pelanggan',
        'nomor_pesanan',
        'total',
        'status',
        'alamat_pengiriman',
        'metode_pengiriman',
        'biaya_pengiriman',
        'tanggal',
    ];

    /**
     * Relasi ke model Pelanggan.
     */
    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan');
    }

    /**
     * Relasi ke model PesananItem.
     */
    public function items()
    {
        return $this->hasMany(PesananItem::class, 'pesanan_id');
    }

    /**
     * Relasi ke model Ulasan.
     */
    public function ulasan()
    {
        return $this->hasOne(Ulasan::class, 'pesanan_id');
    }
}
