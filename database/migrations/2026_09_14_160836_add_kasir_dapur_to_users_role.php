<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan nilai 'kasir' dan 'dapur' ke enum role users untuk sistem POS
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'customer', 'kasir', 'dapur') NOT NULL DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Pastikan tidak ada user kasir/dapur sebelum rollback
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer'");
    }
};
