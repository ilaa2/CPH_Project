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
            $table->integer('jumlah_pengunjung')->default(1)->after('jam'); // tambah kolom
            $table->integer('total_biaya')->nullable()->after('jumlah_pengunjung'); // kalau juga perlu total_biaya
        });
    }

    public function down(): void
    {
        Schema::table('kunjungan', function (Blueprint $table) {
            $table->dropColumn(['jumlah_pengunjung', 'total_biaya']);
        });
    }
};
