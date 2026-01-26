<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Mengubah foreign key dari pelanggan_id/id_pelanggan menjadi user_id
     */
    public function up(): void
    {
        // Skip if mapping table doesn't exist (no pelanggans data)
        if (!Schema::hasTable('pelanggan_user_mapping')) {
            $this->addUserIdColumnsWithoutMapping();
            return;
        }

        // === PESANAN TABLE ===
        if (Schema::hasColumn('pesanan', 'id_pelanggan')) {
            // Add new user_id column if not exists
            if (!Schema::hasColumn('pesanan', 'user_id')) {
                Schema::table('pesanan', function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->nullable()->after('id');
                });
            }

            // Update user_id using mapping
            DB::statement('
                UPDATE pesanan p
                INNER JOIN pelanggan_user_mapping m ON p.id_pelanggan = m.old_pelanggan_id
                SET p.user_id = m.new_user_id
            ');

            // Drop old FK constraint first, then drop column
            $this->dropForeignKeySafe('pesanan', 'id_pelanggan');

            Schema::table('pesanan', function (Blueprint $table) {
                $table->dropColumn('id_pelanggan');
            });

            Schema::table('pesanan', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        } elseif (Schema::hasColumn('pesanan', 'user_id') && !Schema::hasColumn('pesanan', 'id_pelanggan')) {
            // Already migrated (partial run), just add FK if missing
            $this->addForeignKeyIfMissing('pesanan', 'user_id', 'users', 'id');
        }

        // === KUNJUNGAN TABLE ===
        if (Schema::hasColumn('kunjungan', 'pelanggan_id')) {
            if (!Schema::hasColumn('kunjungan', 'user_id')) {
                Schema::table('kunjungan', function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->nullable()->after('id');
                });
            }

            DB::statement('
                UPDATE kunjungan k
                INNER JOIN pelanggan_user_mapping m ON k.pelanggan_id = m.old_pelanggan_id
                SET k.user_id = m.new_user_id
            ');

            $this->dropForeignKeySafe('kunjungan', 'pelanggan_id');

            Schema::table('kunjungan', function (Blueprint $table) {
                $table->dropColumn('pelanggan_id');
            });

            Schema::table('kunjungan', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        } elseif (Schema::hasColumn('kunjungan', 'user_id') && !Schema::hasColumn('kunjungan', 'pelanggan_id')) {
            $this->addForeignKeyIfMissing('kunjungan', 'user_id', 'users', 'id');
        }

        // === ULASAN TABLE ===
        if (Schema::hasColumn('ulasan', 'pelanggan_id')) {
            if (!Schema::hasColumn('ulasan', 'user_id')) {
                Schema::table('ulasan', function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->nullable()->after('id');
                });
            }

            DB::statement('
                UPDATE ulasan u
                INNER JOIN pelanggan_user_mapping m ON u.pelanggan_id = m.old_pelanggan_id
                SET u.user_id = m.new_user_id
            ');

            $this->dropForeignKeySafe('ulasan', 'pelanggan_id');

            Schema::table('ulasan', function (Blueprint $table) {
                $table->dropColumn('pelanggan_id');
            });

            Schema::table('ulasan', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        } elseif (Schema::hasColumn('ulasan', 'user_id') && !Schema::hasColumn('ulasan', 'pelanggan_id')) {
            $this->addForeignKeyIfMissing('ulasan', 'user_id', 'users', 'id');
        }

        // === CARTS TABLE ===
        if (Schema::hasColumn('carts', 'pelanggan_id')) {
            if (!Schema::hasColumn('carts', 'user_id')) {
                Schema::table('carts', function (Blueprint $table) {
                    $table->unsignedBigInteger('user_id')->nullable()->after('id');
                });
            }

            DB::statement('
                UPDATE carts c
                INNER JOIN pelanggan_user_mapping m ON c.pelanggan_id = m.old_pelanggan_id
                SET c.user_id = m.new_user_id
            ');

            $this->dropForeignKeySafe('carts', 'pelanggan_id');

            Schema::table('carts', function (Blueprint $table) {
                $table->dropColumn('pelanggan_id');
            });

            Schema::table('carts', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        } elseif (Schema::hasColumn('carts', 'user_id') && !Schema::hasColumn('carts', 'pelanggan_id')) {
            $this->addForeignKeyIfMissing('carts', 'user_id', 'users', 'id');
        }

        // Drop mapping table after use
        Schema::dropIfExists('pelanggan_user_mapping');
    }

    /**
     * Helper to drop foreign key safely (MySQL)
     */
    private function dropForeignKeySafe(string $table, string $column): void
    {
        $fkName = "{$table}_{$column}_foreign";
        
        // Check if FK exists before dropping
        $fkExists = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ? 
            AND CONSTRAINT_NAME = ? 
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        ", [$table, $fkName]);

        if (!empty($fkExists)) {
            Schema::table($table, function (Blueprint $t) use ($fkName) {
                $t->dropForeign($fkName);
            });
        }
    }

    /**
     * Helper to add foreign key if not exists
     */
    private function addForeignKeyIfMissing(string $table, string $column, string $refTable, string $refColumn): void
    {
        $fkName = "{$table}_{$column}_foreign";
        
        $fkExists = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ? 
            AND CONSTRAINT_NAME = ? 
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        ", [$table, $fkName]);

        if (empty($fkExists)) {
            Schema::table($table, function (Blueprint $t) use ($column, $refTable, $refColumn) {
                $t->foreign($column)->references($refColumn)->on($refTable)->onDelete('cascade');
            });
        }
    }

    /**
     * Add user_id columns without mapping (fresh install scenario)
     */
    private function addUserIdColumnsWithoutMapping(): void
    {
        $tables = [
            'pesanan' => 'id_pelanggan',
            'kunjungan' => 'pelanggan_id',
            'ulasan' => 'pelanggan_id',
            'carts' => 'pelanggan_id',
        ];

        foreach ($tables as $table => $oldColumn) {
            if (Schema::hasColumn($table, $oldColumn) && !Schema::hasColumn($table, 'user_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->unsignedBigInteger('user_id')->nullable()->after('id');
                });
                
                $this->dropForeignKeySafe($table, $oldColumn);
                
                Schema::table($table, function (Blueprint $t) use ($oldColumn) {
                    $t->dropColumn($oldColumn);
                });
                
                Schema::table($table, function (Blueprint $t) {
                    $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed. Please restore from backup.');
    }
};
