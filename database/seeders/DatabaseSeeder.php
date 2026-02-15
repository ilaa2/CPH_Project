<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\TipeKunjunganSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin CPH',
            'email' => 'admin@cph.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Akun testing untuk dokumentasi skripsi
        User::factory()->create([
            'name' => 'User Testing',
            'email' => 'testing@cph.com',
            'password' => Hash::make('Testing123!'),
            'role' => 'customer',
            'phone' => '081234567890',
            'alamat' => 'Jl. HR. Soebrantas No. 155, Panam, Pekanbaru',
        ]);

        $this->call(TipeKunjunganSeeder::class);
        $this->call(ProductCategoriesSeeder::class);
        $this->call(ProductsSeeder::class);
        $this->call(UpdateProductStatusSeeder::class);
        $this->call(PelangganSeeder::class);
        $this->call(KunjunganSeeder::class);
        $this->call(PesananSeeder::class);
        $this->call(ProductDescriptionSeeder::class);


    }
}
