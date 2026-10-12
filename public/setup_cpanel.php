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

$action = $_GET['action'] ?? null;
$logs = [];

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

            $logs[] = "\n>>> Menjalankan Seeder Menu Kantin & Akun POS (PosSeeder)...";
            Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'PosSeeder', '--force' => true]);
            $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());
        }

        if ($action === 'migrate_fresh') {
            $logs[] = "\n>>> PERINGATAN: Menjalankan migrate:fresh --seed (Reset Total)...";
            Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
            $logs[] = "[OK] " . trim(Illuminate\Support\Facades\Artisan::output());
        }

        if ($action === 'all' || $action === 'cache') {
            $logs[] = "\n>>> Membersihkan Cache Lama...";
            Illuminate\Support\Facades\Artisan::call('config:clear');
            Illuminate\Support\Facades\Artisan::call('route:clear');
            Illuminate\Support\Facades\Artisan::call('view:clear');
            Illuminate\Support\Facades\Artisan::call('cache:clear');

            $logs[] = "\n>>> Membuat Cache Baru untuk Performa Cepat...";
            Illuminate\Support\Facades\Artisan::call('config:cache');
            Illuminate\Support\Facades\Artisan::call('route:cache');
            Illuminate\Support\Facades\Artisan::call('view:cache');
            $logs[] = "[OK] Config, Route, dan View Cache berhasil diperbarui!";
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
    <p>Gunakan tombol di bawah untuk memperbarui database POS Kantin, membuat storage symlink, dan memperbarui cache Laravel setelah upload file update.</p>

    <?php if (!empty($logs)): ?>
    <div class="log-box"><?= htmlspecialchars(implode("\n", $logs)) ?></div>
    <?php endif; ?>

    <div class="btn-grid">
        <a href="?action=all" class="btn btn-green btn-full">
            ⚡ 1-Click Update Otomatis (Migrate POS + Seed Menu + Cache)
        </a>
        <a href="?action=migrate_safe" class="btn btn-blue">
            📦 Migrate & Seed POS Saja (Aman)
        </a>
        <a href="?action=cache" class="btn btn-gray">
            🧹 Bersihkan & Refresh Cache
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

