<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class KunjunganSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     * Updated: Menggunakan user_id alih-alih pelanggan_id
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel kunjungan
        DB::table('kunjungan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        // Ambil user dengan role customer
        $customers = DB::table('users')->where('role', 'customer')->pluck('id')->toArray();
        
        if (empty($customers)) {
            return;
        }

        $kunjunganData = [];
        $tipeIds = [1, 2]; // Outing Class, Umum
        $statuses = ['Dijadwalkan', 'Selesai'];
        $jams = ['09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00'];

        foreach ($customers as $index => $customerId) {
            $tipeId = $tipeIds[array_rand($tipeIds)];
            $jumlah = rand(1, 30);
            $isCompleted = rand(0, 1);
            
            $kunjunganData[] = [
                'user_id' => $customerId,
                'tipe_id' => $tipeId,
                'tanggal' => $isCompleted 
                    ? Carbon::now()->subDays(rand(1, 30))->format('Y-m-d')
                    : Carbon::now()->addDays(rand(1, 30))->format('Y-m-d'),
                'jam' => $jams[array_rand($jams)],
                'jumlah_dewasa' => $jumlah,
                'jumlah_anak' => 0,
                'jumlah_balita' => 0,
                'total_biaya' => $jumlah * 15000,
                'status' => $isCompleted ? 'Selesai' : 'Dijadwalkan',
                'payment_status' => 'paid',
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ];
        }

        if (!empty($kunjunganData)) {
            DB::table('kunjungan')->insert($kunjunganData);
        }
    }
}
