<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds 'Menunggu Pembayaran' status for payment flow integration
     */
    public function up(): void
    {
        // First, fix any invalid status values to a valid one before modifying the enum
        // This handles cases where status might be empty, null, or invalid
        DB::statement("UPDATE kunjungan SET status = 'Dijadwalkan' WHERE status IS NULL OR status = '' OR status NOT IN ('Dijadwalkan', 'Selesai', 'dijadwalkan', 'selesai')");
        
        // Also convert any lowercase values to proper case
        DB::statement("UPDATE kunjungan SET status = 'Dijadwalkan' WHERE status = 'dijadwalkan'");
        DB::statement("UPDATE kunjungan SET status = 'Selesai' WHERE status = 'selesai'");
        
        // Now add 'Menunggu Pembayaran' to the status enum
        DB::statement("ALTER TABLE kunjungan MODIFY COLUMN status ENUM('Dijadwalkan', 'Selesai', 'Menunggu Pembayaran') DEFAULT 'Dijadwalkan'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First update any 'Menunggu Pembayaran' to 'Dijadwalkan' before removing the enum value
        DB::statement("UPDATE kunjungan SET status = 'Dijadwalkan' WHERE status = 'Menunggu Pembayaran'");
        
        // Then revert the column definition
        DB::statement("ALTER TABLE kunjungan MODIFY COLUMN status ENUM('Dijadwalkan', 'Selesai') DEFAULT 'Dijadwalkan'");
    }
};
