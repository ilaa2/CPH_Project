<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PesananSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     */
    public function run(): void
    {
        DB::table('pesanan')->insert([
            [
                'id_pelanggan' => 1,
                'tanggal' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'total' => 150000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'id_pelanggan' => 2,
                'tanggal' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'total' => 85000,
                'status' => 'proses',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'id_pelanggan' => 3,
                'tanggal' => Carbon::now()->format('Y-m-d'),
                'total' => 120000,
                'status' => 'dibatalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
