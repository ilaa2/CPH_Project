<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ubah kolom status pos_tables menjadi VARCHAR(50) agar mendukung status 'UNAVAILABLE' (Tidak Tersedia)
        // Menggunakan DB::statement agar kompatibel langsung dengan MySQL tanpa dependensi doctrine/dbal
        try {
            DB::statement("ALTER TABLE pos_tables MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'");
        } catch (\Throwable $e) {
            // Fallback jika database lain (e.g. SQLite saat testing)
            Schema::table('pos_tables', function (Blueprint $table) {
                $table->string('status', 50)->default('AVAILABLE')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE pos_tables MODIFY COLUMN status ENUM('AVAILABLE', 'OCCUPIED', 'NEEDS_CLEANING') NOT NULL DEFAULT 'AVAILABLE'");
        } catch (\Throwable $e) {
            // Silence
        }
    }
};
