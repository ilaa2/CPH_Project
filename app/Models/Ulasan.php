<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ulasan extends Model
{

    protected $table = 'ulasan';

    protected $fillable = [
        'pelanggan_id',
        'komentar',
        'rating',
        'tanggal'
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class);
    }

}
