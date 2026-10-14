# Script Packaging Update CPH Project untuk cPanel Jagoan Hosting
$ErrorActionPreference = "Stop"

$sourceDir = "d:\PA\CPH_Project"
$tempDir = "d:\PA\temp_cph_update"
$zipPath = "d:\PA\CPH_Update_Kantin_September_2026.zip"

Write-Host ">>> Memulai persiapan paket update..."

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 1. Folder app/
$appItems = @(
    "app\Http\Controllers\Pos",
    "app\Http\Controllers\Auth\AuthenticatedSessionController.php",
    "app\Http\Controllers\WelcomeController.php",
    "app\Http\Middleware\EnsureUserCanAccessKitchen.php",
    "app\Http\Middleware\EnsureUserCanAccessPos.php",
    "app\Http\Middleware\HandleInertiaRequests.php",
    "app\Models\PosFood.php",
    "app\Models\PosFoodCategory.php",
    "app\Models\PosOrder.php",
    "app\Models\PosOrderItem.php",
    "app\Models\PosPayment.php",
    "app\Models\PosTable.php",
    "app\Models\User.php"
)

foreach ($file in $appItems) {
    $src = Join-Path $sourceDir $file
    $dst = Join-Path $tempDir $file
    $parent = Split-Path $dst -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    if (Test-Path $src -PathType Container) {
        Copy-Item -Path $src -Destination $parent -Recurse -Force
    } else {
        Copy-Item -Path $src -Destination $dst -Force
    }
}

# 2. Folder bootstrap/
New-Item -ItemType Directory -Path (Join-Path $tempDir "bootstrap") -Force | Out-Null
Copy-Item (Join-Path $sourceDir "bootstrap\app.php") (Join-Path $tempDir "bootstrap\app.php") -Force

# 3. Folder database/
$dbItems = @(
    "database\migrations\2026_09_14_100000_create_pos_system_tables.php",
    "database\migrations\2026_09_14_160836_add_kasir_dapur_to_users_role.php",
    "database\migrations\2026_09_14_163459_add_nama_pelanggan_to_pos_orders_table.php",
    "database\migrations\2026_10_12_220000_allow_unavailable_status_in_pos_tables.php",
    "database\migrations\2026_10_12_221000_add_pempek_palantea_to_pos_foods.php",
    "database\migrations\2026_10_12_222000_add_is_served_to_pos_order_items_table.php",
    "database\migrations\2026_10_13_130000_add_split_payment_and_correction_notes_to_pos_tables.php",
    "database\migrations\2026_10_14_190000_add_batch_no_to_pos_order_items_table.php",
    "database\seeders\DatabaseSeeder.php",
    "database\seeders\PosSeeder.php"
)

foreach ($file in $dbItems) {
    $src = Join-Path $sourceDir $file
    $dst = Join-Path $tempDir $file
    $parent = Split-Path $dst -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item -Path $src -Destination $dst -Force
}

# 4. Folder routes/
New-Item -ItemType Directory -Path (Join-Path $tempDir "routes") -Force | Out-Null
Copy-Item (Join-Path $sourceDir "routes\web.php") (Join-Path $tempDir "routes\web.php") -Force

# 5. Folder resources/
$resItems = @(
    "resources\js\Components\Bar\Sidebar.jsx",
    "resources\js\Layouts\CustomerLayout.jsx",
    "resources\js\Pages\POS"
)

foreach ($file in $resItems) {
    $src = Join-Path $sourceDir $file
    $dst = Join-Path $tempDir $file
    $parent = Split-Path $dst -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    if (Test-Path $src -PathType Container) {
        Copy-Item -Path $src -Destination $parent -Recurse -Force
    } else {
        Copy-Item -Path $src -Destination $dst -Force
    }
}

# 6. Folder public/ & storage/
New-Item -ItemType Directory -Path (Join-Path $tempDir "public") -Force | Out-Null
Copy-Item (Join-Path $sourceDir "public\setup_cpanel.php") (Join-Path $tempDir "public\setup_cpanel.php") -Force
Copy-Item (Join-Path $sourceDir "public\robots.txt") (Join-Path $tempDir "public\robots.txt") -Force
Copy-Item (Join-Path $sourceDir "public\sitemap.xml") (Join-Path $tempDir "public\sitemap.xml") -Force
Copy-Item (Join-Path $sourceDir "public\build") (Join-Path $tempDir "public") -Recurse -Force

if (Test-Path (Join-Path $sourceDir "public\storage\pos_foods")) {
    New-Item -ItemType Directory -Path (Join-Path $tempDir "public\storage") -Force | Out-Null
    Copy-Item (Join-Path $sourceDir "public\storage\pos_foods") (Join-Path $tempDir "public\storage") -Recurse -Force
}

if (Test-Path (Join-Path $sourceDir "storage\app\public\pos_foods")) {
    New-Item -ItemType Directory -Path (Join-Path $tempDir "storage\app\public") -Force | Out-Null
    Copy-Item (Join-Path $sourceDir "storage\app\public\pos_foods") (Join-Path $tempDir "storage\app\public") -Recurse -Force
}

# 7. Root .htaccess & docs/
Copy-Item (Join-Path $sourceDir ".htaccess") (Join-Path $tempDir ".htaccess") -Force
if (Test-Path (Join-Path $sourceDir "docs")) {
    Copy-Item (Join-Path $sourceDir "docs") (Join-Path $tempDir "docs") -Recurse -Force
}

Write-Host ">>> Mengompresi paket ZIP ke $zipPath..."
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath -CompressionLevel Optimal

Remove-Item -Recurse -Force $tempDir

$info = Get-Item $zipPath
$mb = [math]::Round($info.Length / 1MB, 2)
Write-Host ">>> BERHASIL! File ZIP terbuat: $zipPath ($mb MB)"
