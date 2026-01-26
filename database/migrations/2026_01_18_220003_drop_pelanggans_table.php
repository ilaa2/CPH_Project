<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menghapus tabel pelanggans setelah data dipindahkan
     */
    public function up(): void
    {
        Schema::dropIfExists('pelanggans');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate pelanggans table if needed
        Schema::create('pelanggans', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telepon')->nullable();
            $table->text('alamat')->nullable();
            $table->string('foto_profil')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }
};
