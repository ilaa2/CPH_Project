<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosPayment extends Model
{
    use HasFactory;

    protected $table = 'pos_payments';

    protected $fillable = [
        'order_id',
        'cashier_id',
        'metode_pembayaran',
        'jumlah_bayar',
        'cash_amount',
        'qris_amount',
        'kembalian',
        'catatan_koreksi',
        'paid_at',
        'status',
    ];

    public function order()
    {
        return $this->belongsTo(PosOrder::class, 'order_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
