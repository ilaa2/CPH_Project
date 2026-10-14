<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosOrder extends Model
{
    use HasFactory;

    protected $table = 'pos_orders';

    protected $fillable = [
        'nomor_pesanan',
        'nama_pelanggan',
        'table_id',
        'cashier_id',
        'order_status',
        'payment_status',
        'metode_pembayaran',
        'subtotal',
        'diskon',
        'total',
        'catatan',
    ];

    public function table()
    {
        return $this->belongsTo(PosTable::class, 'table_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(PosOrderItem::class, 'order_id');
    }

    public function payment()
    {
        return $this->hasOne(PosPayment::class, 'order_id');
    }
}
