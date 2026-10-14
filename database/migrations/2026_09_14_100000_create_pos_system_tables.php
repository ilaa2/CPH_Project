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
        // 1. Food Categories Table
        Schema::create('pos_food_categories', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['Aktif', 'Tidak Aktif'])->default('Aktif');
            $table->timestamps();
        });

        // 2. Foods Table (Soft Deletes included)
        Schema::create('pos_foods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('pos_food_categories')->onDelete('cascade');
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->integer('harga');
            $table->string('gambar')->nullable();
            $table->enum('status', ['Aktif', 'Tidak Aktif'])->default('Aktif');
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Tables Table (Meja 01 s/d 30)
        Schema::create('pos_tables', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_meja')->unique(); // '01', '02', ..., '30'
            $table->string('status', 50)->default('AVAILABLE'); // 'AVAILABLE', 'OCCUPIED', 'NEEDS_CLEANING', 'UNAVAILABLE'
            $table->timestamps();
        });

        // 4. Orders Table
        Schema::create('pos_orders', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pesanan')->unique(); // Format: CP-POS-YYYYMMDD-XXX
            $table->foreignId('table_id')->constrained('pos_tables')->onDelete('restrict');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('restrict');
            $table->enum('order_status', ['NEW', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'])->default('NEW');
            $table->enum('payment_status', ['UNPAID', 'PAID'])->default('UNPAID');
            $table->integer('subtotal')->default(0);
            $table->integer('diskon')->default(0);
            $table->integer('total')->default(0);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 5. Order Items Table
        Schema::create('pos_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('pos_orders')->onDelete('cascade');
            $table->foreignId('food_id')->constrained('pos_foods')->onDelete('restrict');
            $table->integer('jumlah');
            $table->integer('harga_satuan'); // Snapshot harga makanan saat pesanan dibuat
            $table->integer('subtotal');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 6. Payments Table
        Schema::create('pos_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('pos_orders')->onDelete('cascade');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('restrict');
            $table->enum('metode_pembayaran', ['Cash', 'QRIS', 'Transfer'])->default('Cash');
            $table->integer('jumlah_bayar');
            $table->integer('kembalian')->default(0);
            $table->timestamp('paid_at')->useCurrent();
            $table->enum('status', ['SUCCESS', 'FAILED'])->default('SUCCESS');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_payments');
        Schema::dropIfExists('pos_order_items');
        Schema::dropIfExists('pos_orders');
        Schema::dropIfExists('pos_tables');
        Schema::dropIfExists('pos_foods');
        Schema::dropIfExists('pos_food_categories');
    }
};
