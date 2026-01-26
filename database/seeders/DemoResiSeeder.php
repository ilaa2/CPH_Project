<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pesanan;
use App\Models\User;
use App\Models\Produk;
use App\Models\PesananItem;

class DemoResiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari pesanan yang sudah selesai, ambil yang terbaru
        $pesanan = Pesanan::where('status', 'completed')
            ->orWhere('status', 'Selesai')
            ->latest()
            ->first();

        // Jika tidak ada pesanan selesai, cari user dan buat satu
        if (!$pesanan) {
            $user = User::where('role', 'customer')->first();
            if (!$user) {
                $this->command->info('Tidak ada user customer untuk membuat pesanan demo.');
                return;
            }

            $pesanan = Pesanan::create([
                'user_id' => $user->id,
                'tanggal' => now()->subDays(3),
                'total' => 150000,
                'status' => 'completed',
                'alamat_pengiriman' => 'Jl. Demo Untuk Resi No. 123, Jakarta',
                'metode_pengiriman' => 'Ekspedisi (JNE)',
                'biaya_pengiriman' => 15000,
                'ekspedisi' => 'JNE',
                'estimasi' => '2-3 Hari',
                'nomor_resi' => 'JNEX1234567890', // Demo Resi
                'snap_token' => 'dummy_token_' . uniqid(),
            ]);

            // Tambahkan item dummy
            $produk = Produk::first();
            if ($produk) {
                PesananItem::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $produk->id,
                    'jumlah' => 1,
                    'subtotal' => 150000,
                ]);
            }
            
            $this->command->info("Pesanan Demo BARU berhasil dibuat dengan Resi: {$pesanan->nomor_resi}");
        } else {
            // Update pesanan yang ada
            $pesanan->update([
                'status' => 'completed', // Pastikan normalized
                'metode_pengiriman' => 'Ekspedisi (JNE)',
                'ekspedisi' => 'JNE',
                'estimasi' => '2-3 Hari',
                'nomor_resi' => 'JNEX1234567890', // Demo Resi
            ]);
            
            $this->command->info("Pesanan ID {$pesanan->id} berhasil diupdate menjadi Demo Resi: {$pesanan->nomor_resi}");
        }
    }
}
