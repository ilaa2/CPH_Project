<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update kategori yang mengandung kata "Sayur" menjadi "Sayuran"
        DB::table('product_categories')
            ->where('nama_kategori', 'LIKE', '%Sayur%')
            ->update(['nama_kategori' => 'Sayuran']);

        // Update kategori yang mengandung kata "Buah" menjadi "Buah-buahan"
        DB::table('product_categories')
            ->where('nama_kategori', 'LIKE', '%Buah%')
            ->update(['nama_kategori' => 'Buah-buahan']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke nama seeder lama
        DB::table('product_categories')
            ->where('nama_kategori', 'Sayuran')
            ->update(['nama_kategori' => 'Sayur']);

        DB::table('product_categories')
            ->where('nama_kategori', 'Buah-buahan')
            ->update(['nama_kategori' => 'Buah']);
    }
};
