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
    Schema::table('kunjungan', function (Blueprint $table) {
        $table->unsignedBigInteger('tipe_id')->after('pelanggan_id');

        $table->foreign('tipe_id')->references('id')->on('tipe_kunjungan')->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('kunjungan', function (Blueprint $table) {
        $table->dropForeign(['tipe_id']);
        $table->dropColumn('tipe_id');
    });
}

};
