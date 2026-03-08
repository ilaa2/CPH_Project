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
        $metodePengiriman = ['Ambil Langsung', 'Kurir Lokal', 'JNE - REG'];
        $ekspedisiOptions = [
            ['ekspedisi' => 'JNE - REG', 'estimasi' => '2-3 Hari'],
            ['ekspedisi' => 'JNE - YES', 'estimasi' => '1 Hari'],
            ['ekspedisi' => 'POS - Reguler', 'estimasi' => '3-5 Hari'],
            ['ekspedisi' => 'TIKI - REG', 'estimasi' => '2-4 Hari'],
        ];
        $resiPrefixes = ['JNE' => 'JNE', 'POS' => 'POS', 'TIKI' => 'TKI', 'Kurir Lokal' => 'KRL'];

        // Buat pesanan untuk setiap customer
        foreach ($customers as $index => $customerId) {
            // Setiap customer mendapat 1-2 pesanan
            $jumlahPesanan = rand(1, 2);

            for ($p = 0; $p < $jumlahPesanan; $p++) {
                $status = $statuses[array_rand($statuses)];
                $metode = $metodePengiriman[array_rand($metodePengiriman)];
                $isPickup = $metode === 'Ambil Langsung';
                $isEkspedisi = !in_array($metode, ['Ambil Langsung', 'Kurir Lokal']);
                $ongkir = $isPickup ? 0 : rand(10000, 30000);
                $tanggalPesan = Carbon::now()->subDays(rand(1, 30));
                $nomorPesanan = 'CPH-' . $tanggalPesan->format('Ymd') . '-' . str_pad($index * 2 + $p + 1, 4, '0', STR_PAD_LEFT);

                // Ekspedisi detail (hanya untuk metode ekspedisi)
                $ekspedisiDetail = $isEkspedisi ? $ekspedisiOptions[array_rand($ekspedisiOptions)] : null;

                // Generate nomor resi untuk pesanan yang sudah shipped/completed (bukan pickup)
                $nomorResi = null;
                if (in_array($status, ['shipped', 'completed']) && !$isPickup) {
                    if ($metode === 'Kurir Lokal') {
                        $nomorResi = 'KRL' . strtoupper(substr(md5(rand()), 0, 10));
                    } elseif ($ekspedisiDetail) {
                        $prefix = explode(' ', $ekspedisiDetail['ekspedisi'])[0];
                        $nomorResi = strtoupper(substr($prefix, 0, 3)) . rand(1000000000, 9999999999);
                    }
                }

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
                    'metode_pengiriman' => $isEkspedisi ? ($ekspedisiDetail['ekspedisi'] ?? $metode) : $metode,
                    'ekspedisi' => $ekspedisiDetail['ekspedisi'] ?? null,
                    'estimasi' => $ekspedisiDetail['estimasi'] ?? null,
                    'nomor_resi' => $nomorResi,
                    'alamat_pengiriman' => $isPickup
                        ? 'AMBIL LANGSUNG'
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
