<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pelanggan')->constrained('pelanggans');

            // Kolom untuk kedua alur
            $table->string('status')->default('pending');
            $table->decimal('total', 12, 2); // Ubah dari 'total' ke 'total_harga' agar konsisten

            // Kolom spesifik untuk checkout pelanggan (bisa null jika dibuat admin)
            $table->string('nomor_pesanan')->unique()->nullable();
            $table->text('alamat_pengiriman')->nullable();
            $table->string('metode_pengiriman')->nullable();
            $table->decimal('biaya_pengiriman', 12, 2)->default(0);

            $table->date('tanggal')->nullable(); // Jadikan nullable, kita utamakan timestamps
            $table->timestamps(); // created_at dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
