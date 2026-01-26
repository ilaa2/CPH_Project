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
        Schema::table('pesanan', function (Blueprint $table) {
            $table->string('payment_status')->default('unpaid')->after('status');
            $table->string('snap_token')->nullable()->after('payment_status');
            $table->string('midtrans_order_id')->nullable()->after('snap_token');
            $table->timestamp('paid_at')->nullable()->after('midtrans_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pesanan', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'snap_token', 'midtrans_order_id', 'paid_at']);
        });
    }
};
