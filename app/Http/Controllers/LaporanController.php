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
    public function index(Request $request)
    {
        // Default: Bulan ini
        $startDate = $request->input('start_date', date('Y-m-01'));
        $endDate = $request->input('end_date', date('Y-m-d'));

        // Jika request JSON (untuk update filter via Inertia/Axios)
        if ($request->wantsJson()) {
            return response()->json([
                'summary' => $this->getSummaryStats($startDate, $endDate),
                // Data preview bisa diload terpisah atau di sini tergantung performa
            ]);
        }

        return Inertia::render('Laporan/Index', [
            'initialSummary' => $this->getSummaryStats($startDate, $endDate),
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    private function getSummaryStats($startDate, $endDate)
    {
        // Hitung Total Pendapatan dari Pesanan Selesai
        $totalPendapatan = \App\Models\Pesanan::where('status', 'Selesai')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->sum('total');

        $totalTransaksi = \App\Models\Pesanan::where('status', 'Selesai')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->count();

        $totalKunjungan = \App\Models\Kunjungan::where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->count();
            
        // Produk terlaris (Top 1 by qty)
        $topProduct = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->where('pesanan.status', 'Selesai')
            ->whereBetween('pesanan.tanggal', [$startDate, $endDate])
            ->select('products.nama', DB::raw('SUM(pesanan_items.jumlah) as total_qty'))
            ->groupBy('products.nama')
            ->orderByDesc('total_qty')
            ->first();

        return [
            'total_pendapatan' => $totalPendapatan,
            'total_transaksi' => $totalTransaksi,
            'total_kunjungan' => $totalKunjungan,
            'produk_terlaris' => $topProduct ? $topProduct->nama : '-',
        ];
    }

    // Endpoint untuk mengambil detail preview laporan (Grafik & Tabel)
    public function data(Request $request, $type)
    {
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-d'));

        switch ($type) {
            case 'penjualan':
                return $this->getPreviewPenjualan($startDate, $endDate);
            case 'kunjungan':
                return $this->getPreviewKunjungan($startDate, $endDate);
            case 'produk-terlaris':
                return $this->getPreviewProdukTerlaris($startDate, $endDate);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    private function getPreviewPenjualan($startDate, $endDate)
    {
        // Data Grafik: Pendapatan per hari
        $chartData = \App\Models\Pesanan::where('status', 'Selesai')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('DATE(tanggal) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return ['label' => date('d M', strtotime($item->date)), 'value' => $item->total];
            });

        // Data Tabel: 10 Transaksi Terakhir
        $tableData = \App\Models\Pesanan::with('pelanggan')
            ->where('status', 'Selesai')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'col1' => $p->tanggal, // Tanggal
                    'col2' => $p->pelanggan->nama ?? 'Guest', // Pelanggan
                    'col3' => 'Rp ' . number_format($p->total, 0, ',', '.'), // Total
                    'col4' => $p->status, // Status
                ];
            });

        return response()->json([
            'chart' => [
                'labels' => $chartData->pluck('label'),
                'datasets' => [
                    [
                        'label' => 'Pendapatan',
                        'data' => $chartData->pluck('value'),
                        'borderColor' => '#16a34a',
                        'backgroundColor' => 'rgba(22, 163, 74, 0.1)',
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Tanggal', 'Pelanggan', 'Total', 'Status'],
                'rows' => $tableData
            ]
        ]);
    }

    private function getPreviewKunjungan($startDate, $endDate)
    {
         // Data Grafik: Kunjungan per hari
         $chartData = \App\Models\Kunjungan::where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('DATE(tanggal) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return ['label' => date('d M', strtotime($item->date)), 'value' => $item->total];
            });

        // Data Tabel: 10 Kunjungan Terakhir
        $tableData = \App\Models\Kunjungan::with('pelanggan')
            ->where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get()
            ->map(function ($k) {
                $totalVisitor = $k->jumlah_dewasa + $k->jumlah_anak + $k->jumlah_balita;
                return [
                    'col1' => $k->tanggal,
                    'col2' => $k->pelanggan->nama ?? 'Umum',
                    'col3' => $totalVisitor . ' Orang',
                    'col4' => $k->status,
                ];
            });

        return response()->json([
            'chart' => [
                'labels' => $chartData->pluck('label'),
                'datasets' => [
                    [
                        'label' => 'Jumlah Kunjungan',
                        'data' => $chartData->pluck('value'),
                        'borderColor' => '#2563eb',
                        'backgroundColor' => 'rgba(37, 99, 235, 0.1)',
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Tanggal', 'Pelanggan', 'Pengunjung', 'Status'],
                'rows' => $tableData
            ]
        ]);
    }

    private function getPreviewProdukTerlaris($startDate, $endDate)
    {
        // Data Grafik & Tabel sama untuk produk terlaris (Top 10)
        $data = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->where('pesanan.status', 'Selesai')
            ->whereBetween('pesanan.tanggal', [$startDate, $endDate])
            ->select('products.nama', DB::raw('SUM(pesanan_items.jumlah) as total_qty'))
            ->groupBy('products.nama')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        return response()->json([
            'chart' => [
                'labels' => $data->pluck('nama'),
                'datasets' => [
                    [
                        'label' => 'Terjual (Qty)',
                        'data' => $data->pluck('total_qty'),
                        'backgroundColor' => '#f59e0b',
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Nama Produk', 'Terjual'],
                'rows' => $data->map(function($d) {
                    return [
                        'col1' => $d->nama,
                        'col2' => $d->total_qty . ' Pcs',
                    ];
                })
            ]
        ]);
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

    // === Handler Export Semua Format (FILE-BASED STRATEGY + DEBUG)
    private function handleExport($format, array $data, string $filename)
    {
        // DEBUG: Log method call
        \Illuminate\Support\Facades\Log::info("EXPORT_DEBUG: handleExport called", [
            'format' => $format,
            'filename' => $filename,
            'data_count' => count($data),
        ]);

        try {
            // FIXED: Filename kebab-case + WIB Timezone
            $kebabFilename = str_replace('_', '-', $filename); 
            $safeDate = \Carbon\Carbon::now('Asia/Jakarta')->format('d-m-Y');
            $finalFilenameBase = "{$kebabFilename}-{$safeDate}";

            // Bersihkan buffer (Just in case)
            while (ob_get_level()) ob_end_clean();

            $tempDir = storage_path('app/temp_export');
            
            // Ensure temp dir exists
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // === CSV Export
            if ($format === 'csv') {
                $fileName = "{$finalFilenameBase}.csv";
                $filePath = "{$tempDir}/{$fileName}";
                
                $file = fopen($filePath, 'w');
                fputs($file, "\xEF\xBB\xBF"); // BOM
                
                if (!empty($data)) {
                    fputcsv($file, array_keys($data[0]));
                }
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);

                // VERIFY FILE BEFORE DOWNLOAD
                if (!file_exists($filePath) || filesize($filePath) < 10) {
                    \Illuminate\Support\Facades\Log::error("EXPORT_ERROR: CSV file invalid", ['path' => $filePath]);
                    return response("Export Failed: File kosong atau tidak ditemukan.", 500, ['Content-Type' => 'text/plain']);
                }

                \Illuminate\Support\Facades\Log::info("EXPORT_SUCCESS: CSV", ['path' => $filePath, 'size' => filesize($filePath)]);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                ]);
            }

            // === Excel Export
            if ($format === 'excel') {
                $fileName = "{$finalFilenameBase}.xlsx";
                $filePath = "{$tempDir}/{$fileName}";

                $writer = SimpleExcelWriter::create($filePath, 'xlsx');
                if (!empty($data)) {
                     $writer->addRows(collect($data)->toArray());
                } else {
                    $writer->addRow(['Status' => 'Data Kosong']);
                }
                $writer->close();

                // VERIFY FILE BEFORE DOWNLOAD
                if (!file_exists($filePath) || filesize($filePath) < 1000) {
                    \Illuminate\Support\Facades\Log::error("EXPORT_ERROR: Excel file invalid", ['path' => $filePath, 'exists' => file_exists($filePath), 'size' => file_exists($filePath) ? filesize($filePath) : 0]);
                    return response("Export Failed: File Excel tidak valid.", 500, ['Content-Type' => 'text/plain']);
                }

                \Illuminate\Support\Facades\Log::info("EXPORT_SUCCESS: Excel", ['path' => $filePath, 'size' => filesize($filePath)]);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]);
            }

            // === PDF Export
            if ($format === 'pdf') {
                $fileName = "{$finalFilenameBase}.pdf";
                $filePath = "{$tempDir}/{$fileName}";

                $title = str_replace('-', ' ', strtoupper($kebabFilename));
                $startDate = request('start_date');
                $endDate = request('end_date');
                $period = ($startDate && $endDate) ? "Periode: {$startDate} s/d {$endDate}" : "Semua Data";

                $safeData = empty($data) ? [] : $data;
                $safeHeaders = empty($data) ? [] : array_keys($data[0]);

                $pdfData = [
                    'title'   => $title,
                    'period'  => $period,
                    'headers' => $safeHeaders,
                    'data'    => $safeData,
                ];

                Pdf::loadView('laporan.pdf', $pdfData)
                    ->setPaper('a4', 'landscape')
                    ->save($filePath);

                // VERIFY FILE BEFORE DOWNLOAD
                if (!file_exists($filePath) || filesize($filePath) < 1000) {
                    \Illuminate\Support\Facades\Log::error("EXPORT_ERROR: PDF file invalid", ['path' => $filePath]);
                    return response("Export Failed: File PDF tidak valid.", 500, ['Content-Type' => 'text/plain']);
                }

                \Illuminate\Support\Facades\Log::info("EXPORT_SUCCESS: PDF", ['path' => $filePath, 'size' => filesize($filePath)]);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'application/pdf',
                ]);
            }

            // Format tidak dikenal
            return response("Format tidak didukung: {$format}", 400, ['Content-Type' => 'text/plain']);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("EXPORT_EXCEPTION: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response("Export Failed: " . $e->getMessage(), 500, ['Content-Type' => 'text/plain']);
        }
    }
}
