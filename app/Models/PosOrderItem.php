<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosOrderItem extends Model
{
    use HasFactory;

    protected $table = 'pos_order_items';

    protected $fillable = [
        'order_id',
        'food_id',
        'jumlah',
        'harga_satuan',
        'subtotal',
        'catatan',
        'is_served',
        'status',
        'batal_alasan',
        'batch_no',
    ];

    protected $casts = [
        'is_served' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(PosOrder::class, 'order_id');
    }

    public function food()
    {
        return $this->belongsTo(PosFood::class, 'food_id')->withTrashed();
    }
}
