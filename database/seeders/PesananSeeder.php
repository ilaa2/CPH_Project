<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class PesananSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     * Updated: Menggunakan user_id alih-alih id_pelanggan
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel pesanan
        DB::table('pesanan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        // Ambil user dengan role customer
        $customers = DB::table('users')->where('role', 'customer')->limit(5)->pluck('id')->toArray();
        
        if (empty($customers)) {
            return;
        }

        $statuses = ['pending', 'processed', 'shipped', 'completed'];
        $metodePengiriman = ['Ambil di Toko', 'Kurir Lokal', 'JNE - REG'];

        foreach ($customers as $index => $customerId) {
            $status = $statuses[array_rand($statuses)];
            $metode = $metodePengiriman[array_rand($metodePengiriman)];
            $ongkir = $metode === 'Ambil di Toko' ? 0 : rand(10000, 30000);
            $subtotal = rand(50000, 300000);
            
            DB::table('pesanan')->insert([
                'user_id' => $customerId,
                'tanggal' => Carbon::now()->subDays(rand(1, 30))->format('Y-m-d'),
                'total' => $subtotal + $ongkir,
                'biaya_pengiriman' => $ongkir,
                'status' => $status,
                'metode_pengiriman' => $metode,
                'alamat_pengiriman' => $metode === 'Ambil di Toko' ? 'Ambil di Toko' : 'Jl. Contoh No. ' . rand(1, 100),
                'payment_status' => $status === 'pending' ? 'unpaid' : 'paid',
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
