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
     */
    public function run(): void
    {
        // Menonaktifkan batasan foreign key sementara
        Schema::disableForeignKeyConstraints();

        // Mengosongkan tabel kunjungan
        DB::table('kunjungan')->truncate();

        // Mengaktifkan kembali batasan foreign key
        Schema::enableForeignKeyConstraints();

        DB::table('kunjungan')->insert([
            // Kunjungan untuk Pelanggan ID 1
            [
                'pelanggan_id' => 1,
                'tipe_id' => 1, // Outing Class
                'judul' => 'Kunjungan Edukasi Outing Class',
                'deskripsi' => 'Kunjungan siswa untuk belajar langsung ke lapangan.',
                'tanggal' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'jam' => '09:00:00',
                'jumlah_pengunjung' => 25,
                'total_biaya' => 25 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 2
            [
                'pelanggan_id' => 2,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Rutin Konsultasi',
                'deskripsi' => 'Kunjungan rutin untuk konsultasi produk baru.',
                'tanggal' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'jam' => '14:00:00',
                'jumlah_pengunjung' => 2,
                'total_biaya' => 2 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            // Kunjungan untuk Pelanggan ID 3
            [
                'pelanggan_id' => 3,
                'tipe_id' => 2, // Umum
                'judul' => 'Pertemuan Kemitraan Bisnis',
                'deskripsi' => 'Pertemuan untuk membahas potensi kemitraan bisnis.',
                'tanggal' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'jam' => '10:30:00',
                'jumlah_pengunjung' => 4,
                'total_biaya' => 4 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            // Kunjungan untuk Pelanggan ID 4
            [
                'pelanggan_id' => 4,
                'tipe_id' => 1, // Outing Class
                'judul' => 'Kunjungan Lapangan Praktik Mahasiswa',
                'deskripsi' => 'Mahasiswa melakukan praktik kerja lapangan.',
                'tanggal' => Carbon::now()->addDays(10)->format('Y-m-d'),
                'jam' => '08:00:00',
                'jumlah_pengunjung' => 15,
                'total_biaya' => 15 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 5
            [
                'pelanggan_id' => 5,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Pembelian Langsung',
                'deskripsi' => 'Kunjungan untuk membeli produk secara langsung.',
                'tanggal' => Carbon::now()->subDays(10)->format('Y-m-d'),
                'jam' => '13:00:00',
                'jumlah_pengunjung' => 1,
                'total_biaya' => 1 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            // Kunjungan untuk Pelanggan ID 6
            [
                'pelanggan_id' => 6,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Diskusi Lanjutan',
                'deskripsi' => 'Diskusi lanjutan untuk keperluan bisnis.',
                'tanggal' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'jam' => '11:00:00',
                'jumlah_pengunjung' => 3,
                'total_biaya' => 3 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            // Kunjungan untuk Pelanggan ID 7
            [
                'pelanggan_id' => 7,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Pembatalan',
                'deskripsi' => 'Pelanggan membatalkan kunjungan karena alasan pribadi.',
                'tanggal' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'jam' => '15:00:00',
                'jumlah_pengunjung' => 1,
                'total_biaya' => 0, // Dibiarkan 0 karena dibatalkan
                'status' => 'dibatalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 8
            [
                'pelanggan_id' => 8,
                'tipe_id' => 1, // Outing Class
                'judul' => 'Kunjungan Studi Banding',
                'deskripsi' => 'Studi banding oleh mahasiswa terkait proyek baru.',
                'tanggal' => Carbon::now()->subDays(8)->format('Y-m-d'),
                'jam' => '09:30:00',
                'jumlah_pengunjung' => 5,
                'total_biaya' => 5 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(8),
                'updated_at' => Carbon::now()->subDays(8),
            ],
            // Kunjungan untuk Pelanggan ID 9
            [
                'pelanggan_id' => 9,
                'tipe_id' => 1, // Outing Class
                'judul' => 'Studi Banding Sekolah',
                'deskripsi' => 'Kunjungan dari sekolah lain untuk studi banding.',
                'tanggal' => Carbon::now()->addDays(15)->format('Y-m-d'),
                'jam' => '10:00:00',
                'jumlah_pengunjung' => 30,
                'total_biaya' => 30 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 10
            [
                'pelanggan_id' => 10,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Prospek Pelanggan',
                'deskripsi' => 'Kunjungan calon pelanggan baru.',
                'tanggal' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'jam' => '16:00:00',
                'jumlah_pengunjung' => 1,
                'total_biaya' => 1 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            // Kunjungan untuk Pelanggan ID 11
            [
                'pelanggan_id' => 11,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Diskusi Bulanan',
                'deskripsi' => 'Pertemuan untuk review hasil diskusi bulanan.',
                'tanggal' => Carbon::now()->addDays(2)->format('Y-m-d'),
                'jam' => '14:30:00',
                'jumlah_pengunjung' => 6,
                'total_biaya' => 6 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 12
            [
                'pelanggan_id' => 12,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Review Proyek',
                'deskripsi' => 'Review proyek yang sedang berjalan.',
                'tanggal' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'jam' => '09:00:00',
                'jumlah_pengunjung' => 2,
                'total_biaya' => 2 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            // Kunjungan untuk Pelanggan ID 13
            [
                'pelanggan_id' => 13,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Komplain',
                'deskripsi' => 'Pelanggan datang untuk menyampaikan komplain produk.',
                'tanggal' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'jam' => '11:30:00',
                'jumlah_pengunjung' => 1,
                'total_biaya' => 1 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            // Kunjungan untuk Pelanggan ID 14
            [
                'pelanggan_id' => 14,
                'tipe_id' => 1, // Outing Class
                'judul' => 'Field Trip Siswa',
                'deskripsi' => 'Kunjungan rekreasi dan edukasi untuk siswa.',
                'tanggal' => Carbon::now()->addDays(8)->format('Y-m-d'),
                'jam' => '09:00:00',
                'jumlah_pengunjung' => 20,
                'total_biaya' => 20 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 15
            [
                'pelanggan_id' => 15,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Review Tahunan',
                'deskripsi' => 'Review kinerja dan partnership tahunan.',
                'tanggal' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'jam' => '14:00:00',
                'jumlah_pengunjung' => 2,
                'total_biaya' => 2 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            // Kunjungan untuk Pelanggan ID 16
            [
                'pelanggan_id' => 16,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Strategi Pemasaran',
                'deskripsi' => 'Kunjungan untuk menentukan strategi pemasaran baru.',
                'tanggal' => Carbon::now()->addDays(4)->format('Y-m-d'),
                'jam' => '11:00:00',
                'jumlah_pengunjung' => 3,
                'total_biaya' => 3 * 15000,
                'status' => 'dijadwalkan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Kunjungan untuk Pelanggan ID 17
            [
                'pelanggan_id' => 17,
                'tipe_id' => 2, // Umum
                'judul' => 'Kunjungan Pelanggan Baru',
                'deskripsi' => 'Kunjungan pertama kali oleh pelanggan baru.',
                'tanggal' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'jam' => '10:00:00',
                'jumlah_pengunjung' => 1,
                'total_biaya' => 1 * 15000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
        ]);
    }
}
