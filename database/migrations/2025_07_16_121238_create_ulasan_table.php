<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUlasanTable extends Migration
{
    public function up(): void
    {
        Schema::create('ulasan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pelanggan_id'); // relasi ke tabel pelanggans
            $table->text('komentar');
            $table->tinyInteger('rating')->unsigned();
            $table->date('tanggal');
            $table->timestamps();

            // Foreign key ke tabel pelanggans
            $table->foreign('pelanggan_id')
                  ->references('id')
                  ->on('pelanggans')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ulasan');
    }
}
