<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
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
    public function penjualan($format)
    {
        $pesanan = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('pelanggans', 'pesanan.id_pelanggan', '=', 'pelanggans.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->select(
                'pesanan.id as id_pesanan',
                'pesanan.tanggal',
                'pelanggans.nama as pelanggan',
                'pelanggans.alamat',
                'pelanggans.telepon',
                'products.nama as produk',
                'pesanan_items.jumlah',
                'pesanan_items.subtotal',
                'pesanan.total as total_transaksi',
                'pesanan.status'
            )
            ->orderBy('pesanan.tanggal', 'desc')
            ->get();

        $data = $pesanan->map(function ($p) {
            return [
                'ID Pesanan'       => $p->id_pesanan,
                'Tanggal'          => $p->tanggal,
                'Nama Pelanggan'   => $p->pelanggan,
                'Alamat'           => $p->alamat,
                'Telepon'          => $p->telepon,
                'Produk'           => $p->produk,
                'Jumlah'           => $p->jumlah,
                'Subtotal'         => $p->subtotal,
                'Total Transaksi'  => $p->total_transaksi,
                'Status Pesanan'   => $p->status,
            ];
        })->toArray();

        return $this->handleExport($format, $data, 'laporan_penjualan');
    }

    // === Laporan Kunjungan
    public function kunjungan($format)
    {
        $kunjungans = Kunjungan::with('pelanggan')->get();

        $data = $kunjungans->map(function ($k) {
            return [
                'ID Kunjungan'       => $k->id,
                'Tanggal'            => $k->tanggal,
                'Jam'                => $k->jam,
                'Nama Pelanggan'     => $k->pelanggan->nama ?? 'Tidak Ada',
                'Alamat'             => $k->pelanggan->alamat ?? '-',
                'Telepon'            => $k->pelanggan->telepon ?? '-',
                'Judul'              => $k->judul ?? '-',
                'Deskripsi'          => $k->deskripsi ?? '-',
                'Status'             => $k->status ?? '-',
                'Jumlah Pengunjung'  => $k->jumlah_pengunjung ?? '-',
                'Total Biaya'        => $k->total_biaya ?? '-',
            ];
        })->toArray();

        return $this->handleExport($format, $data, 'laporan_kunjungan');
    }

    // === Laporan Produk Terlaris
    public function produkTerlaris($format)
    {
        $produkTerlaris = DB::table('pesanan_items')
    ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
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
            return redirect()->back()->with('error', 'Data tidak tersedia untuk diekspor.');
        }

        // === Export Excel & CSV
        if (in_array($format, ['csv', 'excel'])) {
            $ext = $format === 'csv' ? 'csv' : 'xlsx';
            $filepath = storage_path("app/public/{$filename}.{$ext}");

            SimpleExcelWriter::create($filepath)->addRows($data);
            return response()->download($filepath)->deleteFileAfterSend(true);
        }

        // === Export PDF
        if ($format === 'pdf') {
    $html = "<style>
                body { font-family: sans-serif; }
                table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                th, td { border: 1px solid #444; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f0f0f0; }
            </style>";
    $html .= "<h2>Laporan</h2><table><thead><tr>";

    foreach (array_keys($data[0]) as $header) {
        $html .= "<th>{$header}</th>";
    }
    $html .= "</tr></thead><tbody>";

    foreach ($data as $row) {
        $html .= "<tr>";
        foreach ($row as $col) {
            $html .= "<td>{$col}</td>";
        }
        $html .= "</tr>";
    }

    $html .= "</tbody></table>";

    // Gunakan dompdf untuk render HTML ke PDF
    $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');


    return $pdf->download("{$filename}.pdf");
}
    }
}
