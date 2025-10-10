<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing data first
        DB::statement("UPDATE kunjungan SET status = 'Dijadwalkan' WHERE status = 'dijadwalkan'");
        DB::statement("UPDATE kunjungan SET status = 'Selesai' WHERE status = 'selesai'");
        DB::statement("UPDATE kunjungan SET status = 'Dibatalkan' WHERE status = 'dibatalkan'");

        Schema::table('kunjungan', function (Blueprint $table) {
            // Then change the column definition
            $table->enum('status', ['Dijadwalkan', 'Selesai', 'Dibatalkan'])->default('Dijadwalkan')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Update existing data back to lowercase
        DB::statement("UPDATE kunjungan SET status = 'dijadwalkan' WHERE status = 'Dijadwalkan'");
        DB::statement("UPDATE kunjungan SET status = 'selesai' WHERE status = 'Selesai'");
        DB::statement("UPDATE kunjungan SET status = 'dibatalkan' WHERE status = 'Dibatalkan'");

        Schema::table('kunjungan', function (Blueprint $table) {
            // Then revert the column definition
            $table->enum('status', ['dijadwalkan', 'selesai', 'dibatalkan'])->default('dijadwalkan')->change();
        });
    }
};