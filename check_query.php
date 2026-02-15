<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$date = '2026-03-02';

$bookedSlots = App\Models\Kunjungan::where('tanggal', $date)
    ->where('status', '!=', 'Batal')
    ->where(function ($q) {
        $q->where('payment_status', 'paid')
          ->orWhere('payment_status', 'pending');
    })
    ->pluck('jam') // formatnya H:i:s di DB
    ->map(function ($jam) {
        return substr($jam, 0, 5); // Ambil 'HH:mm' saja
    })
    ->toArray();

echo json_encode($bookedSlots);
