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
        Schema::table('ulasan', function (Blueprint $table) {
            // Tambahkan kolom untuk foreign key ke tabel kunjungan dan pesanan
            $table->foreignId('kunjungan_id')->nullable()->after('pelanggan_id')->constrained('kunjungan')->onDelete('cascade');
            $table->foreignId('pesanan_id')->nullable()->after('kunjungan_id')->constrained('pesanan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            $table->dropForeign(['pesanan_id']);
            $table->dropColumn('pesanan_id');
            $table->dropForeign(['kunjungan_id']);
            $table->dropColumn('kunjungan_id');
        });
    }
};