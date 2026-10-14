<?php
/**
 * Setup & Deployment Helper for cPanel Jagoan Hosting
 * Central Palantea Hydroponic & Space (CPH Project)
 * 
 * HAPUS FILE INI SETELAH SELESAI DIGUNAKAN DEMI KEAMANAN!
 */

// Aktifkan error display untuk kemudahan debugging deployment
ini_set('display_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Auto-purge stale bootstrap cache files on load (memastikan rute baru langsung aktif tanpa 404)
$autoClearedFiles = [];
foreach (['routes-v7.php', 'routes.php', 'config.php'] as $cFile) {
    $p = __DIR__ . '/../bootstrap/cache/' . $cFile;
    if (file_exists($p)) {
        @unlink($p);
        $autoClearedFiles[] = $cFile;
    }
}

// Auto-sinkronisasi foto menu makanan terbaru ke database
try {
    if (\Illuminate\Support\Facades\Schema::hasTable('pos_foods')) {
        $foodImages = [
            'Nasi Ayam Barendo Palantea' => 'pos_foods/nasi_ayam_barendo_palantea.jpg',
            'Nasi Goreng Ayam Barendo Palantea' => 'pos_foods/nasi_goreng_ayam_barendo_palantea.jpg',
            'Selada Kuah Kacang Palantea' => 'pos_foods/selada_kuah_kacang_palantea.jpg',
            'Nasi Ramas Ikan Bakar' => 'pos_foods/nasi_ramas_ikan_bakar.jpg',
            'Nasi Ramas Rendang Daging' => 'pos_foods/nasi_ramas_rendang_daging.jpg',
        ];
        foreach ($foodImages as $fName => $imgPath) {
            \Illuminate\Support\Facades\DB::table('pos_foods')
                ->where('nama', $fName)
                ->update(['gambar' => $imgPath]);
        }
    }
} catch (\Exception $e) {
    // ignore
}

$action = $_GET['action'] ?? null;
$logs = [];

if (!empty($autoClearedFiles)) {
    $logs[] = ">>> [AUTO-PURGE] Cache lama berhasil dihapus: " . implode(', ', $autoClearedFiles) . " (Rute baru siap digunakan!)";
}

if ($action) {
    try {
        if ($action === 'all' || $action === 'storage') {
            $logs[] = ">>> Menjalankan storage:link...";
            try {
                Illuminate\Support\Facades\Artisan::call('storage:link');
                $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());
            } catch (Exception $e) {
                $logs[] = "[INFO] " . $e->getMessage();
            }
        }

        if ($action === 'all' || $action === 'migrate_safe') {
            $logs[] = "\n>>> Menjalankan Migrasi Database Baru (Aman - Tanpa Hapus Data Lama)...";
            Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());

            // Pastikan kolom status pos_tables bertipe VARCHAR(50) agar mendukung UNAVAILABLE
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_tables MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'");
                $logs[] = "[OK] Kolom status pos_tables berhasil disesuaikan untuk mendukung 'UNAVAILABLE'.";
            } catch (\Exception $e) {
                $logs[] = "[INFO] " . $e->getMessage();
            }

            // Pastikan kolom is_served di pos_order_items ada untuk fitur antar sebagian
            try {
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'is_served')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN is_served TINYINT(1) NOT NULL DEFAULT 0");
                    $logs[] = "[OK] Kolom is_served berhasil ditambahkan ke pos_order_items.";
                }
            } catch (\Exception $e) {
                $logs[] = "[INFO] " . $e->getMessage();
            }

            // Pastikan kolom status dan batal_alasan di pos_order_items ada untuk pembatalan item
            try {
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'status')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'");
                    $logs[] = "[OK] Kolom status berhasil ditambahkan ke pos_order_items.";
                }
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'batal_alasan')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN batal_alasan VARCHAR(255) NULL");
                    $logs[] = "[OK] Kolom batal_alasan berhasil ditambahkan ke pos_order_items.";
                }
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_order_items', 'batch_no')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_order_items ADD COLUMN batch_no INT NOT NULL DEFAULT 1");
                    $logs[] = "[OK] Kolom batch_no berhasil ditambahkan ke pos_order_items.";
                }
            } catch (\Exception $e) {
                $logs[] = "[INFO] " . $e->getMessage();
            }

            // Pastikan kolom pos_payments & pos_orders mendukung SPLIT payment & koreksi kembalian
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments MODIFY COLUMN metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Cash'");
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_orders MODIFY COLUMN metode_pembayaran VARCHAR(50) NULL DEFAULT 'Cash'");
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'cash_amount')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN cash_amount INT NOT NULL DEFAULT 0");
                    $logs[] = "[OK] Kolom cash_amount berhasil ditambahkan ke pos_payments.";
                }
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'qris_amount')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN qris_amount INT NOT NULL DEFAULT 0");
                    $logs[] = "[OK] Kolom qris_amount berhasil ditambahkan ke pos_payments.";
                }
                if (!\Illuminate\Support\Facades\Schema::hasColumn('pos_payments', 'catatan_koreksi')) {
                    \Illuminate\Support\Facades\DB::statement("ALTER TABLE pos_payments ADD COLUMN catatan_koreksi TEXT NULL");
                    $logs[] = "[OK] Kolom catatan_koreksi berhasil ditambahkan ke pos_payments.";
                }
            } catch (\Exception $e) {
                $logs[] = "[INFO] " . $e->getMessage();
            }

            $logs[] = "\n>>> Menjalankan Seeder Menu Kantin & Akun POS (PosSeeder)...";
            Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'PosSeeder', '--force' => true]);
            $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());

            // Direct sync seluruh 50 foto menu kantin & harga resmi
            $allFoodMappings = [
                'Nasi Ayam Barendo Palantea' => ['gambar' => 'pos_foods/Nasi Ayam Barendo 25K.png', 'harga' => 25000],
                'Nasi Goreng Ayam Barendo Palantea' => ['gambar' => 'pos_foods/Nasi Goreng Ayam Barendo 28K.png', 'harga' => 28000],
                'Mie Goreng Ayam Barendo Palantea' => ['gambar' => 'pos_foods/Mie Goreng Ayam Barendo 28K.png', 'harga' => 28000],
                'Mienas Palantea (Mie Nasi Goreng)' => ['gambar' => 'pos_foods/Mienas Palantea 25K.png', 'harga' => 25000],
                'Nasi Dadar Palantea' => ['gambar' => 'pos_foods/Nasi Dadar Palantea 17K.png', 'harga' => 17000],
                'Selada Kuah Kacang Palantea' => ['gambar' => 'pos_foods/Selada Kuah Kacang 20K.png', 'harga' => 20000],
                'Nasi Ramas Ayam Bakar' => ['gambar' => 'pos_foods/Nasi Ramas Ayam Bakar 25K.png', 'harga' => 25000],
                'Nasi Ramas Ikan Bakar' => ['gambar' => 'pos_foods/Nasi Ramas Ikan Bakar 28K.png', 'harga' => 28000],
                'Nasi Ramas Dendeng Cabe Hijau' => ['gambar' => 'pos_foods/Nasi Ramas Dendeng Cabe Hijau 28K.png', 'harga' => 28000],
                'Nasi Ramas Dendeng Cabe Merah' => ['gambar' => 'pos_foods/Nasi Ramas Dendeng Cabe Merah 28K.png', 'harga' => 28000],
                'Nasi Ramas Rendang Ayam' => ['gambar' => 'pos_foods/Nasi Ramas Rendang Ayam 25K.png', 'harga' => 25000],
                'Nasi Ramas Rendang Daging' => ['gambar' => 'pos_foods/Nasi Ramas Rendang Daging 28K.png', 'harga' => 28000],
                'Indomie Rebus + Telur' => ['gambar' => 'pos_foods/Indomie Rebus + Telur 18K.png', 'harga' => 18000],
                'Indomie Rebus Double + Telur' => ['gambar' => 'pos_foods/Indomie Rebus Double + Telur 23K.png', 'harga' => 23000],
                'Indomie Goreng + Telur' => ['gambar' => 'pos_foods/Indomie Goreng + Telur 18K.png', 'harga' => 18000],
                'Indomie Goreng Double + Telur' => ['gambar' => 'pos_foods/Indomie Goreng Double + Telur 23K.png', 'harga' => 23000],
                'Pop Mie Goreng' => ['gambar' => 'pos_foods/Pop Mie Goreng 13K.png', 'harga' => 13000],
                'Pop Mie Kuah' => ['gambar' => 'pos_foods/Pop Mie Kuah 13K.png', 'harga' => 13000],
                'Telur Rebus' => ['gambar' => 'pos_foods/Telur Rebus 5K.png', 'harga' => 5000],
                'Telur Ceplok' => ['gambar' => 'pos_foods/Telur Ceplok 6K.png', 'harga' => 6000],
                'Telur Dadar' => ['gambar' => 'pos_foods/Telur Dadar 10K.png', 'harga' => 10000],
                'Nasi Putih' => ['gambar' => 'pos_foods/Nasi Putih 6K.png', 'harga' => 6000],
                'Teh Manis / Tawar Hot' => ['gambar' => 'pos_foods/Teh Manis Tawar Hot 6K.png', 'harga' => 6000],
                'Teh Es' => ['gambar' => 'pos_foods/Teh Es 6K.png', 'harga' => 6000],
                'Jeruk Ice/Hot' => ['gambar' => 'pos_foods/Jeruk Ice Hot 15K.png', 'harga' => 15000],
                'Kopi Hitam Hot' => ['gambar' => 'pos_foods/Kopi Hitam Hot 10K.png', 'harga' => 10000],
                'Kopi Hitam Ice' => ['gambar' => 'pos_foods/Kopi Hitam Ice 15K.png', 'harga' => 15000],
                'Kopi Gingseng Ice/Hot' => ['gambar' => 'pos_foods/Kopi Gingseng 17K.png', 'harga' => 17000],
                'Kopi Cappuccino Ice/Hot' => ['gambar' => 'pos_foods/Kopi Cappuccino 17K.png', 'harga' => 17000],
                'Kopi Susu Ice / Hot' => ['gambar' => 'pos_foods/Kopi Susu 17K.png', 'harga' => 17000],
                'Milo Ice/Hot' => ['gambar' => 'pos_foods/Milo 17K.png', 'harga' => 17000],
                'Matcha Ice' => ['gambar' => 'pos_foods/Matcha Ice 17K.png', 'harga' => 17000],
                'Teh Susu Ice/Hot' => ['gambar' => 'pos_foods/Teh Susu 17K.png', 'harga' => 17000],
                'Teh Tarik Ice/Hot' => ['gambar' => 'pos_foods/Teh Tarik 17K.png', 'harga' => 17000],
                'Lychee Tea Ice/Hot' => ['gambar' => 'pos_foods/Lychee Tea 17K.png', 'harga' => 17000],
                'Lemon Tea Ice/Hot' => ['gambar' => 'pos_foods/Lemon Tea 17K.png', 'harga' => 17000],
                'Jus Kale' => ['gambar' => 'pos_foods/Jus Kale 18K.png', 'harga' => 18000],
                'Wedang Jahe Merah Ice/Hot' => ['gambar' => 'pos_foods/Wedang Jahe Merah 17K.png', 'harga' => 17000],
                'Air Mineral 600ml' => ['gambar' => 'pos_foods/Air Mineral 600ml 5K.png', 'harga' => 5000],
                'Air Mineral 330ml' => ['gambar' => 'pos_foods/Air Mineral 330ml 3K.png', 'harga' => 3000],
                'Es Kosong' => ['gambar' => 'pos_foods/Es Kosong 4K.png', 'harga' => 4000],
                'French Fries' => ['gambar' => 'pos_foods/French Fries 18K.png', 'harga' => 18000],
                'Mix Platter' => ['gambar' => 'pos_foods/Mix Platter 20K.png', 'harga' => 20000],
                'Nugget Ayam' => ['gambar' => 'pos_foods/Nugget Ayam 18K.png', 'harga' => 18000],
                'Pastel Sayur Mini (Isi 5 Pcs)' => ['gambar' => 'pos_foods/Pastel Sayur Mini (Isi 5 Pcs) 18K.png', 'harga' => 18000],
                'Risolles Sayur (Isi 4 Pcs)' => ['gambar' => 'pos_foods/Risolles Sayur (Isi 4 Pcs) 18K.png', 'harga' => 18000],
                'Pisang Kipas (Isi 3 Pcs)' => ['gambar' => 'pos_foods/Pisang Kipas (Isi 3 Pcs) 18K.png', 'harga' => 18000],
                'Pempek Palantea (Isi 6 Pcs)' => ['gambar' => 'pos_foods/Pempek [HARGA].png', 'harga' => 30000],
                'Nasi Goreng' => ['gambar' => 'pos_foods/Nasi Goreng Ayam Barendo 28K.png', 'harga' => 19000],
                'Nasi Goreng Pattaya' => ['gambar' => 'pos_foods/Nasi Dadar Palantea 17K.png', 'harga' => 24000],
            ];
            $syncCount = 0;
            foreach ($allFoodMappings as $fName => $fData) {
                $affected = \Illuminate\Support\Facades\DB::table('pos_foods')
                    ->where('nama', $fName)
                    ->update([
                        'gambar' => $fData['gambar'],
                        'harga' => $fData['harga'],
                    ]);
                if ($affected) {
                    $syncCount++;
                }
            }
            $logs[] = "[OK] Seluruh {$syncCount} menu makanan & foto resmi berhasil disinkronkan ke database!";
        }

        if ($action === 'migrate_fresh') {
            $logs[] = "\n>>> PERINGATAN: Menjalankan migrate:fresh --seed (Reset Total)...";
            Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
            $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());
        }

        if ($action === 'all' || $action === 'cache') {
            $logs[] = "\n>>> Membersihkan Seluruh Cache Laravel...";
            Illuminate\Support\Facades\Artisan::call('route:clear');
            Illuminate\Support\Facades\Artisan::call('config:clear');
            Illuminate\Support\Facades\Artisan::call('view:clear');
            Illuminate\Support\Facades\Artisan::call('cache:clear');
            
            // Hapus file fisik cache bootstrap secara tuntas
            foreach (['routes-v7.php', 'routes.php', 'config.php'] as $cFile) {
                $p = __DIR__ . '/../bootstrap/cache/' . $cFile;
                if (file_exists($p)) {
                    @unlink($p);
                }
            }
            $logs[] = "[OK] Route cache, config, view, dan app cache berhasil dibersihkan! Rute baru (/pos/monitor) langsung aktif.";
        }

        $logs[] = "\n=== PROSES SELESAI DENGAN SUKSES ===";
    } catch (Exception $e) {
        $logs[] = "\n[ERROR] " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPH Setup cPanel - Central Palantea</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; padding: 30px 15px; color: #f8fafc; margin: 0; }
        .card { background: #1e293b; max-width: 720px; margin: 0 auto; padding: 25px 30px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 1px solid #334155; }
        h1 { color: #22c55e; font-size: 22px; margin-top: 0; display: flex; align-items: center; gap: 8px; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
        .log-box { background: #0b1120; color: #38bdf8; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 20px 0; white-space: pre-wrap; word-break: break-all; border: 1px solid #1e293b; }
        .btn-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 20px 0; }
        @media (min-width: 640px) { .btn-grid { grid-template-columns: 1fr 1fr; } }
        .btn { display: block; text-align: center; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-green { background: #16a34a; color: white; border: 1px solid #22c55e; }
        .btn-green:hover { background: #15803d; }
        .btn-blue { background: #2563eb; color: white; border: 1px solid #3b82f6; }
        .btn-blue:hover { background: #1d4ed8; }
        .btn-gray { background: #334155; color: #e2e8f0; border: 1px solid #475569; }
        .btn-gray:hover { background: #475569; }
        .btn-danger { background: #b91c1c; color: white; border: 1px solid #dc2626; }
        .btn-danger:hover { background: #991b1b; }
        .btn-full { grid-column: 1 / -1; font-size: 16px; padding: 14px; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .badge-green { background: #14532d; color: #86efac; }
        .nav-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
        .nav-links a { color: #38bdf8; text-decoration: none; font-size: 13px; background: #0f172a; padding: 6px 12px; border-radius: 6px; border: 1px solid #334155; }
        .nav-links a:hover { background: #1e293b; border-color: #38bdf8; }
        .warning-box { background: #451a03; border: 1px solid #b45309; color: #fde68a; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 25px; }
    </style>
</head>
<body>
<div class="card">
    <h1>🚀 Helper Deployment & Update cPanel</h1>
    <p>Gunakan tombol di bawah untuk memperbarui database POS Kantin, membuat storage symlink, dan membersihkan cache Laravel setelah upload file update.</p>

    <?php if (!empty($logs)): ?>
    <div class="log-box"><?= htmlspecialchars(implode("\n", $logs)) ?></div>
    <?php endif; ?>

    <div class="btn-grid">
        <a href="?action=cache" class="btn btn-blue btn-full">
            🧹 Bersihkan Cache & Perbarui Rute (Solusi 404 Monitor)
        </a>
        <a href="?action=all" class="btn btn-green btn-full">
            ⚡ 1-Click Update Otomatis (Migrate POS + Seed Menu + Cache)
        </a>
        <a href="?action=migrate_safe" class="btn btn-gray">
            📦 Migrate & Seed POS Saja (Aman)
        </a>
        <a href="?action=storage" class="btn btn-gray">
            🔗 Buat Storage Link (storage:link)
        </a>
        <a href="?action=migrate_fresh" class="btn btn-danger" onclick="return confirm('PERINGATAN! Ini akan MENGHAPUS SEMUA DATA dan mereset total database. Apakah Anda benar-benar yakin?')">
            ⚠️ Reset Fresh Database (Hati-hati!)
        </a>
    </div>

    <p style="margin-top:25px; font-weight:600; color:#e2e8f0;">🔗 Cek Halaman Setelah Update:</p>
    <div class="nav-links">
        <a href="/pos/monitor" target="_blank" style="background:#1e3a8a; border-color:#3b82f6; color:#93c5fd; font-weight:bold;">📺 Monitor Pesanan (Baru)</a>
        <a href="/login" target="_blank">🔑 Halaman Login</a>
        <a href="/order" target="_blank">🛒 Halaman Kasir POS</a>
        <a href="/kitchen" target="_blank">🍳 Papan Dapur (KDS)</a>
        <a href="/admin/pos-reports" target="_blank">📊 Laporan Kantin</a>
        <a href="/admin/pos-foods" target="_blank">🍱 Kelola Menu Makanan</a>
        <a href="/" target="_blank">🏠 Website Utama</a>
    </div>

    <div class="warning-box">
        ⚠️ <strong>PENTING:</strong> Setelah proses update selesai dan sistem berjalan normal, segera <strong>HAPUS file <code>setup_cpanel.php</code></strong> dari File Manager cPanel demi keamanan server Anda.
    </div>
</div>
</body>
</html>

