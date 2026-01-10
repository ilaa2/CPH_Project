<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    public function index()
    {
        return Inertia::render('Laporan/Index');
    }

    // === Laporan Penjualan
    public function penjualan(Request $request, $format)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $pesanan = \App\Models\Pesanan::with(['pelanggan', 'items.produk'])
            ->where('status', '!=', 'Dibatalkan')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal', [$startDate, $endDate]);
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        $data = $pesanan->map(function ($p) {
            // Gabungkan produk dalam format: Produk A (jumlah), Produk B (jumlah)
            $produkList = $p->items->map(function($item) {
                return ($item->produk->nama ?? 'Produk Terhapus') . " ({$item->jumlah})";
            })->implode(', ');

            return [
                'ID'               => $p->id,
                'Tanggal'          => $p->tanggal,
                'Nama Pelanggan'   => $p->pelanggan->nama ?? 'Guest',
                'Alamat'           => $p->pelanggan->alamat ?? '-',
                'Telepon'          => "'" . ($p->pelanggan->telepon ?? '-') . "'", // Bungkus dengan kutip agar dianggap string murni
                'Produk (Qty)'     => $produkList,
                'Total Transaksi'  => $p->total,
                'Status'           => $p->status,
            ];
        })->toArray();

        return $this->handleExport($format, $data, 'laporan_penjualan');
    }

    // === Laporan Kunjungan
    public function kunjungan(Request $request, $format)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $kunjungans = Kunjungan::with('pelanggan')
            ->where('status', '!=', 'Dibatalkan')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal', [$startDate, $endDate]);
            })
            ->get();

        $data = $kunjungans->map(function ($k) {
            $totalPengunjung = ($k->jumlah_dewasa ?? 0) + ($k->jumlah_anak ?? 0) + ($k->jumlah_balita ?? 0);
            
            return [
                'ID Kunjungan'       => $k->id,
                'Tanggal'            => $k->tanggal,
                'Jam'                => $k->jam,
                'Nama Pelanggan'     => $k->pelanggan->nama ?? 'Tidak Ada',
                'Alamat'             => $k->pelanggan->alamat ?? '-',
                'Telepon'            => $k->pelanggan->telepon ?? '-',
                'Status'             => $k->status ?? '-',
                'Jumlah Pengunjung'  => $totalPengunjung ?: '-', // Tampilkan angka jika > 0, jika 0 tampilkan "-"
                'Total Biaya'        => $k->total_biaya ?? 0,
            ];
        })->toArray();

        return $this->handleExport($format, $data, 'laporan_kunjungan');
    }

    // === Laporan Produk Terlaris
    public function produkTerlaris(Request $request, $format)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $produkTerlaris = DB::table('pesanan_items')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->where('pesanan.status', '!=', 'Dibatalkan')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('pesanan.tanggal', [$startDate, $endDate]);
            })
            ->select(
        'products.id as id_produk',
        'products.nama',
        'products.harga',
        'products.stok',
        DB::raw('SUM(pesanan_items.jumlah) as total_terjual'),
        DB::raw('SUM(pesanan_items.jumlah * products.harga) as total_pendapatan')
    )
    ->groupBy('products.id', 'products.nama', 'products.harga', 'products.stok')
    ->orderByDesc('total_terjual')
    ->limit(10)
    ->get();

$data = $produkTerlaris->map(function ($item) {
    return [
        'ID Produk'        => $item->id_produk,
        'Nama Produk'      => $item->nama,
        'Harga Satuan'     => $item->harga,
        'Stok Tersedia'    => $item->stok,
        'Jumlah Terjual'   => $item->total_terjual,
        'Total Pendapatan' => $item->total_pendapatan,
    ];
})->toArray();


        return $this->handleExport($format, $data, 'laporan_produk_terlaris');
    }

    // === Handler Export Semua Format
    private function handleExport($format, array $data, string $filename)
    {
        if (count($data) === 0) {
            // Hindari redirect sesuai permintaan user untuk mencegah ERR_INVALID_RESPONSE
            return response('Data tidak tersedia untuk diekspor.', 404);
        }

        // Matikan output buffering untuk mencegah whitespace/echo merusak file binary
        if (ob_get_level()) ob_end_clean();

        // Nama file dasar dengan tanggal
        $fullFilename = "{$filename}_" . date('Ymd');

        // === Export Excel & CSV
        if (in_array($format, ['csv', 'excel'])) {
            $ext = $format === 'csv' ? 'csv' : 'xlsx';
            // Gunakan pola streamDownload('nama_file')->addRows($data) sesuai permintaan
            return SimpleExcelWriter::streamDownload("{$fullFilename}.{$ext}")
                ->addRows(collect($data)->toArray());
        }

        // === Export PDF
        if ($format === 'pdf') {
            $title = str_replace('_', ' ', strtoupper($filename));
            $startDate = request('start_date');
            $endDate = request('end_date');
            $period = ($startDate && $endDate) ? "Periode: {$startDate} s/d {$endDate}" : "Semua Data";

            $pdfData = [
                'title'   => $title,
                'period'  => $period,
                'headers' => array_keys($data[0]),
                'data'    => $data,
            ];

            // Gunakan Pdf::loadView() dan ->download() sesuai permintaan
            return Pdf::loadView('laporan.pdf', $pdfData)
                ->setPaper('a4', 'landscape')
                ->download("{$fullFilename}.pdf");
        }
    }
}
