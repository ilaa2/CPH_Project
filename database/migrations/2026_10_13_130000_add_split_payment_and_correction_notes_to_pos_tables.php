<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modifikasi pos_payments: ubah metode_pembayaran jadi VARCHAR(50) & tambah cash_amount, qris_amount, catatan_koreksi
        if (Schema::hasTable('pos_payments')) {
            try {
                DB::statement("ALTER TABLE pos_payments MODIFY COLUMN metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Cash'");
            } catch (\Exception $e) {
                // Abaikan jika database bukan MySQL murni
            }

            Schema::table('pos_payments', function (Blueprint $table) {
                if (!Schema::hasColumn('pos_payments', 'cash_amount')) {
                    $table->integer('cash_amount')->default(0)->after('jumlah_bayar');
                }
                if (!Schema::hasColumn('pos_payments', 'qris_amount')) {
                    $table->integer('qris_amount')->default(0)->after('cash_amount');
                }
                if (!Schema::hasColumn('pos_payments', 'catatan_koreksi')) {
                    $table->text('catatan_koreksi')->nullable()->after('kembalian');
                }
            });
        }

        // 2. Modifikasi pos_orders: ubah metode_pembayaran jadi VARCHAR(50)
        if (Schema::hasTable('pos_orders')) {
            try {
                DB::statement("ALTER TABLE pos_orders MODIFY COLUMN metode_pembayaran VARCHAR(50) NULL DEFAULT 'Cash'");
            } catch (\Exception $e) {
                // Abaikan
            }
        }

        // 3. Modifikasi pos_order_items: tambah status (ACTIVE/CANCELLED) & batal_alasan
        if (Schema::hasTable('pos_order_items')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('pos_order_items', 'status')) {
                    $table->string('status', 20)->default('ACTIVE')->after('catatan');
                }
                if (!Schema::hasColumn('pos_order_items', 'batal_alasan')) {
                    $table->string('batal_alasan', 255)->nullable()->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('pos_payments')) {
            Schema::table('pos_payments', function (Blueprint $table) {
                if (Schema::hasColumn('pos_payments', 'cash_amount')) {
                    $table->dropColumn('cash_amount');
                }
                if (Schema::hasColumn('pos_payments', 'qris_amount')) {
                    $table->dropColumn('qris_amount');
                }
                if (Schema::hasColumn('pos_payments', 'catatan_koreksi')) {
                    $table->dropColumn('catatan_koreksi');
                }
            });
        }

        if (Schema::hasTable('pos_order_items')) {
            Schema::table('pos_order_items', function (Blueprint $table) {
                if (Schema::hasColumn('pos_order_items', 'status')) {
                    $table->dropColumn('status');
                }
                if (Schema::hasColumn('pos_order_items', 'batal_alasan')) {
                    $table->dropColumn('batal_alasan');
                }
            });
        }
    }
};
