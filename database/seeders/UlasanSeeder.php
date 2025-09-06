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
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel ulasan
        DB::table('ulasan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        DB::table('ulasan')->insert([
            // Ulasan untuk Pelanggan ID 1
            [
                'pelanggan_id' => 1,
                'komentar' => 'Sayuran dan buah-buahan sangat segar. Kunjungan edukasi berjalan lancar dan informatif. Sangat memuaskan!',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(10)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            // Ulasan untuk Pelanggan ID 2
            [
                'pelanggan_id' => 2,
                'komentar' => 'Kunjungan untuk konsultasi produk sangat membantu. Buah-buahan yang dipesan berkualitas baik.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(8)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(8),
                'updated_at' => Carbon::now()->subDays(8),
            ],
            // Ulasan untuk Pelanggan ID 3
            [
                'pelanggan_id' => 3,
                'komentar' => 'Pertemuan kemitraan sangat produktif. Sayurannya juga segar dan harganya kompetitif.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(12)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(12),
                'updated_at' => Carbon::now()->subDays(12),
            ],
            // Ulasan untuk Pelanggan ID 4
            [
                'pelanggan_id' => 4,
                'komentar' => 'Kunjungan lapangan untuk praktik mahasiswa sangat berkesan. Hasil panen sayurannya berkualitas tinggi.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            // Ulasan untuk Pelanggan ID 5
            [
                'pelanggan_id' => 5,
                'komentar' => 'Sayur yang saya beli langsung segar dan berkualitas. Pengalaman yang baik.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            // Ulasan untuk Pelanggan ID 6
            [
                'pelanggan_id' => 6,
                'komentar' => 'Puas dengan buah-buahan yang dipesan. Kualitasnya terjaga. Akan berlangganan lagi.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(20)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(20),
            ],
            // Ulasan untuk Pelanggan ID 7
            [
                'pelanggan_id' => 7,
                'komentar' => 'Buah-buahan yang saya terima segar dan matang. Sangat puas.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            // Ulasan untuk Pelanggan ID 8
            [
                'pelanggan_id' => 8,
                'komentar' => 'Hasil kunjungan studi banding sangat informatif. Buah-buahan yang disajikan juga lezat.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(18)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(18),
                'updated_at' => Carbon::now()->subDays(18),
            ],
            // Ulasan untuk Pelanggan ID 9
            [
                'pelanggan_id' => 9,
                'komentar' => 'Harga produk sayur dan buah sebanding dengan kualitas yang diberikan. Kunjungan studi bandingnya sangat bagus.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(11)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(11),
                'updated_at' => Carbon::now()->subDays(11),
            ],
            // Ulasan untuk Pelanggan ID 10
            [
                'pelanggan_id' => 10,
                'komentar' => 'Produk buah dan sayur selalu segar. Akan merekomendasikan kepada teman-teman.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(14)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(14),
                'updated_at' => Carbon::now()->subDays(14),
            ],
            // Ulasan untuk Pelanggan ID 11
            [
                'pelanggan_id' => 11,
                'komentar' => 'Kunjungan untuk diskusi bulanan berjalan lancar. Stok buah dan sayur selalu lengkap.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(9)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(9),
                'updated_at' => Carbon::now()->subDays(9),
            ],
            // Ulasan untuk Pelanggan ID 12
            [
                'pelanggan_id' => 12,
                'komentar' => 'Sayuran yang dipesan sudah sesuai. Semoga kualitasnya terus dipertahankan dan ditingkatkan.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(6)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(6),
            ],
            // Ulasan untuk Pelanggan ID 13
            [
                'pelanggan_id' => 13,
                'komentar' => 'Sangat puas dengan kualitas produk sayur dan buahnya.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(4)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            // Ulasan untuk Pelanggan ID 14
            [
                'pelanggan_id' => 14,
                'komentar' => 'Anak-anak sangat senang dengan field tripnya. Kualitas sayur dan buah yang disediakan juga bagus.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(19)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(19),
                'updated_at' => Carbon::now()->subDays(19),
            ],
            // Ulasan untuk Pelanggan ID 15
            [
                'pelanggan_id' => 15,
                'komentar' => 'Produk buahnya baik. Review tahunan juga berjalan lancar.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(13)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(13),
                'updated_at' => Carbon::now()->subDays(13),
            ],
            // Ulasan untuk Pelanggan ID 16
            [
                'pelanggan_id' => 16,
                'komentar' => 'Sangat senang dengan sayuran yang dipesan. Kunjungan strategi pemasaran berjalan baik.',
                'rating' => 5,
                'tanggal' => Carbon::now()->subDays(16)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(16),
                'updated_at' => Carbon::now()->subDays(16),
            ],
            // Ulasan untuk Pelanggan ID 17
            [
                'pelanggan_id' => 17,
                'komentar' => 'Kunjungan pertama kali sangat memuaskan, buah dan sayur yang dibeli segar dan berkualitas.',
                'rating' => 4,
                'tanggal' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
        ]);
    }
}
