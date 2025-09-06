<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipeKunjungan extends Model
{
    use HasFactory;

    protected $table = 'tipe_kunjungan'; // Sudah benar

    // GANTI INI:
    protected $fillable = ['nama_tipe']; // <== ini harus 'nama_tipe'

    public function kunjungan()
    {
        return $this->hasMany(Kunjungan::class, 'tipe_id');
    }
}
