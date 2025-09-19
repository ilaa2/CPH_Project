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
        // DIUBAH: dari 'users' menjadi 'pelanggans'
        Schema::table('pelanggans', function (Blueprint $table) {
            // Perintah ini sekarang akan berhasil karena kolom 'alamat' ada di tabel 'pelanggans'
            $table->string('foto_profil')->nullable()->after('alamat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // DIUBAH: dari 'users' menjadi 'pelanggans'
        Schema::table('pelanggans', function (Blueprint $table) {
            $table->dropColumn('foto_profil');
        });
    }
};
