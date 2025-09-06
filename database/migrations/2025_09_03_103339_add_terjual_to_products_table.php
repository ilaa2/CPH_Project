<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up(): void
        {
            Schema::table('products', function (Blueprint $table) {
                // Tambahkan kolom 'terjual' setelah 'stok'
                // Default 0 agar produk baru dimulai dari 0 penjualan
                $table->integer('terjual')->default(0)->after('stok');
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
