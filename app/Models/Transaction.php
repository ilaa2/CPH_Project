<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'pesanan_id',
        'uuid',
        'customer_name',
        'customer_email',
        'customer_phone',
        'address',
        'shipping_method',
        'shipping_cost',
        'total_amount',
        'grand_total',
        'payment_status',
        'midtrans_snap_token',
        'midtrans_order_id',
    ];
}
