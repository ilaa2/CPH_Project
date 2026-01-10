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
        Schema::table('ulasan', function (Blueprint $table) {
            $table->text('balasan')->nullable()->after('komentar');
            $table->dateTime('tanggal_balasan')->nullable()->after('balasan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ulasan', function (Blueprint $table) {
            $table->dropColumn(['balasan', 'tanggal_balasan']);
        });
    }
};
