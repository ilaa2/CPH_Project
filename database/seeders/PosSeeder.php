<?php

namespace Database\Seeders;

use App\Models\PosFood;
use App\Models\PosFoodCategory;
use App\Models\PosTable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Demo Kasir & Dapur Users
        User::firstOrCreate(
            ['email' => 'kasir@cph.com'],
            [
                'name' => 'Kasir CPH',
                'password' => Hash::make('KasirCPH24@'),
                'role' => 'kasir',
                'phone' => '081234567891',
                'alamat' => 'Kasir Operasional Central Palantea',
            ]
        );

        User::firstOrCreate(
            ['email' => 'dapur@cph.com'],
            [
                'name' => 'Dapur CPH',
                'password' => Hash::make('DapurCPH24@'),
                'role' => 'dapur',
                'phone' => '081234567892',
                'alamat' => 'Dapur Operasional Central Palantea',
            ]
        );

        // 2. Seed 30 Nomor Antrian (01 s/d 30)
        for ($i = 1; $i <= 30; $i++) {
            $tableNumber = sprintf('%02d', $i);
            PosTable::firstOrCreate(
                ['nomor_meja' => $tableNumber],
                ['status' => 'AVAILABLE']
            );
        }

        // 3. Seed Food Categories (Sesuai Menu Flyer)
        $catMakanan = PosFoodCategory::firstOrCreate(
            ['nama_kategori' => 'Makanan Utama'],
            ['deskripsi' => 'Main Courses - Aneka hidangan makanan utama', 'status' => 'Aktif']
        );

        $catAdditional = PosFoodCategory::firstOrCreate(
            ['nama_kategori' => 'Additional'],
            ['deskripsi' => 'Menu tambahan / porsi ekstra', 'status' => 'Aktif']
        );

        $catMinuman = PosFoodCategory::firstOrCreate(
            ['nama_kategori' => 'Minuman'],
            ['deskripsi' => 'Minuman dingin, panas & jus segar hidroponik', 'status' => 'Aktif']
        );

        $catSnack = PosFoodCategory::firstOrCreate(
            ['nama_kategori' => 'Snack'],
            ['deskripsi' => 'Camilan dan hidangan ringan', 'status' => 'Aktif']
        );

        // 4. Seed Foods (Lengkap Sesuai Daftar Menu Resmi & Foto Produk)
        $foods = [
            // --- MAIN COURSES (MAKANAN UTAMA) ---
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Goreng', 'deskripsi' => 'Nasi goreng lezat dengan bumbu rempah khas', 'harga' => 19000, 'gambar' => 'pos_foods/Nasi Goreng Ayam Barendo 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Goreng Pattaya', 'deskripsi' => 'Nasi goreng dibungkus telur dadar lembut', 'harga' => 24000, 'gambar' => 'pos_foods/Nasi Dadar Palantea 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ayam Barendo Palantea', 'deskripsi' => '★ Best Seller - Nasi dengan ayam goreng telur barendo renyah khas Palantea', 'harga' => 25000, 'gambar' => 'pos_foods/Nasi Ayam Barendo 25K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Goreng Ayam Barendo Palantea', 'deskripsi' => 'Nasi goreng dipadu topping ayam barendo renyah', 'harga' => 28000, 'gambar' => 'pos_foods/Nasi Goreng Ayam Barendo 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Mie Goreng Ayam Barendo Palantea', 'deskripsi' => 'Mie goreng spesial dengan topping ayam barendo renyah', 'harga' => 28000, 'gambar' => 'pos_foods/Mie Goreng Ayam Barendo 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Mienas Palantea (Mie Nasi Goreng)', 'deskripsi' => 'Kombinasi mantap mie goreng dan nasi goreng khas Palantea', 'harga' => 25000, 'gambar' => 'pos_foods/Mienas Palantea 25K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Dadar Palantea', 'deskripsi' => 'Nasi hangat dengan telur dadar spesial', 'harga' => 17000, 'gambar' => 'pos_foods/Nasi Dadar Palantea 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Selada Kuah Kacang Palantea', 'deskripsi' => '★ Best Seller - Sayuran selada segar hidroponik disiram kuah kacang gurih manis', 'harga' => 20000, 'gambar' => 'pos_foods/Selada Kuah Kacang 20K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Ayam Bakar', 'deskripsi' => 'Nasi ramas dengan ayam bakar bumbu meresap + lalapan', 'harga' => 25000, 'gambar' => 'pos_foods/Nasi Ramas Ayam Bakar 25K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Ikan Bakar', 'deskripsi' => 'Nasi ramas dengan ikan bakar segar + sambal', 'harga' => 28000, 'gambar' => 'pos_foods/Nasi Ramas Ikan Bakar 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Dendeng Cabe Hijau', 'deskripsi' => 'Nasi ramas dengan dendeng daging balado cabe hijau gurih', 'harga' => 28000, 'gambar' => 'pos_foods/Nasi Ramas Dendeng Cabe Hijau 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Dendeng Cabe Merah', 'deskripsi' => '★ Best Seller - Nasi ramas dengan dendeng balado cabe merah pedas nikmat', 'harga' => 28000, 'gambar' => 'pos_foods/Nasi Ramas Dendeng Cabe Merah 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Rendang Ayam', 'deskripsi' => 'Nasi ramas dengan rendang ayam bumbu empuk kaya rempah', 'harga' => 25000, 'gambar' => 'pos_foods/Nasi Ramas Rendang Ayam 25K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Nasi Ramas Rendang Daging', 'deskripsi' => 'Nasi ramas dengan rendang daging sapi empuk', 'harga' => 28000, 'gambar' => 'pos_foods/Nasi Ramas Rendang Daging 28K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Indomie Rebus + Telur', 'deskripsi' => 'Indomie kuah hangat dengan telur', 'harga' => 18000, 'gambar' => 'pos_foods/Indomie Rebus + Telur 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Indomie Rebus Double + Telur', 'deskripsi' => 'Indomie kuah porsi ganda dengan telur', 'harga' => 23000, 'gambar' => 'pos_foods/Indomie Rebus Double + Telur 23K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Indomie Goreng + Telur', 'deskripsi' => 'Indomie goreng lezat dengan telur', 'harga' => 18000, 'gambar' => 'pos_foods/Indomie Goreng + Telur 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Indomie Goreng Double + Telur', 'deskripsi' => 'Indomie goreng porsi ganda dengan telur', 'harga' => 23000, 'gambar' => 'pos_foods/Indomie Goreng Double + Telur 23K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Pop Mie Goreng', 'deskripsi' => 'Pop mie goreng praktis dan gurih', 'harga' => 13000, 'gambar' => 'pos_foods/Pop Mie Goreng 13K.png', 'status' => 'Aktif'],
            ['category_id' => $catMakanan->id, 'nama' => 'Pop Mie Kuah', 'deskripsi' => 'Pop mie kuah rasa hangat', 'harga' => 13000, 'gambar' => 'pos_foods/Pop Mie Kuah 13K.png', 'status' => 'Aktif'],

            // --- ADDITIONAL (TAMBAHAN) ---
            ['category_id' => $catAdditional->id, 'nama' => 'Telur Rebus', 'deskripsi' => 'Tambahan 1 butir telur rebus', 'harga' => 5000, 'gambar' => 'pos_foods/Telur Rebus 5K.png', 'status' => 'Aktif'],
            ['category_id' => $catAdditional->id, 'nama' => 'Telur Ceplok', 'deskripsi' => 'Tambahan 1 butir telur ceplok goreng', 'harga' => 6000, 'gambar' => 'pos_foods/Telur Ceplok 6K.png', 'status' => 'Aktif'],
            ['category_id' => $catAdditional->id, 'nama' => 'Telur Dadar', 'deskripsi' => 'Tambahan 1 butir telur dadar gurih', 'harga' => 10000, 'gambar' => 'pos_foods/Telur Dadar 10K.png', 'status' => 'Aktif'],
            ['category_id' => $catAdditional->id, 'nama' => 'Nasi Putih', 'deskripsi' => 'Tambahan 1 porsi nasi putih hangat', 'harga' => 6000, 'gambar' => 'pos_foods/Nasi Putih 6K.png', 'status' => 'Aktif'],

            // --- MINUMAN ---
            ['category_id' => $catMinuman->id, 'nama' => 'Teh Manis / Tawar Hot', 'deskripsi' => 'Teh hangat manis atau tawar', 'harga' => 6000, 'gambar' => 'pos_foods/Teh Manis Tawar Hot 6K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Teh Es', 'deskripsi' => 'Es teh manis dingin segar', 'harga' => 6000, 'gambar' => 'pos_foods/Teh Es 6K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Jeruk Ice/Hot', 'deskripsi' => 'Es jeruk peras / jeruk hangat kaya vitamin C', 'harga' => 15000, 'gambar' => 'pos_foods/Jeruk Ice Hot 15K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Kopi Hitam Hot', 'deskripsi' => 'Kopi hitam hangat harum khas Palantea', 'harga' => 10000, 'gambar' => 'pos_foods/Kopi Hitam Hot 10K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Kopi Hitam Ice', 'deskripsi' => 'Kopi hitam es segar', 'harga' => 15000, 'gambar' => 'pos_foods/Kopi Hitam Ice 15K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Kopi Gingseng Ice/Hot', 'deskripsi' => 'Kopi gingseng kaya stamina (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Kopi Gingseng 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Kopi Cappuccino Ice/Hot', 'deskripsi' => 'Kopi cappuccino manis creamy (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Kopi Cappuccino 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Kopi Susu Ice / Hot', 'deskripsi' => 'Kopi susu nikmat dan gurih (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Kopi Susu 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Milo Ice/Hot', 'deskripsi' => 'Minuman cokelat Milo (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Milo 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Matcha Ice', 'deskripsi' => 'Es teh hijau matcha manis dan segar', 'harga' => 17000, 'gambar' => 'pos_foods/Matcha Ice 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Teh Susu Ice/Hot', 'deskripsi' => 'Teh campur susu manis lembut (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Teh Susu 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Teh Tarik Ice/Hot', 'deskripsi' => 'Teh tarik khas (dingin / hangat)', 'harga' => 17000, 'gambar' => 'pos_foods/Teh Tarik 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Lychee Tea Ice/Hot', 'deskripsi' => 'Es teh buah lengkeng lychee manis harum', 'harga' => 17000, 'gambar' => 'pos_foods/Lychee Tea 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Lemon Tea Ice/Hot', 'deskripsi' => 'Es teh lemon segar kaya rasa asam manis', 'harga' => 17000, 'gambar' => 'pos_foods/Lemon Tea 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Jus Kale', 'deskripsi' => '100% Fresh - Jus sayur Kale segar dipetik langsung dari kebun hidroponik Palantea', 'harga' => 18000, 'gambar' => 'pos_foods/Jus Kale 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Wedang Jahe Merah Ice/Hot', 'deskripsi' => 'Minuman tradisional jahe merah hangat/es menyehatkan', 'harga' => 17000, 'gambar' => 'pos_foods/Wedang Jahe Merah 17K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Air Mineral 600ml', 'deskripsi' => 'Air mineral botol sedang 600ml', 'harga' => 5000, 'gambar' => 'pos_foods/Air Mineral 600ml 5K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Air Mineral 330ml', 'deskripsi' => 'Air mineral botol kecil 330ml', 'harga' => 3000, 'gambar' => 'pos_foods/Air Mineral 330ml 3K.png', 'status' => 'Aktif'],
            ['category_id' => $catMinuman->id, 'nama' => 'Es Kosong', 'deskripsi' => 'Segelas es batu', 'harga' => 4000, 'gambar' => 'pos_foods/Es Kosong 4K.png', 'status' => 'Aktif'],

            // --- SNACK (CAMILAN) ---
            ['category_id' => $catSnack->id, 'nama' => 'Pempek Palantea (Isi 6 Pcs)', 'deskripsi' => '★ Menu Baru - Pempek asli ikan tenggiri disajikan dengan kuah cuko segar (Isi 6 pcs)', 'harga' => 30000, 'gambar' => 'pos_foods/Pempek [HARGA].png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'French Fries', 'deskripsi' => 'Kentang goreng stik renyah gurih', 'harga' => 18000, 'gambar' => 'pos_foods/French Fries 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'Mix Platter', 'deskripsi' => 'Kombinasi camilan french fries, nugget, dan sosis', 'harga' => 20000, 'gambar' => 'pos_foods/Mix Platter 20K.png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'Nugget Ayam', 'deskripsi' => 'Nugget olahan daging ayam pilihan goreng renyah', 'harga' => 18000, 'gambar' => 'pos_foods/Nugget Ayam 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'Pastel Sayur Mini (Isi 5 Pcs)', 'deskripsi' => 'Pastel mini isi olahan sayur gurih (5 pcs)', 'harga' => 18000, 'gambar' => 'pos_foods/Pastel Sayur Mini (Isi 5 Pcs) 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'Risolles Sayur (Isi 4 Pcs)', 'deskripsi' => 'Risoles isi sayur creamy renyah (4 pcs)', 'harga' => 18000, 'gambar' => 'pos_foods/Risolles Sayur (Isi 4 Pcs) 18K.png', 'status' => 'Aktif'],
            ['category_id' => $catSnack->id, 'nama' => 'Pisang Kipas (Isi 3 Pcs)', 'deskripsi' => 'Pisang goreng tepung bentuk kipas crispy manis (3 pcs)', 'harga' => 18000, 'gambar' => 'pos_foods/Pisang Kipas (Isi 3 Pcs) 18K.png', 'status' => 'Aktif'],
        ];

        foreach ($foods as $food) {
            PosFood::updateOrCreate(
                ['nama' => $food['nama']],
                $food
            );
        }
    }
}

