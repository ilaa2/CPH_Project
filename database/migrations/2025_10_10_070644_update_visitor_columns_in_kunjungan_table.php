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
        Schema::table('kunjungan', function (Blueprint $table) {
            // Tambahkan kolom baru setelah 'jam'
            $table->integer('jumlah_dewasa')->default(1)->after('jam');
            $table->integer('jumlah_anak')->default(0)->after('jumlah_dewasa');
            $table->integer('jumlah_balita')->default(0)->after('jumlah_anak');

            // Hapus kolom lama
            $table->dropColumn('jumlah_pengunjung');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            // Kembalikan kolom lama jika migration di-rollback
            $table->integer('jumlah_pengunjung')->default(1)->after('jam');

            // Hapus kolom baru
            $table->dropColumn(['jumlah_dewasa', 'jumlah_anak', 'jumlah_balita']);
        });
    }
};