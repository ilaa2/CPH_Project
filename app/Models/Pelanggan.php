<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Pelanggan extends Authenticatable
{
    use HasFactory;

    protected $table = 'pelanggans'; // WAJIB karena nama tabel kamu pelanggans

    protected $fillable = [
        'nama',
        'email',
        'telepon',
        'alamat',
        'password',
        'foto_profil',
    ];

    protected $hidden = ['password'];

    // RELASI

    public function transaksi()
    {
        return $this->hasMany(\App\Models\Transaksi::class);
    }

    public function kunjungan()
    {
        return $this->hasMany(\App\Models\Kunjungan::class);
    }

    public function ulasan()
    {
        return $this->hasMany(\App\Models\Ulasan::class);
    }
}
