<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UlasanFoto extends Model
{
    use HasFactory;

    protected $table = 'ulasan_fotos';

    protected $fillable = [
        'ulasan_id',
        'foto_path',
    ];

    public function ulasan()
    {
        return $this->belongsTo(Ulasan::class);
    }
}
