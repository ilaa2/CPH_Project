<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$visits = App\Models\Kunjungan::where('tanggal', '2026-03-02')->get();
echo json_encode($visits->toArray(), JSON_PRETTY_PRINT);
