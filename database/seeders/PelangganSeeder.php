<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // <-- Pastikan ini ada
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon; // <-- Pastikan ini ada

class PelangganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Menghapus data lama di tabel pelanggans
        DB::table('pelanggans')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        DB::table('pelanggans')->insert([
            // ID 1
            [
                'nama' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
                'telepon' => '081234567890',
                'alamat' => 'Jl. Merdeka No. 123, Jakarta',
                'password' => Hash::make('password'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 2
            [
                'nama' => 'Sari Wulandari',
                'email' => 'sari.wulandari@example.com',
                'telepon' => '082345678901',
                'alamat' => 'Jl. Sudirman No. 45, Bandung',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 3
            [
                'nama' => 'Andi Wijaya',
                'email' => 'andi.wijaya@example.com',
                'telepon' => '083456789012',
                'alamat' => 'Jl. Diponegoro No. 67, Surabaya',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 4
            [
                'nama' => 'Rina Kartika',
                'email' => 'rina.kartika@example.com',
                'telepon' => '081345678901',
                'alamat' => 'Jl. Gatot Subroto No. 22, Yogyakarta',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 5
            [
                'nama' => 'Agus Pratama',
                'email' => 'agus.pratama@example.com',
                'telepon' => '081356789012',
                'alamat' => 'Jl. Ahmad Yani No. 15, Semarang',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 6
            [
                'nama' => 'Dewi Lestari',
                'email' => 'dewi.lestari@example.com',
                'telepon' => '081367890123',
                'alamat' => 'Jl. Veteran No. 30, Malang',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 7
            [
                'nama' => 'Fajar Nugroho',
                'email' => 'fajar.nugroho@example.com',
                'telepon' => '081378901234',
                'alamat' => 'Jl. Imam Bonjol No. 11, Denpasar',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 8
            [
                'nama' => 'Lia Anggraini',
                'email' => 'lia.anggraini@example.com',
                'telepon' => '081389012345',
                'alamat' => 'Jl. Dipatiukur No. 7, Bandung',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 9
            [
                'nama' => 'Yusuf Ramadhan',
                'email' => 'yusuf.ramadhan@example.com',
                'telepon' => '081390123456',
                'alamat' => 'Jl. Asia Afrika No. 5, Jakarta',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 10
            [
                'nama' => 'Putri Amalia',
                'email' => 'putri.amalia@example.com',
                'telepon' => '081301234567',
                'alamat' => 'Jl. Pahlawan No. 9, Surakarta',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 11
            [
                'nama' => 'Rudi Hartono',
                'email' => 'rudi.hartono@example.com',
                'telepon' => '081312345678',
                'alamat' => 'Jl. Braga No. 14, Bandung',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 12
            [
                'nama' => 'Siti Nurhaliza',
                'email' => 'siti.nurhaliza@example.com',
                'telepon' => '081323456789',
                'alamat' => 'Jl. Kenanga No. 8, Medan',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 13
            [
                'nama' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@example.com',
                'telepon' => '081334567890',
                'alamat' => 'Jl. Melati No. 20, Makassar',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 14
            [
                'nama' => 'Bambang Sudarmanto',
                'email' => 'bambang.sudarmanto@example.com',
                'telepon' => '081345678901',
                'alamat' => 'Jl. Pahlawan No. 10, Semarang',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 15
            [
                'nama' => 'Dian Puspitasari',
                'email' => 'dian.puspitasari@example.com',
                'telepon' => '081356789012',
                'alamat' => 'Jl. Cempaka No. 5, Surabaya',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 16
            [
                'nama' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@example.com',
                'telepon' => '081367890123',
                'alamat' => 'Jl. Kutilang No. 15, Yogyakarta',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // ID 17
            [
                'nama' => 'Fathia Azzahra',
                'email' => 'fathia.azzahra@example.com',
                'telepon' => '081378901234',
                'alamat' => 'Jl. Merak No. 22, Bandung',
                'password' => Hash::make('password'), // Ditambahkan
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
