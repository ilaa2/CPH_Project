<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosTable extends Model
{
    use HasFactory;

    protected $table = 'pos_tables';

    protected $fillable = [
        'nomor_meja',
        'status',
    ];

    public function orders()
    {
        return $this->hasMany(PosOrder::class, 'table_id');
    }

    public function activeOrder()
    {
        return $this->hasOne(PosOrder::class, 'table_id')
            ->whereIn('order_status', ['NEW', 'PROCESSING', 'READY'])
            ->latestOfMany();
    }
}
