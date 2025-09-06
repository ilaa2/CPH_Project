<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    protected $table = 'pesanan';

    protected $fillable = [
        'id_pelanggan', 'tanggal', 'total', 'status'
    ];

    // Relasi ke pelanggan (one-to-many inverse)
    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan');
    }

    // Relasi ke item pesanan (one-to-many)
    public function items()
    {
        return $this->hasMany(PesananItem::class);
    }
}
