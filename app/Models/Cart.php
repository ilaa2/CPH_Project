<?php

// app/Models/Cart.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// app/Models/Cart.php
class Cart extends Model
{
    use HasFactory;

    // Ganti 'user_id' menjadi 'pelanggan_id'
    protected $fillable = [
        'pelanggan_id',
        'product_id',
        'quantity',
    ];

    // Ganti relasi user() menjadi pelanggan()
    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class);
    }

    public function product()
    {
        return $this->belongsTo(Produk::class);
    }
}
