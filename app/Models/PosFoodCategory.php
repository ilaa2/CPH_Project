<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosFoodCategory extends Model
{
    use HasFactory;

    protected $table = 'pos_food_categories';

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
        'status',
    ];

    public function foods()
    {
        return $this->hasMany(PosFood::class, 'category_id');
    }
}
