<?php

// app/Models/Transaksi.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi'; // ⬅️ opsional jika nama tabel sesuai konvensi
    protected $fillable = ['tanggal', 'invoice', 'total']; // ⬅️ sesuaikan dengan field di tabel
}
