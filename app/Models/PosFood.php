<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PosFood extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pos_foods';

    protected $fillable = [
        'category_id',
        'nama',
        'deskripsi',
        'harga',
        'gambar',
        'status',
    ];

    public function category()
    {
        return $this->belongsTo(PosFoodCategory::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(PosOrderItem::class, 'food_id');
    }
}
