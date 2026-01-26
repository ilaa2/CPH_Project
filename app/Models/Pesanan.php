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
     */
    protected $fillable = [
        'user_id',
        'nomor_pesanan',
        'total',
        'status',
        'nomor_resi',
        'alamat_pengiriman',
        'metode_pengiriman',
        'biaya_pengiriman',
        'ekspedisi',
        'estimasi',
        'tanggal',
        // Payment columns
        'payment_status',
        'snap_token',
        'midtrans_order_id',
        'paid_at',
    ];

    /**
     * Relasi ke model User.
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
        return $this->hasMany(Ulasan::class, 'pesanan_id');
    }
}
