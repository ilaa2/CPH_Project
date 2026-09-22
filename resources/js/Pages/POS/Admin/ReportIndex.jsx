import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Receipt from '@/Pages/POS/Receipt';
import {
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar,
  FiFilter, FiDownload, FiPrinter, FiSearch, FiCheckCircle,
  FiClock, FiCreditCard, FiArrowUpRight, FiEye, FiX, FiPieChart,
  FiBarChart2, FiCoffee
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportIndex({
  orders,
  summary,
  topFoods,
  chartData,
  peakHoursData,
  filters
}) {
  const [activeFilter, setActiveFilter] = useState(filters.filter || 'today');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [search, setSearch] = useState(filters.search || '');
  const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || 'ALL');
  const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'ALL');

  // Modal State for viewing receipt / details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptType, setReceiptType] = useState('customer');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Currency formatter
  const formatRp = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  // Apply Quick Filter
  const applyQuickFilter = (preset) => {
    setActiveFilter(preset);
    router.get(route('admin.pos.reports.index'), {
      filter: preset,
      search,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    }, { preserveState: true, preserveScroll: true });
  };

  // Apply Custom Date or Filter Submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    router.get(route('admin.pos.reports.index'), {
      filter: activeFilter === 'custom' ? 'custom' : activeFilter,
      start_date: startDate,
      end_date: endDate,
      search,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    }, { preserveState: true, preserveScroll: true });
  };

  // Open Detail / Receipt Modal
  const handleOpenReceipt = (order, type = 'customer') => {
    setSelectedOrder(order);
    setReceiptType(type);
    setShowReceiptModal(true);
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams({
      start_date: filters.start_date,
      end_date: filters.end_date,
    });
    window.location.href = `${route('admin.pos.reports.export.csv')}?${params.toString()}`;
  };

  // Revenue Line Chart Config
  const revenueChartConfig = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        fill: true,
        label: 'Omzet Penjualan (Rp)',
        data: chartData.map(item => item.revenue),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.12)',
        tension: 0.35,
        pointBackgroundColor: '#15803d',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // Peak Hours Bar Chart Config
  const peakHoursChartConfig = {
    labels: peakHoursData.map(item => item.hour),
    datasets: [
      {
        label: 'Jumlah Transaksi',
        data: peakHoursData.map(item => item.count),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        hoverBackgroundColor: '#1d4ed8',
        borderRadius: 6,
      }
    ]
  };

  // Doughnut Chart (Cash vs QRIS)
  const paymentDoughnutConfig = {
    labels: ['CASH (Tunai)', 'QRIS (Non-Tunai)'],
    datasets: [
      {
        data: [summary.cashRevenue, summary.qrisRevenue],
        backgroundColor: ['#10b981', '#3b82f6'],
        hoverBackgroundColor: ['#059669', '#2563eb'],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  return (
    <Sidebar header={
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <FiTrendingUp className="text-green-600" /> Dashboard & Laporan Penghasilan Kantin
          </h2>
          <p className="text-xs text-gray-500">Pantau omzet penjualan kasir, rekap metode bayar, dan menu terlaris secara realtime.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <FiDownload size={14} /> Export Excel / CSV
          </button>
          <Link
            href="/order"
            className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <FiCoffee size={14} /> Ke POS Kasir
          </Link>
        </div>
      </div>
    }>
      <Head title="Laporan & Penghasilan Kantin - Central Palantea" />

      <div className="space-y-6 pb-10">

        {/* 1. FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: 'yesterday', label: 'Kemarin' },
                { id: 'last_7_days', label: '7 Hari Terakhir' },
                { id: 'this_month', label: 'Bulan Ini' },
                { id: 'last_month', label: 'Bulan Lalu' },
                { id: 'all', label: 'Semua Waktu' },
                { id: 'custom', label: 'Pilih Tanggal' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'custom') {
                      setActiveFilter('custom');
                    } else {
                      applyQuickFilter(tab.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === tab.id
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Info Range */}
            <div className="text-xs text-gray-500 font-medium">
              Periode:{' '}
              <span className="font-bold text-gray-800">
                {new Date(filters.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' — '}
                {new Date(filters.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Custom Date Form & Search */}
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
            {activeFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}

            <div className={activeFilter === 'custom' ? 'md:col-span-1' : 'md:col-span-2'}>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Cari No. Pesanan / Customer</label>
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik nama atau nomor..."
                  className="w-full pl-8 pr-2.5 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="PAID">Lunas (PAID)</option>
                <option value="UNPAID">Belum Lunas (UNPAID)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Metode Bayar</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">Semua Metode</option>
                <option value="Cash">Cash (Tunai)</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <FiFilter size={13} /> Terapkan Filter
              </button>
            </div>
          </form>
        </div>

        {/* 2. TOP METRIC CARDS (6 KPIS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* 1. Total Revenue Filtered */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-medium text-green-100">Omzet Terpilih</p>
              <h3 className="text-lg font-black mt-1">{formatRp(summary.filteredRevenue)}</h3>
              <p className="text-[10px] text-green-200 mt-2 flex items-center gap-1">
                <FiCheckCircle size={11} /> {summary.filteredTransactionCount} Transaksi Lunas
              </p>
            </div>
            <FiDollarSign className="absolute -right-2 -bottom-2 text-white/15 w-20 h-20 pointer-events-none" />
          </div>

          {/* 2. Today's Revenue */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center text-gray-500 text-xs mb-1">
              <span>Omzet Hari Ini</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><FiTrendingUp size={14} /></span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900">{formatRp(summary.todayRevenue)}</h3>
            <p className="text-[10px] text-gray-400 mt-2">Realtime hari ini</p>
          </div>

          {/* 3. This Month's Revenue */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center text-gray-500 text-xs mb-1">
              <span>Omzet Bulan Ini</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FiCalendar size={14} /></span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900">{formatRp(summary.thisMonthRevenue)}</h3>
            <p className="text-[10px] text-gray-400 mt-2">Akumulasi bulan berjalan</p>
          </div>

          {/* 4. Cash Revenue (Uang Laci) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
            <div className="flex justify-between items-center text-gray-500 text-xs mb-1">
              <span className="font-bold text-emerald-800">💵 Uang Tunai (Cash)</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px]">Laci</span>
            </div>
            <h3 className="text-base font-black text-emerald-700">{formatRp(summary.cashRevenue)}</h3>
            <p className="text-[10px] text-emerald-600 mt-2 font-medium">Cocokkan fisik di laci kasir</p>
          </div>

          {/* 5. QRIS Revenue */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex justify-between items-center text-gray-500 text-xs mb-1">
              <span className="font-bold text-blue-800">📱 QRIS (Non-Tunai)</span>
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">Bank</span>
            </div>
            <h3 className="text-base font-black text-blue-700">{formatRp(summary.qrisRevenue)}</h3>
            <p className="text-[10px] text-blue-600 mt-2 font-medium">Mutasi saldo merchant</p>
          </div>

          {/* 6. Active Unpaid */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200">
            <div className="flex justify-between items-center text-gray-500 text-xs mb-1">
              <span className="font-bold text-amber-800">⚠️ Belum Dibayar</span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px]">Active</span>
            </div>
            <h3 className="text-base font-black text-amber-700">{formatRp(summary.totalActiveUnpaid)}</h3>
            <p className="text-[10px] text-amber-600 mt-2 font-medium">Pesanan aktif belum lunas</p>
          </div>
        </div>

        {/* 3. CHARTS & BEST SELLER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart 1: Trend Pendapatan Harian (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiBarChart2 className="text-green-600" /> Tren Pendapatan Penjualan
                </h3>
                <p className="text-xs text-gray-400">Grafik omzet penjualan kantin pada periode terpilih</p>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
                Total: {formatRp(summary.filteredRevenue)}
              </span>
            </div>
            <div className="h-64">
              <Line
                data={revenueChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `Omzet: ${formatRp(ctx.parsed.y)}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`,
                        font: { size: 10 }
                      },
                      grid: { color: 'rgba(0,0,0,0.04)' }
                    },
                    x: {
                      ticks: { font: { size: 10 } },
                      grid: { display: false }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Doughnut Chart: Metode Pembayaran (1 Col) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-1">
                <FiPieChart className="text-blue-600" /> Komposisi Pembayaran
              </h3>
              <p className="text-xs text-gray-400 mb-4">Perbandingan Transaksi Cash vs QRIS</p>
            </div>
            <div className="h-48 relative flex items-center justify-center">
              {summary.filteredRevenue > 0 ? (
                <Doughnut
                  data={paymentDoughnutConfig}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.label}: ${formatRp(ctx.parsed)}`
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-xs text-gray-400">Belum ada transaksi lunas di periode ini</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-center">
              <div className="bg-emerald-50 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold block">Cash</span>
                <span className="text-xs font-black text-emerald-800">{formatRp(summary.cashRevenue)}</span>
              </div>
              <div className="bg-blue-50 p-2 rounded-xl">
                <span className="text-[10px] text-blue-700 font-bold block">QRIS</span>
                <span className="text-xs font-black text-blue-800">{formatRp(summary.qrisRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PEAK HOURS & TOP 5 BEST SELLERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Peak Hours Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiClock className="text-blue-600" /> Analisis Jam Ramai (Peak Hours)
                </h3>
                <p className="text-xs text-gray-400">Sebaran jumlah transaksi per jam (08:00 - 22:00)</p>
              </div>
            </div>
            <div className="h-56">
              <Bar
                data={peakHoursChartConfig}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.parsed.y} Transaksi Selesai`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, font: { size: 10 } },
                      grid: { color: 'rgba(0,0,0,0.04)' }
                    },
                    x: {
                      ticks: { font: { size: 9 } },
                      grid: { display: false }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top 5 Best Sellers */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  🏆 5 Menu Paling Laris (Best Seller)
                </h3>
                <p className="text-xs text-gray-400">Menu makanan & minuman dengan penjualan tertinggi</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {topFoods && topFoods.length > 0 ? (
                topFoods.map((item, index) => {
                  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  return (
                    <div
                      key={item.food_id || index}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold w-6 text-center">{medals[index] || `#${index + 1}`}</span>
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900">{item.food?.nama || 'Menu'}</h4>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Kategori: {item.food?.category?.nama || 'Umum'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-green-700 block">{item.total_qty} Porsi</span>
                        <span className="text-[10px] text-gray-500 font-bold">{formatRp(item.total_omzet)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  Belum ada data penjualan menu pada rentang filter ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. TRANSACTIONS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                <FiShoppingBag className="text-green-600" /> Rincian Riwayat Transaksi Penjualan
              </h3>
              <p className="text-xs text-gray-400">Daftar struk transaksi kasir lengkap dengan status dan metode pembayaran</p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Total {orders?.total || 0} Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">No. Pesanan / Waktu</th>
                  <th className="px-4 py-3">Meja / Pelanggan</th>
                  <th className="px-4 py-3">Rincian Menu</th>
                  <th className="px-4 py-3 text-right">Total Tagihan</th>
                  <th className="px-4 py-3 text-center">Metode Bayar</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Kasir</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders?.data && orders.data.length > 0 ? (
                  orders.data.map((order) => {
                    const isPaid = order.payment_status === 'PAID';
                    const rawMethod = order.payment?.metode_pembayaran || order.metode_pembayaran || 'Cash';
                    const isCash = rawMethod.toLowerCase() === 'cash';

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-gray-900 block">{order.nomor_pesanan}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-gray-900 block">
                            NO. {order.table?.nomor_meja || '--'}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase">{order.nama_pelanggan || 'Pelanggan'}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="space-y-0.5">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-[11px] text-gray-700 truncate">
                                <span className="font-bold">{item.jumlah}x</span> {item.food?.nama || 'Menu'}
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="text-[10px] text-gray-400 italic">
                                +{order.items.length - 2} menu lainnya
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-extrabold text-gray-900 block">{formatRp(order.total)}</span>
                          {order.diskon > 0 && (
                            <span className="text-[10px] text-red-500">Disc -{formatRp(order.diskon)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                            isCash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rawMethod.toUpperCase()}
                          </span>
                          {isPaid && isCash && order.payment?.jumlah_bayar > order.total && (
                            <span className="block text-[9px] text-gray-500 mt-0.5">
                              Kembali: {formatRp(order.payment.kembalian)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isPaid ? '✅ LUNAS' : '⚠️ UNPAID'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium text-[11px]">
                          {order.cashier?.name || 'Kasir'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenReceipt(order, 'customer')}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors title='Lihat Struk Customer'"
                            >
                              <FiPrinter size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenReceipt(order, 'kitchen')}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors title='Lihat Ticket Dapur'"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-xs text-gray-400">
                      Tidak ada data transaksi yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orders?.links && orders.links.length > 3 && (
            <div className="p-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Menampilkan {orders.from || 0} - {orders.to || 0} dari {orders.total || 0} transaksi
              </span>
              <div className="flex gap-1">
                {orders.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      link.active
                        ? 'bg-green-700 text-white'
                        : !link.url
                        ? 'text-gray-300 pointer-events-none'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL PRINT STRUK / TICKET */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-3 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-gray-800">
                  {receiptType === 'kitchen' ? '🍳 Ticket Dapur' : '🖨️ Struk Thermal Pelanggan'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-green-100 text-green-800">
                  Meja {selectedOrder.table?.nomor_meja || '--'}
                </span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable Receipt */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 custom-scrollbar">
              <Receipt order={selectedOrder} type={receiptType} paperSize="80mm" />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  if (receiptType === 'both') {
                    setReceiptType('customer');
                    setTimeout(() => {
                      window.print();
                      setTimeout(() => {
                        setReceiptType('kitchen');
                        setTimeout(() => {
                          window.print();
                          setTimeout(() => setReceiptType('both'), 500);
                        }, 400);
                      }, 600);
                    }, 200);
                  } else {
                    window.print();
                  }
                }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <FiPrinter size={14} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
