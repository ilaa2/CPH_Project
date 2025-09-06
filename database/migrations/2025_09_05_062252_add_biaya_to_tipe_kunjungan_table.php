<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        // database/migrations/xxxx_xx_xx_xxxxxx_add_biaya_to_tipe_kunjungan_table.php
        public function up()
        {
            Schema::table('tipe_kunjungan', function (Blueprint $table) {
                $table->unsignedInteger('biaya')->default(0)->after('nama_tipe');
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tipe_kunjungan', function (Blueprint $table) {
            //
        });
    }
};
