<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class PesananSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     * Updated: Menggunakan user_id dan menyertakan pesanan_items dengan produk real
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel
        DB::table('pesanan_items')->truncate();
        DB::table('pesanan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        // Ambil user dengan role customer
        $customers = DB::table('users')->where('role', 'customer')->pluck('id')->toArray();

        if (empty($customers)) {
            return;
        }

        // Ambil semua produk yang tersedia
        $products = DB::table('products')->whereNull('deleted_at')->get();

        if ($products->isEmpty()) {
            return;
        }

        $statuses = ['pending', 'processed', 'shipped', 'completed'];
        $metodePengiriman = ['Ambil di Toko', 'Kurir Lokal', 'JNE - REG'];

        // Buat pesanan untuk setiap customer
        foreach ($customers as $index => $customerId) {
            // Setiap customer mendapat 1-2 pesanan
            $jumlahPesanan = rand(1, 2);

            for ($p = 0; $p < $jumlahPesanan; $p++) {
                $status = $statuses[array_rand($statuses)];
                $metode = $metodePengiriman[array_rand($metodePengiriman)];
                $ongkir = $metode === 'Ambil di Toko' ? 0 : rand(10000, 30000);
                $tanggalPesan = Carbon::now()->subDays(rand(1, 30));
                $nomorPesanan = 'CPH-' . $tanggalPesan->format('Ymd') . '-' . str_pad($index * 2 + $p + 1, 4, '0', STR_PAD_LEFT);

                // Pilih 1-3 produk acak untuk pesanan ini
                $selectedProducts = $products->random(rand(1, 3));
                $subtotal = 0;
                $itemsToInsert = [];

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 5);
                    $itemSubtotal = $product->harga * $qty;
                    $subtotal += $itemSubtotal;

                    $itemsToInsert[] = [
                        'produk_id' => $product->id,
                        'jumlah' => $qty,
                        'subtotal' => $itemSubtotal,
                        'created_at' => $tanggalPesan,
                        'updated_at' => $tanggalPesan,
                    ];
                }

                // Insert pesanan
                $pesananId = DB::table('pesanan')->insertGetId([
                    'user_id' => $customerId,
                    'nomor_pesanan' => $nomorPesanan,
                    'tanggal' => $tanggalPesan->format('Y-m-d'),
                    'total' => $subtotal + $ongkir,
                    'biaya_pengiriman' => $ongkir,
                    'status' => $status,
                    'metode_pengiriman' => $metode,
                    'alamat_pengiriman' => $metode === 'Ambil di Toko'
                        ? 'Ambil di Toko'
                        : DB::table('users')->where('id', $customerId)->value('alamat') ?? 'Jl. Contoh No. ' . rand(1, 100),
                    'payment_status' => $status === 'pending' ? 'unpaid' : 'paid',
                    'paid_at' => $status !== 'pending' ? $tanggalPesan->copy()->addMinutes(rand(5, 60)) : null,
                    'created_at' => $tanggalPesan,
                    'updated_at' => $tanggalPesan,
                ]);

                // Insert pesanan items dengan pesanan_id
                foreach ($itemsToInsert as &$item) {
                    $item['pesanan_id'] = $pesananId;
                }

                DB::table('pesanan_items')->insert($itemsToInsert);
            }
        }
    }
}
