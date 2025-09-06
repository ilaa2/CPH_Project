<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PesananItem extends Model
{
    protected $fillable = ['pesanan_id', 'produk_id', 'jumlah', 'subtotal'];

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
}
