<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class PelangganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Sekarang menggunakan tabel users dengan role 'customer'
     */
    public function run(): void
    {
        // Data pelanggan sekarang masuk ke tabel users dengan role 'customer'
        $customers = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
                'phone' => '081234567890',
                'alamat' => 'Jl. Merdeka No. 123, Jakarta',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Sari Wulandari',
                'email' => 'sari.wulandari@example.com',
                'phone' => '082345678901',
                'alamat' => 'Jl. Sudirman No. 45, Bandung',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Andi Wijaya',
                'email' => 'andi.wijaya@example.com',
                'phone' => '083456789012',
                'alamat' => 'Jl. Diponegoro No. 67, Surabaya',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Rina Kartika',
                'email' => 'rina.kartika@example.com',
                'phone' => '081345678901',
                'alamat' => 'Jl. Gatot Subroto No. 22, Yogyakarta',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Agus Pratama',
                'email' => 'agus.pratama@example.com',
                'phone' => '081356789012',
                'alamat' => 'Jl. Ahmad Yani No. 15, Semarang',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@example.com',
                'phone' => '081367890123',
                'alamat' => 'Jl. Veteran No. 30, Malang',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Fajar Nugroho',
                'email' => 'fajar.nugroho@example.com',
                'phone' => '081378901234',
                'alamat' => 'Jl. Imam Bonjol No. 11, Denpasar',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Lia Anggraini',
                'email' => 'lia.anggraini@example.com',
                'phone' => '081389012345',
                'alamat' => 'Jl. Dipatiukur No. 7, Bandung',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Yusuf Ramadhan',
                'email' => 'yusuf.ramadhan@example.com',
                'phone' => '081390123456',
                'alamat' => 'Jl. Asia Afrika No. 5, Jakarta',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Putri Amalia',
                'email' => 'putri.amalia@example.com',
                'phone' => '081301234567',
                'alamat' => 'Jl. Pahlawan No. 9, Surakarta',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        foreach ($customers as $customer) {
            // Skip jika email sudah ada
            $exists = DB::table('users')->where('email', $customer['email'])->exists();
            if (!$exists) {
                DB::table('users')->insert($customer);
            }
        }
    }
}
