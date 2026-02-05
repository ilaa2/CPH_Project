<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kunjungan;
use App\Models\Pesanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
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
        // Support both legacy (Indonesian) and new (English) status values
        $completedStatuses = ['Selesai', 'completed'];
        
        // Hitung Total Pendapatan dari Pesanan Selesai
        $totalPendapatan = Pesanan::whereIn('status', $completedStatuses)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->sum('total');

        $totalTransaksi = Pesanan::whereIn('status', $completedStatuses)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->count();

        $totalKunjungan = Kunjungan::where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->count();
            
        // Produk terlaris (Top 1 by qty)
        $topProduct = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->whereIn('pesanan.status', $completedStatuses)
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
        $completedStatuses = ['Selesai', 'completed'];
        
        // Data Grafik: Pendapatan per hari
        $chartData = Pesanan::whereIn('status', $completedStatuses)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('DATE(tanggal) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return ['label' => date('d M', strtotime($item->date)), 'value' => $item->total];
            });

        // Data Tabel: 10 Transaksi Terakhir
        $tableData = Pesanan::with('user')
            ->whereIn('status', $completedStatuses)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get()
            ->map(function ($p) {
                // Normalize status to Indonesian display
                $statusMap = [
                    'pending' => 'Menunggu',
                    'processed' => 'Diproses',
                    'shipped' => 'Dikirim',
                    'completed' => 'Selesai',
                ];
                $displayStatus = $statusMap[strtolower($p->status)] ?? $p->status;
                
                return [
                    'col1' => $p->tanggal,
                    'col2' => $p->user->name ?? 'Guest',
                    'col3' => 'Rp ' . number_format($p->total, 0, ',', '.'),
                    'col4' => $displayStatus,
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
        $chartData = Kunjungan::where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('DATE(tanggal) as date, SUM(jumlah_dewasa + jumlah_anak + jumlah_balita) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return ['label' => date('d M', strtotime($item->date)), 'value' => (int) $item->total];
            });

        // Data Tabel: 10 Kunjungan Terakhir
        $tableData = Kunjungan::with(['user', 'tipe'])
            ->where('status', '!=', 'Dibatalkan')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderByDesc('tanggal')
            ->limit(10)
            ->get()
            ->map(function ($k) {
                $totalVisitor = $k->jumlah_dewasa + $k->jumlah_anak + $k->jumlah_balita;
                return [
                    'col1' => $k->tanggal,
                    'col2' => $k->tipe->nama_tipe ?? '-',
                    'col3' => $k->user->name ?? 'Umum',
                    'col4' => $totalVisitor . ' Orang',
                ];
            });

        return response()->json([
            'chart' => [
                'labels' => $chartData->pluck('label'),
                'datasets' => [
                    [
                        'label' => 'Jumlah Pengunjung',
                        'data' => $chartData->pluck('value'),
                        'borderColor' => '#2563eb',
                        'backgroundColor' => 'rgba(37, 99, 235, 0.1)',
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Tanggal', 'Tipe Kunjungan', 'Pelanggan', 'Pengunjung'],
                'rows' => $tableData
            ]
        ]);
    }

    private function getPreviewProdukTerlaris($startDate, $endDate)
    {
        $completedStatuses = ['Selesai', 'completed'];
        
        // Data Grafik & Tabel sama untuk produk terlaris (Top 10)
        $data = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->whereIn('pesanan.status', $completedStatuses)
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
        $completedStatuses = ['Selesai', 'completed'];

        $pesanan = Pesanan::with(['user', 'items.produk'])
            ->whereIn('status', $completedStatuses)
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal', [$startDate, $endDate]);
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        $data = $pesanan->map(function ($p) {
            $produkList = $p->items->map(function($item) {
                return ($item->produk->nama ?? 'Produk Terhapus') . " ({$item->jumlah})";
            })->implode(', ');

            return [
                'ID'               => $p->id,
                'Tanggal'          => $p->tanggal,
                'Nama Pelanggan'   => $p->user->name ?? 'Guest',
                'Produk (Qty)'     => $produkList,
                'Total Transaksi'  => $p->total,
                'Status'           => $p->status,
            ];
        })->toArray();

        // Get Top 5 Products for the period
        $topProducts = DB::table('pesanan_items')
            ->join('pesanan', 'pesanan_items.pesanan_id', '=', 'pesanan.id')
            ->join('products', 'pesanan_items.produk_id', '=', 'products.id')
            ->whereIn('pesanan.status', $completedStatuses)
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('pesanan.tanggal', [$startDate, $endDate]);
            })
            ->select(
                'products.nama',
                DB::raw('SUM(pesanan_items.jumlah) as total_qty'),
                DB::raw('SUM(pesanan_items.jumlah * products.harga) as total_omzet')
            )
            ->groupBy('products.nama')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'nama' => $p->nama,
                'total_qty' => $p->total_qty,
                'total_omzet' => $p->total_omzet
            ])
            ->toArray();

        return $this->handleExport($format, $data, 'laporan_penjualan', ['topProducts' => $topProducts]);
    }

    // === Laporan Kunjungan
    public function kunjungan(Request $request, $format)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $kunjungans = Kunjungan::with(['user', 'tipe'])
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
                'Tipe Kunjungan'     => $k->tipe->nama_tipe ?? '-',
                'Nama Pelanggan'     => $k->user->name ?? 'Tidak Ada',
                'Jumlah Pengunjung'  => $totalPengunjung ?: '-',
                'Total Biaya'        => $k->total_biaya ?? 0,
                'Status'             => $k->status ?? '-',
            ];
        })->toArray();

        // Get Top Visit Types for the period
        $topVisitTypes = DB::table('kunjungan')
            ->join('tipe_kunjungan', 'kunjungan.tipe_id', '=', 'tipe_kunjungan.id')
            ->where('kunjungan.status', '!=', 'Dibatalkan')
            ->when($startDate && $endDate, function ($query) use ($startDate, $endDate) {
                $query->whereBetween('kunjungan.tanggal', [$startDate, $endDate]);
            })
            ->select(
                'tipe_kunjungan.nama_tipe',
                DB::raw('COUNT(*) as total_kunjungan'),
                DB::raw('SUM(kunjungan.jumlah_dewasa + kunjungan.jumlah_anak + kunjungan.jumlah_balita) as total_pengunjung'),
                DB::raw('SUM(kunjungan.total_biaya) as total_pendapatan')
            )
            ->groupBy('tipe_kunjungan.nama_tipe')
            ->orderByDesc('total_kunjungan')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'nama_tipe' => $t->nama_tipe,
                'total_kunjungan' => $t->total_kunjungan,
                'total_pengunjung' => $t->total_pengunjung ?? 0,
                'total_pendapatan' => $t->total_pendapatan ?? 0
            ])
            ->toArray();

        return $this->handleExport($format, $data, 'laporan_kunjungan', ['topVisitTypes' => $topVisitTypes]);
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
    private function handleExport($format, array $data, string $filename, array $extraData = [])
    {
        Log::info("EXPORT_DEBUG: handleExport called", [
            'format' => $format,
            'filename' => $filename,
            'data_count' => count($data),
        ]);

        try {
            $kebabFilename = str_replace('_', '-', $filename); 
            $safeDate = Carbon::now('Asia/Jakarta')->format('d-m-Y');
            $finalFilenameBase = "{$kebabFilename}-{$safeDate}";

            // Bersihkan buffer
            while (ob_get_level()) ob_end_clean();

            $tempDir = storage_path('app/temp_export');
            
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

                if (!file_exists($filePath) || filesize($filePath) < 10) {
                    Log::error("EXPORT_ERROR: CSV file invalid", ['path' => $filePath]);
                    return response("Export Failed: File kosong atau tidak ditemukan.", 500, ['Content-Type' => 'text/plain']);
                }

                Log::info("EXPORT_SUCCESS: CSV", ['path' => $filePath, 'size' => filesize($filePath)]);

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

                if (!file_exists($filePath) || filesize($filePath) < 1000) {
                    Log::error("EXPORT_ERROR: Excel file invalid", ['path' => $filePath]);
                    return response("Export Failed: File Excel tidak valid.", 500, ['Content-Type' => 'text/plain']);
                }

                Log::info("EXPORT_SUCCESS: Excel", ['path' => $filePath, 'size' => filesize($filePath)]);

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

                $pdfData = array_merge([
                    'title'   => $title,
                    'period'  => $period,
                    'headers' => $safeHeaders,
                    'data'    => $safeData,
                ], $extraData);

                Pdf::loadView('laporan.pdf', $pdfData)
                    ->setPaper('a4', 'landscape')
                    ->save($filePath);

                if (!file_exists($filePath) || filesize($filePath) < 1000) {
                    Log::error("EXPORT_ERROR: PDF file invalid", ['path' => $filePath]);
                    return response("Export Failed: File PDF tidak valid.", 500, ['Content-Type' => 'text/plain']);
                }

                Log::info("EXPORT_SUCCESS: PDF", ['path' => $filePath, 'size' => filesize($filePath)]);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'application/pdf',
                ]);
            }

            return response("Format tidak didukung: {$format}", 400, ['Content-Type' => 'text/plain']);

        } catch (\Throwable $e) {
            Log::error("EXPORT_EXCEPTION: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response("Export Failed: " . $e->getMessage(), 500, ['Content-Type' => 'text/plain']);
        }
    }
}
