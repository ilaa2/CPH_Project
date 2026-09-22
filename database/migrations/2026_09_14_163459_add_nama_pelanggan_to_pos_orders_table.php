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
        Schema::table('pos_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('pos_orders', 'nama_pelanggan')) {
                $table->string('nama_pelanggan')->nullable()->after('nomor_pesanan');
            }
            if (!Schema::hasColumn('pos_orders', 'metode_pembayaran')) {
                $table->enum('metode_pembayaran', ['Cash', 'QRIS'])->default('Cash')->after('payment_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->dropColumn(['nama_pelanggan', 'metode_pembayaran']);
        });
    }
};
