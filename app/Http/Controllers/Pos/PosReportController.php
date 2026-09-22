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
            case 'last_7_days':
                $startDate = Carbon::today()->subDays(6)->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'this_month':
                $startDate = Carbon::today()->startOfMonth()->startOfDay();
                $endDate = Carbon::today()->endOfMonth()->endOfDay();
                break;
            case 'last_month':
                $startDate = Carbon::today()->subMonth()->startOfMonth()->startOfDay();
                $endDate = Carbon::today()->subMonth()->endOfMonth()->endOfDay();
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
                $startDate = Carbon::today()->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;
        }

        // Global KPI Counters (Not constrained by filter)
        $todayRevenue = PosOrder::where('payment_status', 'PAID')
            ->whereDate('created_at', Carbon::today())
            ->sum('total');

        $thisMonthRevenue = PosOrder::where('payment_status', 'PAID')
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

        // Filtered KPIs
        $filteredPaidOrders = PosOrder::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'PAID');

        $filteredRevenue = (clone $filteredPaidOrders)->sum('total');
        $filteredTransactionCount = (clone $filteredPaidOrders)->count();
        $filteredAvgTicket = $filteredTransactionCount > 0 ? round($filteredRevenue / $filteredTransactionCount) : 0;

        // Cash vs QRIS Revenue in Filter Range
        $cashRevenue = PosPayment::whereBetween('pos_payments.created_at', [$startDate, $endDate])
            ->where('pos_payments.status', 'SUCCESS')
            ->whereRaw('LOWER(pos_payments.metode_pembayaran) LIKE ?', ['%cash%'])
            ->join('pos_orders', 'pos_payments.order_id', '=', 'pos_orders.id')
            ->sum('pos_orders.total');

        $qrisRevenue = PosPayment::whereBetween('pos_payments.created_at', [$startDate, $endDate])
            ->where('pos_payments.status', 'SUCCESS')
            ->whereRaw('LOWER(pos_payments.metode_pembayaran) LIKE ?', ['%qris%'])
            ->join('pos_orders', 'pos_payments.order_id', '=', 'pos_orders.id')
            ->sum('pos_orders.total');

        // Top 5 Best Selling Foods in Filter Range
        $topFoods = PosOrderItem::select(
                'food_id',
                DB::raw('SUM(jumlah) as total_qty'),
                DB::raw('SUM(subtotal) as total_omzet')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'PAID');
            })
            ->with(['food.category'])
            ->groupBy('food_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // Daily Chart Data for the range
        // If range is within 31 days, group by Day. If longer, group by month/day.
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
            'summary' => [
                'todayRevenue' => (int) $todayRevenue,
                'thisMonthRevenue' => (int) $thisMonthRevenue,
                'totalActiveUnpaid' => (int) $totalActiveUnpaid,
                'filteredRevenue' => (int) $filteredRevenue,
                'filteredTransactionCount' => (int) $filteredTransactionCount,
                'filteredAvgTicket' => (int) $filteredAvgTicket,
                'cashRevenue' => (int) $cashRevenue,
                'qrisRevenue' => (int) $qrisRevenue,
            ],
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

    public function exportCsv(Request $request)
    {
        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date'))->startOfDay() : Carbon::today()->startOfDay();
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date'))->endOfDay() : Carbon::today()->endOfDay();

        $orders = PosOrder::with(['table', 'cashier', 'payment', 'items.food'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get();

        $csvFileName = 'laporan-kantin-cph-' . $startDate->format('Ymd') . '-' . $endDate->format('Ymd') . '.csv';

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel compatibility
            fputs($file, "\xEF\xBB\xBF");

            // Header row
            fputcsv($file, [
                'Nomor Pesanan',
                'Waktu Transaksi',
                'Nomor Meja',
                'Nama Pelanggan',
                'Item Pesanan',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Total (Rp)',
                'Metode Bayar',
                'Status Bayar',
                'Kasir',
            ]);

            foreach ($orders as $order) {
                $itemList = $order->items->map(function ($item) {
                    return $item->jumlah . 'x ' . ($item->food->nama ?? 'Menu');
                })->implode('; ');

                $metode = $order->payment->metode_pembayaran ?? $order->metode_pembayaran ?? 'Cash';

                fputcsv($file, [
                    $order->nomor_pesanan,
                    $order->created_at->format('d/m/Y H:i'),
                    'No. ' . ($order->table->nomor_meja ?? '--'),
                    $order->nama_pelanggan ?? 'Pelanggan',
                    $itemList,
                    $order->subtotal,
                    $order->diskon,
                    $order->total,
                    strtoupper($metode),
                    $order->payment_status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS',
                    $order->cashier->name ?? 'Kasir',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
