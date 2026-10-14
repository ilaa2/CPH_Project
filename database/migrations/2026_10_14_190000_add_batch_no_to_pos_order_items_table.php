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
        if (Schema::hasTable('pos_order_items')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('pos_order_items', 'batch_no')) {
                    $table->integer('batch_no')->default(1)->after('batal_alasan');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('pos_order_items')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                if (Schema::hasColumn('pos_order_items', 'batch_no')) {
                    $table->dropColumn('batch_no');
                }
            });
        }
    }
};
