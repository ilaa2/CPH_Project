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
            $table->unsignedBigInteger('user_id'); // relasi ke tabel users
            $table->unsignedBigInteger('produk_id')->nullable();
            $table->unsignedBigInteger('pesanan_id')->nullable();
            $table->unsignedBigInteger('kunjungan_id')->nullable();
            $table->text('komentar');
            $table->tinyInteger('rating')->unsigned();
            $table->date('tanggal');
            $table->text('balasan')->nullable();
            $table->timestamp('tanggal_balasan')->nullable();
            $table->timestamps();

            // Foreign key ke tabel users
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('produk_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');

            $table->foreign('pesanan_id')
                  ->references('id')
                  ->on('pesanan')
                  ->onDelete('cascade');

            $table->foreign('kunjungan_id')
                  ->references('id')
                  ->on('kunjungan')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ulasan');
    }
}
