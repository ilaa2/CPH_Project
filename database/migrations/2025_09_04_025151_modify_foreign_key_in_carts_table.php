<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // 1. Hapus foreign key yang lama (menunjuk ke tabel 'users')
            $table->dropForeign('carts_user_id_foreign');

            // 2. Ganti nama kolomnya agar lebih jelas
            $table->renameColumn('user_id', 'pelanggan_id');

            // 3. Tambahkan foreign key yang baru (menunjuk ke tabel 'pelanggans')
            $table->foreign('pelanggan_id')->references('id')->on('pelanggans')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Logika untuk membatalkan (rollback) migrasi
            $table->dropForeign(['pelanggan_id']);
            $table->renameColumn('pelanggan_id', 'user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
