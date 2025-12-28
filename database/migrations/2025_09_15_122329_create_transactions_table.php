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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // === TAMBAHKAN BARIS INI ===
            $table->foreignId('pesanan_id')->constrained('pesanan')->onDelete('cascade');

            // Kolom-kolom Anda yang sudah ada
            $table->string('uuid')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('address')->nullable(); // Jadikan bisa null jika perlu
            $table->string('shipping_method')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);
            $table->string('payment_status');
            $table->string('midtrans_snap_token')->nullable();
            $table->string('midtrans_order_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
