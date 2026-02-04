<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class UlasanSeeder extends Seeder
{
    /**
     * Jalankan database seeds.
     * Updated: Menggunakan user_id alih-alih pelanggan_id
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel ulasan
        DB::table('ulasan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        // Ambil user dengan role customer (mulai dari ID 2 karena ID 1 adalah admin)
        $customers = DB::table('users')->where('role', 'customer')->pluck('id')->toArray();
        
        if (empty($customers)) {
            // Jika belum ada customer, skip seeder ini
            return;
        }

        $ulasanData = [];
        $comments = [
            'Sayuran dan buah-buahan sangat segar. Kunjungan edukasi berjalan lancar dan informatif. Sangat memuaskan!',
            'Kunjungan untuk konsultasi produk sangat membantu. Buah-buahan yang dipesan berkualitas baik.',
            'Pertemuan kemitraan sangat produktif. Sayurannya juga segar dan harganya kompetitif.',
            'Kunjungan lapangan untuk praktik mahasiswa sangat berkesan. Hasil panen sayurannya berkualitas tinggi.',
            'Sayur yang saya beli langsung segar dan berkualitas. Pengalaman yang baik.',
            'Puas dengan buah-buahan yang dipesan. Kualitasnya terjaga. Akan berlangganan lagi.',
            'Buah-buahan yang saya terima segar dan matang. Sangat puas.',
            'Hasil kunjungan studi banding sangat informatif. Buah-buahan yang disajikan juga lezat.',
            'Harga produk sayur dan buah sebanding dengan kualitas yang diberikan.',
            'Produk buah dan sayur selalu segar. Akan merekomendasikan kepada teman-teman.',
        ];

        foreach ($customers as $index => $customerId) {
            if ($index >= count($comments)) break;
            
            $ulasanData[] = [
                'user_id' => $customerId,
                'komentar' => $comments[$index],
                'rating' => rand(4, 5),
                'tanggal' => Carbon::now()->subDays(rand(1, 30))->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ];
        }

        if (!empty($ulasanData)) {
            DB::table('ulasan')->insert($ulasanData);
        }
    }
}
