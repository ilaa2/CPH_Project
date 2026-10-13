<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\PosPayment;
use App\Models\PosFood;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Barryvdh\DomPDF\Facade\Pdf;

class PosReportController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'today');
        $startDateInput = $request->query('start_date');
        $endDateInput = $request->query('end_date');
        $search = $request->query('search', '');
        $paymentStatusFilter = $request->query('payment_status', 'ALL');
        $paymentMethodFilter = $request->query('payment_method', 'ALL');

        // Determine date range
        $today = Carbon::today();
        switch ($filter) {
            case 'yesterday':
                $startDate = Carbon::yesterday()->startOfDay();
                $endDate = Carbon::yesterday()->endOfDay();
                break;
            case 'week':
            case 'last_7_days':
                $startDate = Carbon::today()->subDays(6)->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'month':
            case 'this_month':
                $startDate = Carbon::today()->startOfMonth()->startOfDay();
                $endDate = Carbon::today()->endOfMonth()->endOfDay();
                break;
            case 'last_month':
                $startDate = Carbon::today()->subMonth()->startOfMonth()->startOfDay();
                $endDate = Carbon::today()->subMonth()->endOfMonth()->endOfDay();
                break;
            case 'year':
            case 'this_year':
                $startDate = Carbon::today()->startOfYear()->startOfDay();
                $endDate = Carbon::today()->endOfYear()->endOfDay();
                break;
            case 'custom':
                $startDate = $startDateInput ? Carbon::parse($startDateInput)->startOfDay() : Carbon::today()->startOfDay();
                $endDate = $endDateInput ? Carbon::parse($endDateInput)->endOfDay() : Carbon::today()->endOfDay();
                break;
            case 'all':
                $startDate = Carbon::create(2020, 1, 1)->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'today':
            default:
                $filter = 'today';
                $startDate = $startDateInput ? Carbon::parse($startDateInput)->startOfDay() : Carbon::today()->startOfDay();
                $endDate = $endDateInput ? Carbon::parse($endDateInput)->endOfDay() : Carbon::today()->endOfDay();
                break;
        }

        // Global KPI Counters (Not constrained by filter, exclude CANCELLED)
        $todayRevenue = PosOrder::where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->whereDate('created_at', Carbon::today())
            ->sum('total');

        $thisMonthRevenue = PosOrder::where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->whereMonth('created_at', Carbon::today()->month)
            ->whereYear('created_at', Carbon::today()->year)
            ->sum('total');

        $totalActiveUnpaid = PosOrder::where('payment_status', 'UNPAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->sum('total');

        // Filtered Query for Orders
        $ordersQuery = PosOrder::with(['table', 'cashier', 'items.food', 'payment'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Filter by search
        if (!empty($search)) {
            $ordersQuery->where(function ($q) use ($search) {
                $q->where('nomor_pesanan', 'like', "%{$search}%")
                  ->orWhere('nama_pelanggan', 'like', "%{$search}%");
            });
        }

        // Filter by payment status
        if ($paymentStatusFilter !== 'ALL') {
            $ordersQuery->where('payment_status', $paymentStatusFilter);
        }

        // Filter by payment method
        if ($paymentMethodFilter !== 'ALL') {
            $ordersQuery->where(function ($q) use ($paymentMethodFilter) {
                $q->where('metode_pembayaran', $paymentMethodFilter)
                  ->orWhereHas('payment', function ($p) use ($paymentMethodFilter) {
                      $p->where('metode_pembayaran', $paymentMethodFilter);
                  });
            });
        }

        // Filtered KPIs (Exclude CANCELLED)
        $filteredPaidOrders = PosOrder::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED');

        $filteredRevenue = (clone $filteredPaidOrders)->sum('total');
        $filteredTransactionCount = (clone $filteredPaidOrders)->count();
        $filteredAvgTicket = $filteredTransactionCount > 0 ? round($filteredRevenue / $filteredTransactionCount) : 0;

        // Cash vs QRIS Revenue in Filter Range (Presisi untuk Cash, QRIS, & SPLIT)
        $cashRevenue = 0;
        $qrisRevenue = 0;

        $paidOrdersList = (clone $filteredPaidOrders)->with('payment')->get();
        foreach ($paidOrdersList as $pOrder) {
            $payment = $pOrder->payment;
            $method = strtoupper($payment->metode_pembayaran ?? $pOrder->metode_pembayaran ?? 'CASH');

            if ($method === 'SPLIT') {
                $cVal = (int) ($payment->cash_amount ?? 0);
                $qVal = (int) ($payment->qris_amount ?? 0);
                $kembalian = (int) ($payment->kembalian ?? 0);
                $netCash = max(0, $cVal - $kembalian);

                if ($cVal === 0 && $qVal === 0) {
                    $half = round($pOrder->total / 2);
                    $cashRevenue += $half;
                    $qrisRevenue += ($pOrder->total - $half);
                } else {
                    $cashRevenue += $netCash;
                    $qrisRevenue += $qVal;
                }
            } elseif (str_contains($method, 'QRIS')) {
                $qrisRevenue += $pOrder->total;
            } else {
                $cashRevenue += $pOrder->total;
            }
        }

        // Top 5 Best Selling Foods in Filter Range
        $topFoods = PosOrderItem::select(
                'food_id',
                DB::raw('SUM(jumlah) as total_qty'),
                DB::raw('SUM(subtotal) as total_omzet')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'ACTIVE');
            })
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'PAID')
                  ->where('order_status', '!=', 'CANCELLED');
            })
            ->with(['food.category'])
            ->groupBy('food_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        $topProductText = $topFoods->first() ? ($topFoods->first()->food->nama ?? '-') : '-';

        // Summary payload
        $summaryData = [
            'total_pendapatan' => (int) $filteredRevenue,
            'total_transaksi' => (int) $filteredTransactionCount,
            'cash_revenue' => (int) $cashRevenue,
            'qris_revenue' => (int) $qrisRevenue,
            'produk_terlaris' => $topProductText,
            'total_active_unpaid' => (int) $totalActiveUnpaid,
            'todayRevenue' => (int) $todayRevenue,
            'thisMonthRevenue' => (int) $thisMonthRevenue,
            'filteredRevenue' => (int) $filteredRevenue,
            'filteredTransactionCount' => (int) $filteredTransactionCount,
            'filteredAvgTicket' => (int) $filteredAvgTicket,
            'cashRevenue' => (int) $cashRevenue,
            'qrisRevenue' => (int) $qrisRevenue,
        ];

        // Jika request JSON (Axios quick filter)
        if ($request->wantsJson()) {
            return response()->json([
                'summary' => $summaryData,
            ]);
        }

        // Daily Chart Data for the range
        $diffDays = $startDate->diffInDays($endDate);
        $chartData = [];

        if ($diffDays <= 31) {
            $period = Carbon::parse($startDate)->toPeriod($endDate);
            $dailyStats = PosOrder::select(
                    DB::raw('DATE(created_at) as date_str'),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(id) as count')
                )
                ->where('payment_status', 'PAID')
                ->where('order_status', '!=', 'CANCELLED')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('date_str')
                ->get()
                ->keyBy('date_str');

            foreach ($period as $dt) {
                $dStr = $dt->format('Y-m-d');
                $label = $dt->translatedFormat('d M');
                $chartData[] = [
                    'date' => $dStr,
                    'label' => $label,
                    'revenue' => (int) ($dailyStats[$dStr]->revenue ?? 0),
                    'count' => (int) ($dailyStats[$dStr]->count ?? 0),
                ];
            }
        } else {
            $monthlyStats = PosOrder::select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as ym_str"),
                    DB::raw('SUM(total) as revenue'),
                    DB::raw('COUNT(id) as count')
                )
                ->where('payment_status', 'PAID')
                ->where('order_status', '!=', 'CANCELLED')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('ym_str')
                ->orderBy('ym_str')
                ->get();

            foreach ($monthlyStats as $ms) {
                $chartData[] = [
                    'date' => $ms->ym_str,
                    'label' => Carbon::createFromFormat('Y-m', $ms->ym_str)->translatedFormat('M Y'),
                    'revenue' => (int) $ms->revenue,
                    'count' => (int) $ms->count,
                ];
            }
        }

        // Peak Hours Analysis (08:00 - 22:00)
        $hourlyStats = PosOrder::select(
                DB::raw('HOUR(created_at) as hour_num'),
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(total) as revenue')
            )
            ->where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('hour_num')
            ->get()
            ->keyBy('hour_num');

        $peakHoursData = [];
        for ($h = 8; $h <= 22; $h++) {
            $peakHoursData[] = [
                'hour' => sprintf('%02d:00', $h),
                'count' => (int) ($hourlyStats[$h]->count ?? 0),
                'revenue' => (int) ($hourlyStats[$h]->revenue ?? 0),
            ];
        }

        // Paginated Transactions List
        $orders = $ordersQuery->latest()->paginate(15)->withQueryString();

        return Inertia::render('POS/Admin/ReportIndex', [
            'orders' => $orders,
            'summary' => $summaryData,
            'topFoods' => $topFoods,
            'chartData' => $chartData,
            'peakHoursData' => $peakHoursData,
            'filters' => [
                'filter' => $filter,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'search' => $search,
                'payment_status' => $paymentStatusFilter,
                'payment_method' => $paymentMethodFilter,
            ]
        ]);
    }

    /**
     * Endpoint untuk preview data laporan (Grafik & Tabel) via Axios
     */
    public function data(Request $request, $type)
    {
        $startDate = $request->query('start_date', Carbon::today()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::today()->format('Y-m-d'));

        switch ($type) {
            case 'penjualan':
                return $this->getPreviewPenjualan($startDate, $endDate);
            case 'menu-terlaris':
            case 'produk-terlaris':
                return $this->getPreviewMenuTerlaris($startDate, $endDate);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    private function getPreviewPenjualan($startDate, $endDate)
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $dailyStats = PosOrder::select(
                DB::raw('DATE(created_at) as date_str'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as count')
            )
            ->where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date_str')
            ->get()
            ->keyBy('date_str');

        $period = Carbon::parse($start)->toPeriod($end);
        $labels = [];
        $revenues = [];
        foreach ($period as $dt) {
            $dStr = $dt->format('Y-m-d');
            $labels[] = $dt->translatedFormat('d M');
            $revenues[] = (int) ($dailyStats[$dStr]->revenue ?? 0);
        }

        $orders = PosOrder::with(['table', 'payment', 'items.food'])
            ->where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->take(50)
            ->get();

        $tableRows = $orders->map(function ($o) {
            $metode = strtoupper($o->payment->metode_pembayaran ?? $o->metode_pembayaran ?? 'Cash');
            $items = $o->items->map(fn($it) => $it->jumlah . 'x ' . ($it->food->nama ?? 'Menu'))->implode(', ');
            return [
                'col1' => $o->created_at->format('d/m/Y H:i'),
                'col2' => '#' . $o->nomor_pesanan . ' (Meja ' . ($o->table->nomor_meja ?? '--') . ')',
                'col3' => $items,
                'col4' => 'Rp ' . number_format($o->total, 0, ',', '.') . ' (' . $metode . ')',
            ];
        });

        return response()->json([
            'chart' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Omzet Penjualan (Rp)',
                        'data' => $revenues,
                        'borderColor' => '#16a34a',
                        'backgroundColor' => 'rgba(22, 163, 74, 0.1)',
                        'fill' => true,
                        'tension' => 0.4,
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Waktu', 'No. Pesanan & Meja', 'Menu Dipesan', 'Total & Metode'],
                'rows' => $tableRows,
            ]
        ]);
    }

    private function getPreviewMenuTerlaris($startDate, $endDate)
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $topFoods = PosOrderItem::select(
                'food_id',
                DB::raw('SUM(jumlah) as total_qty'),
                DB::raw('SUM(subtotal) as total_omzet')
            )
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'ACTIVE');
            })
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'PAID')
                  ->where('order_status', '!=', 'CANCELLED');
            })
            ->with(['food.category'])
            ->groupBy('food_id')
            ->orderByDesc('total_qty')
            ->take(10)
            ->get();

        $labels = $topFoods->map(fn($f) => $f->food->nama ?? 'Menu')->toArray();
        $qtys = $topFoods->map(fn($f) => (int)$f->total_qty)->toArray();

        $tableRows = $topFoods->map(function ($f, $idx) {
            return [
                'col1' => ($idx + 1) . '. ' . ($f->food->nama ?? 'Menu'),
                'col2' => $f->food->category->nama_kategori ?? 'Kantin',
                'col3' => number_format($f->total_qty, 0, ',', '.') . ' Porsi',
                'col4' => 'Rp ' . number_format($f->total_omzet, 0, ',', '.'),
            ];
        });

        return response()->json([
            'chart' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Porsi Terjual',
                        'data' => $qtys,
                        'backgroundColor' => '#8b5cf6',
                        'borderRadius' => 6,
                    ]
                ]
            ],
            'table' => [
                'headers' => ['Nama Menu Makanan/Minuman', 'Kategori', 'Porsi Terjual', 'Total Omzet'],
                'rows' => $tableRows,
            ]
        ]);
    }

    /**
     * Export Handler (PDF, Excel, CSV)
     */
    public function export(Request $request, $type, $format)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::today()->startOfMonth()->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::today()->endOfDay();

        if ($type === 'menu-terlaris') {
            $topFoods = PosOrderItem::select(
                    'food_id',
                    DB::raw('SUM(jumlah) as total_qty'),
                    DB::raw('SUM(subtotal) as total_omzet')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where(function ($q) {
                    $q->whereNull('status')->orWhere('status', 'ACTIVE');
                })
                ->whereHas('order', function ($q) {
                    $q->where('payment_status', 'PAID')
                      ->where('order_status', '!=', 'CANCELLED');
                })
                ->with(['food.category'])
                ->groupBy('food_id')
                ->orderByDesc('total_qty')
                ->get();

            $data = $topFoods->map(function ($f, $i) {
                return [
                    'Peringkat' => $i + 1,
                    'Nama Menu' => $f->food->nama ?? 'Menu',
                    'Kategori' => $f->food->category->nama_kategori ?? 'Kantin',
                    'Porsi Terjual' => (int) $f->total_qty,
                    'Total Omzet (Rp)' => (int) $f->total_omzet,
                ];
            })->toArray();

            return $this->handleExport($format, $data, 'laporan_menu_terlaris_kantin', [
                'title' => 'LAPORAN MENU TERLARIS KANTIN PALANTEA',
                'period' => "Periode: " . $startDate->format('d/m/Y') . " s/d " . $endDate->format('d/m/Y')
            ]);
        }

        // Default: Penjualan
        $orders = PosOrder::with(['table', 'cashier', 'payment', 'items.food'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'PAID')
            ->where('order_status', '!=', 'CANCELLED')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $orders->map(function ($o) {
            $itemList = $o->items->map(function ($item) {
                return $item->jumlah . 'x ' . ($item->food->nama ?? 'Menu');
            })->implode(', ');

            $metode = strtoupper($o->payment->metode_pembayaran ?? $o->metode_pembayaran ?? 'Cash');

            return [
                'No Pesanan' => $o->nomor_pesanan,
                'Waktu' => $o->created_at->format('d/m/Y H:i'),
                'No Meja' => 'Meja ' . ($o->table->nomor_meja ?? '--'),
                'Pelanggan' => $o->nama_pelanggan ?? 'Pelanggan',
                'Menu Dipesan' => $itemList,
                'Metode Bayar' => $metode,
                'Total (Rp)' => (int) $o->total,
                'Kasir' => $o->cashier->name ?? 'Kasir',
            ];
        })->toArray();

        // Top 5 foods for PDF
        $topFoods = PosOrderItem::select(
                'food_id',
                DB::raw('SUM(jumlah) as total_qty'),
                DB::raw('SUM(subtotal) as total_omzet')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'ACTIVE');
            })
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'PAID')
                  ->where('order_status', '!=', 'CANCELLED');
            })
            ->with(['food'])
            ->groupBy('food_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get()
            ->map(fn($f) => [
                'nama' => $f->food->nama ?? 'Menu',
                'total_qty' => (int) $f->total_qty,
                'total_omzet' => (int) $f->total_omzet,
            ])
            ->toArray();

        return $this->handleExport($format, $data, 'laporan_penjualan_kantin', [
            'title' => 'LAPORAN PENJUALAN KANTIN PALANTEA',
            'period' => "Periode: " . $startDate->format('d/m/Y') . " s/d " . $endDate->format('d/m/Y'),
            'topProducts' => $topFoods,
        ]);
    }

    private function handleExport($format, array $data, string $filename, array $extraData = [])
    {
        try {
            $kebabFilename = str_replace('_', '-', $filename);
            $safeDate = Carbon::now('Asia/Jakarta')->format('d-m-Y');
            $finalFilenameBase = "{$kebabFilename}-{$safeDate}";

            while (ob_get_level()) ob_end_clean();

            $tempDir = storage_path('app/temp_export');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // CSV Export
            if ($format === 'csv') {
                $fileName = "{$finalFilenameBase}.csv";
                $filePath = "{$tempDir}/{$fileName}";

                $file = fopen($filePath, 'w');
                fputs($file, "\xEF\xBB\xBF");

                if (!empty($data)) {
                    fputcsv($file, array_keys($data[0]));
                }
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                ]);
            }

            // Excel Export
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

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]);
            }

            // PDF Export
            if ($format === 'pdf') {
                $fileName = "{$finalFilenameBase}.pdf";
                $filePath = "{$tempDir}/{$fileName}";

                $title = $extraData['title'] ?? str_replace('-', ' ', strtoupper($kebabFilename));
                $period = $extraData['period'] ?? ("Tanggal Cetak: " . now()->format('d/m/Y H:i'));

                $safeData = empty($data) ? [] : $data;
                $safeHeaders = empty($data) ? [] : array_keys($data[0]);

                $pdfData = array_merge([
                    'title' => $title,
                    'period' => $period,
                    'headers' => $safeHeaders,
                    'data' => $safeData,
                ], $extraData);

                Pdf::loadView('laporan.pdf', $pdfData)
                    ->setPaper('a4', 'landscape')
                    ->save($filePath);

                return response()->download($filePath, $fileName, [
                    'Content-Type' => 'application/pdf',
                ]);
            }

            return response("Format tidak didukung: {$format}", 400, ['Content-Type' => 'text/plain']);
        } catch (\Throwable $e) {
            Log::error("EXPORT_KANTIN_ERROR: " . $e->getMessage());
            return response("Export Failed: " . $e->getMessage(), 500, ['Content-Type' => 'text/plain']);
        }
    }

    public function exportCsv(Request $request)
    {
        return $this->export($request, 'penjualan', 'csv');
    }

    /**
     * Update metode pembayaran, nominal Cash/QRIS, kembalian, dan catatan koreksi
     */
    public function updatePaymentNote(Request $request, $id)
    {
        $request->validate([
            'metode_pembayaran' => 'nullable|in:Cash,QRIS,SPLIT,UNPAID',
            'cash_amount' => 'nullable|integer|min:0',
            'qris_amount' => 'nullable|integer|min:0',
            'kembalian' => 'nullable|integer|min:0',
            'catatan_koreksi' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $order = PosOrder::with('payment')->where('id', $id)->firstOrFail();
            $payment = $order->payment;
            $orderTotal = (int) $order->total;

            $newMethod = $request->metode_pembayaran ?: ($payment ? $payment->metode_pembayaran : ($order->metode_pembayaran ?: 'Cash'));

            if ($newMethod === 'UNPAID') {
                if ($payment) {
                    $payment->delete();
                }
                $order->update([
                    'payment_status' => 'UNPAID',
                    'metode_pembayaran' => null,
                ]);
                DB::commit();
                return back()->with('success', 'Status pesanan ' . $order->nomor_pesanan . ' berhasil diubah menjadi Belum Bayar (UNPAID).');
            }

            $cashAmount = 0;
            $qrisAmount = 0;

            if ($newMethod === 'Cash') {
                $cashAmount = $request->filled('cash_amount') && (int)$request->cash_amount > 0 ? (int)$request->cash_amount : $orderTotal;
                $qrisAmount = 0;
            } elseif ($newMethod === 'QRIS') {
                $qrisAmount = $request->filled('qris_amount') && (int)$request->qris_amount > 0 ? (int)$request->qris_amount : $orderTotal;
                $cashAmount = 0;
            } elseif ($newMethod === 'SPLIT') {
                $cashAmount = (int) ($request->cash_amount ?? 0);
                $qrisAmount = (int) ($request->qris_amount ?? 0);
                if ($cashAmount + $qrisAmount < $orderTotal) {
                    $qrisAmount = max(0, $orderTotal - $cashAmount);
                }
            }

            $jumlahBayar = $cashAmount + $qrisAmount;
            $kembalian = $request->filled('kembalian') ? (int)$request->kembalian : max(0, $jumlahBayar - $orderTotal);

            if (!$payment) {
                $payment = PosPayment::create([
                    'order_id' => $order->id,
                    'cashier_id' => auth()->id() ?: $order->cashier_id,
                    'metode_pembayaran' => $newMethod,
                    'jumlah_bayar' => $jumlahBayar,
                    'cash_amount' => $cashAmount,
                    'qris_amount' => $qrisAmount,
                    'kembalian' => $kembalian,
                    'paid_at' => now(),
                    'status' => 'SUCCESS',
                    'catatan_koreksi' => $request->catatan_koreksi,
                ]);
            } else {
                $payment->metode_pembayaran = $newMethod;
                $payment->jumlah_bayar = $jumlahBayar;
                $payment->cash_amount = $cashAmount;
                $payment->qris_amount = $qrisAmount;
                $payment->kembalian = $kembalian;
                if ($request->has('catatan_koreksi')) {
                    $payment->catatan_koreksi = $request->catatan_koreksi;
                }
                $payment->save();
            }

            // Sinkronkan ke PosOrder
            $order->update([
                'metode_pembayaran' => $newMethod,
                'payment_status' => 'PAID',
            ]);

            DB::commit();

            return back()->with('success', 'Metode pembayaran pesanan ' . $order->nomor_pesanan . ' berhasil diubah menjadi ' . $newMethod . '!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui pembayaran: ' . $e->getMessage());
        }
    }
}
