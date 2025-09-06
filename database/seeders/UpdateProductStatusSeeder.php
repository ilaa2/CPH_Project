<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateProductStatusSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     */
    public function run(): void
    {
        // Ubah semua produk jadi status "Aktif"
        DB::table('products')->update([
            'status' => 'Aktif'
        ]);
    }
}
