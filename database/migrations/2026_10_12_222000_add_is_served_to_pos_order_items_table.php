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
        if (!Schema::hasColumn('pos_order_items', 'is_served')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                $table->boolean('is_served')->default(false)->after('catatan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('pos_order_items', 'is_served')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                $table->dropColumn('is_served');
            });
        }
    }
};
