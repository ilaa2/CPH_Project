<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cari id kategori Snack
        $snackCategory = DB::table('pos_food_categories')->where('nama_kategori', 'Snack')->first();
        $categoryId = $snackCategory ? $snackCategory->id : 4;

        DB::table('pos_foods')->updateOrInsert(
            ['nama' => 'Pempek Palantea (Isi 6 Pcs)'],
            [
                'category_id' => $categoryId,
                'deskripsi' => '★ Menu Baru - Pempek asli ikan tenggiri disajikan dengan kuah cuko segar (Isi 6 pcs)',
                'harga' => 30000,
                'gambar' => 'pos_foods/pempek_palantea.png',
                'status' => 'Aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('pos_foods')->where('nama', 'Pempek Palantea (Isi 6 Pcs)')->delete();
    }
};
