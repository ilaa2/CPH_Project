import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Receipt from '@/Pages/POS/Receipt';
import CashierGuideModal from '@/Pages/POS/CashierGuideModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  FiBarChart2, FiCalendar, FiFileText, FiTrendingUp, FiUsers,
  FiShoppingBag, FiDollarSign, FiFilter, FiRefreshCw, FiCreditCard,
  FiPrinter, FiEdit2, FiSearch, FiX, FiClock, FiDownload, FiCheckCircle,
  FiCoffee, FiCheck, FiBookOpen
} from 'react-icons/fi';
import { FaChevronDown, FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportIndex({
  orders,
  summary: initialSummary,
  tables = [],
  topFoods,
  chartData,
  peakHoursData,
  filters
}) {
  // --- STATE FILTER & DATA ---
  const [dateRange, setDateRange] = useState({
    start: filters.start_date || '',
    end: filters.end_date || ''
  });
  const [activePreset, setActivePreset] = useState(
    ['today', 'week', 'month', 'year'].includes(filters.filter) ? filters.filter : (filters.filter === 'today' ? 'today' : null)
  );

  const [summary, setSummary] = useState(initialSummary || {});
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState('penjualan'); // Default open: 'penjualan'

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Table Sub-filter State
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || 'ALL');

  // --- MODAL STRUK RESI ---
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [receiptType, setReceiptType] = useState('both');
  const [bothPrintStep, setBothPrintStep] = useState(1);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // --- MODAL KOREKSI PEMBAYARAN & DETAIL TRANSAKSI ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editTableId, setEditTableId] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('Cash');
  const [editCashAmount, setEditCashAmount] = useState('');
  const [editQrisAmount, setEditQrisAmount] = useState('');
  const [editKembalian, setEditKembalian] = useState(0);
  const [editNote, setEditNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Auto-sync summary saat props diperbarui Inertia
  useEffect(() => {
    if (initialSummary && Object.keys(initialSummary).length > 0) {
      setSummary(initialSummary);
    }
  }, [initialSummary]);

  // --- MODAL PELUNASAN KASIR (UNPAID) ---
  const [showPayModal, setShowPayModal] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);
  const [payMethod, setPayMethod] = useState('QRIS');
  const [payCashAmount, setPayCashAmount] = useState('');
  const [payQrisAmount, setPayQrisAmount] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Format Rupiah Helper
  const formatRp = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  // Fetch initial preview data on mount
  useEffect(() => {
    fetchPreview(previewType || 'penjualan');
  }, []);

  // --- QUICK FILTER PRESETS ---
  const setPreset = async (type) => {
    const today = new Date();
    let start, end;

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (type) {
      case 'today':
        start = end = formatDate(new Date());
        break;
      case 'week':
        const firstDayOfWeek = new Date();
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        start = formatDate(firstDayOfWeek);
        end = formatDate(new Date());
        break;
      case 'month':
        start = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        end = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case 'year':
        start = formatDate(new Date(today.getFullYear(), 0, 1));
        end = formatDate(new Date(today.getFullYear(), 11, 31));
        break;
      default:
        return;
    }

    setActivePreset(type);
    setDateRange({ start, end });

    setLoading(true);
    try {
      // 1. Fetch updated summary stats via JSON
      const res = await axios.get('/admin/pos-reports', {
        params: { start_date: start, end_date: end, filter: type },
        headers: { 'Accept': 'application/json' }
      });
      setSummary(res.data.summary);

      // 2. Fetch updated preview data
      if (previewType) {
        const previewRes = await axios.get(`/admin/pos-reports/${previewType}/json`, {
          params: { start_date: start, end_date: end }
        });
        setPreviewData(previewRes.data);
      }

      // 3. Update URL via Inertia preserveState
      router.get('/admin/pos-reports', {
        start_date: start,
        end_date: end,
        filter: type,
        search: searchQuery,
        payment_status: paymentStatusFilter,
      }, { preserveState: true, preserveScroll: true, replace: true });
    } catch (error) {
      console.error('Quick filter error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- MANUAL FILTER APPLY ---
  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/pos-reports', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          filter: 'custom',
        },
        headers: { 'Accept': 'application/json' }
      });
      setSummary(res.data.summary);

      if (previewType) {
        await fetchPreview(previewType);
      }

      router.get('/admin/pos-reports', {
        start_date: dateRange.start,
        end_date: dateRange.end,
        filter: 'custom',
        search: searchQuery,
        payment_status: paymentStatusFilter,
      }, { preserveState: true, preserveScroll: true, replace: true });
    } catch (error) {
      console.error('Filter error:', error);
      Swal.fire('Error', 'Gagal memuat data laporan kantin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FETCH PREVIEW (Penjualan / Menu Terlaris) ---
  const fetchPreview = async (type) => {
    setPreviewLoading(true);
    setPreviewType(type);
    try {
      const res = await axios.get(`/admin/pos-reports/${type}/json`, {
        params: { start_date: dateRange.start, end_date: dateRange.end }
      });
      setPreviewData(res.data);
    } catch (error) {
      console.error('Preview fetch error:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // --- MODAL ACTIONS ---
  const handleOpenReceipt = (order, type = 'both') => {
    setSelectedReceiptOrder(order);
    setReceiptType(type);
    setBothPrintStep(1);
    setShowReceiptModal(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    const currMethod = order.payment?.metode_pembayaran || order.metode_pembayaran || (order.payment_status === 'UNPAID' ? 'QRIS' : 'Cash');
    setEditPaymentMethod(currMethod);
    setEditCashAmount((order.payment?.cash_amount ?? (currMethod === 'Cash' ? order.total : 0)).toString());
    setEditQrisAmount((order.payment?.qris_amount ?? (currMethod === 'QRIS' ? order.total : 0)).toString());
    setEditKembalian(order.payment?.kembalian || 0);
    setEditNote(order.payment?.catatan_koreksi || '');
    setEditCustomerName(order.nama_pelanggan || '');
    setEditTableId(order.table_id || (order.table ? order.table.id : ''));
    setShowEditModal(true);
  };

  const handleSavePaymentNote = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSubmittingNote(true);

    const cashVal = editPaymentMethod === 'Cash'
      ? (parseInt(editCashAmount) || editingOrder.total)
      : (editPaymentMethod === 'SPLIT' ? (parseInt(editCashAmount) || 0) : 0);

    const qrisVal = editPaymentMethod === 'QRIS'
      ? (parseInt(editQrisAmount) || editingOrder.total)
      : (editPaymentMethod === 'SPLIT' ? (parseInt(editQrisAmount) || 0) : 0);

    router.post(route('admin.pos.reports.payment.update-note', editingOrder.id), {
      metode_pembayaran: editPaymentMethod,
      cash_amount: cashVal,
      qris_amount: qrisVal,
      kembalian: parseInt(editKembalian) || 0,
      catatan_koreksi: editNote,
      nama_pelanggan: editCustomerName,
      table_id: editTableId,
    }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setIsSubmittingNote(false);
        if (page?.props?.flash?.error) {
          Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: page.props.flash.error });
          return;
        }
        setShowEditModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Perubahan Berhasil Disimpan!',
          text: `Data transaksi pesanan #${editingOrder.nomor_pesanan} telah diperbarui.`,
          timer: 1700,
          showConfirmButton: false,
        });
        if (previewType) fetchPreview(previewType);
      },
      onError: (err) => {
        setIsSubmittingNote(false);
        const msg = Object.values(err).flat().join('\n');
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: msg });
      }
    });
  };

  const handleOpenPayModal = (order) => {
    setOrderToPay(order);
    setPayMethod('QRIS');
    setPayCashAmount('0');
    setPayQrisAmount(order.total.toString());
    setShowPayModal(true);
  };

  const handleProcessReportPayment = (e) => {
    e.preventDefault();
    if (!orderToPay) return;

    let bayarInt = 0;
    let cashVal = 0;
    let qrisVal = 0;

    if (payMethod === 'SPLIT') {
      cashVal = parseInt(payCashAmount) || 0;
      qrisVal = parseInt(payQrisAmount) || 0;
      bayarInt = cashVal + qrisVal;
      if (bayarInt < orderToPay.total) {
        Swal.fire({ icon: 'warning', title: 'Nominal Kurang', text: 'Total bayar Cash + QRIS masih kurang dari total tagihan.' });
        return;
      }
    } else if (payMethod === 'Cash') {
      bayarInt = parseInt(payCashAmount) || 0;
      cashVal = bayarInt;
      if (bayarInt < orderToPay.total) {
        Swal.fire({ icon: 'warning', title: 'Nominal Kurang', text: 'Jumlah bayar tunai kurang dari total tagihan.' });
        return;
      }
    } else {
      bayarInt = parseInt(payQrisAmount) || orderToPay.total;
      qrisVal = bayarInt;
      cashVal = 0;
    }

    const kembalian = Math.max(0, bayarInt - orderToPay.total);
    setIsSubmittingPayment(true);

    router.post(route('pos.payment.process'), {
      order_id: orderToPay.id,
      metode_pembayaran: payMethod,
      jumlah_bayar: bayarInt,
      cash_amount: cashVal,
      qris_amount: qrisVal,
      kembalian: kembalian,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmittingPayment(false);
        setShowPayModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Pembayaran Lunas!',
          text: `Pesanan berhasil dilunasi dengan ${payMethod}.`,
          timer: 1600,
          showConfirmButton: false,
        });
        if (previewType) fetchPreview(previewType);
      },
      onError: (err) => {
        setIsSubmittingPayment(false);
        const msg = Object.values(err).flat().join('\n');
        Swal.fire({ icon: 'error', title: 'Gagal Memproses Pembayaran', text: msg });
      }
    });
  };

  // --- SUB-COMPONENTS: EXACT SAYUR REPORT STYLE ---
  const SummaryCard = ({ title, value, icon, color, subtext }) => (
    <div className={`bg-white p-5 rounded-xl border-l-4 ${color} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</h3>
        {subtext && <p className="text-[11px] text-gray-400 mt-0.5">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')}`}>
        {icon}
      </div>
    </div>
  );

  const ReportCard = ({ title, desc, icon, type }) => (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition relative ${previewType === type ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg text-gray-600 text-xl">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-500 leading-snug mt-1">{desc}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            fetchPreview(type);
            document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition"
        >
          <FaEye /> Lihat Laporan
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-lg flex items-center gap-2 transition"
          >
            Ekspor <FaChevronDown className="text-xs" />
          </button>

          {openDropdown === type && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <a
                href={`/admin/pos-reports/${type}/pdf?start_date=${dateRange.start}&end_date=${dateRange.end}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
              >
                <FaFilePdf className="text-red-500" /> PDF Document
              </a>
              <a
                href={`/admin/pos-reports/${type}/excel?start_date=${dateRange.start}&end_date=${dateRange.end}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
              >
                <FaFileExcel className="text-green-600" /> Excel Spreadsheet
              </a>
              <a
                href={`/admin/pos-reports/${type}/csv?start_date=${dateRange.start}&end_date=${dateRange.end}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
              >
                <FiDownload className="text-blue-600" /> CSV Data
              </a>
            </div>
          )}
        </div>
      </div>

      {openDropdown === type && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
      )}
    </div>
  );

  return (
    <Mainbar header={
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiBarChart2 className="text-green-600" /> Pusat Laporan & Analitik Kantin
          </h2>
          <p className="text-xs text-gray-500">Pantau omzet penjualan kasir, rincian pembayaran Cash vs QRIS, dan produk terlaris secara realtime.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Buka Buku Panduan Operasional Kasir"
          >
            <FiBookOpen size={14} /> Panduan Kasir
          </button>
          <Link
            href="/pos/monitor"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            📺 Monitor Pesanan
          </Link>
          <Link
            href="/order"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            <FiCoffee size={14} /> POS Kasir
          </Link>
        </div>
      </div>
    }>
      <Head title="Laporan & Penghasilan Kantin - Central Palantea" />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* 1. FILTER BAR - EXACT SAYUR REPORT STYLE */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between min-h-[48px]">
            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2">
              <span className="text-sm font-semibold text-gray-500 whitespace-nowrap mr-1">Filter:</span>
              {[
                { key: 'today', label: 'Hari Ini' },
                { key: 'week', label: 'Minggu Ini' },
                { key: 'month', label: 'Bulan Ini' },
                { key: 'year', label: 'Tahun Ini' }
              ].map(({ key, label }) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap min-w-[80px] ${
                      isActive
                        ? 'bg-green-600 text-white shadow-md ring-2 ring-green-200'
                        : 'bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700'
                    } disabled:opacity-60 disabled:cursor-wait`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Date Range + Apply Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => {
                    setActivePreset(null);
                    setDateRange({ ...dateRange, start: e.target.value });
                  }}
                  className="bg-transparent border-0 text-sm focus:ring-0 p-1 flex-1 sm:w-[130px] min-w-0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => {
                    setActivePreset(null);
                    setDateRange({ ...dateRange, end: e.target.value });
                  }}
                  className="bg-transparent border-0 text-sm focus:ring-0 p-1 flex-1 sm:w-[130px] min-w-0"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memuat</span>
                  </>
                ) : (
                  <>
                    <FiFilter className="text-sm" />
                    <span>Terapkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 2. SUMMARY STATS (GRID 5 KOLOM & REKAP KEUANGAN CASH VS QRIS) */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <SummaryCard
              title="Total Penjualan"
              value={formatRp(summary.total_penjualan || summary.total_pendapatan || summary.filteredRevenue || 0)}
              subtext="Akumulasi omzet lunas"
              icon={<FiDollarSign className="text-green-600 text-xl" />}
              color="border-green-500"
            />
            <SummaryCard
              title="Total Kas Tunai (Cash)"
              value={formatRp(summary.total_cash || summary.cash_revenue || summary.cashRevenue || 0)}
              subtext={`${summary.cash_percent || 0}% dari total penjualan`}
              icon={<FiDollarSign className="text-emerald-600 text-xl" />}
              color="border-emerald-500"
            />
            <SummaryCard
              title="Total Non-Tunai (QRIS)"
              value={formatRp(summary.total_qris || summary.qris_revenue || summary.qrisRevenue || 0)}
              subtext={`${summary.qris_percent || 0}% dari total penjualan`}
              icon={<FiCreditCard className="text-blue-600 text-xl" />}
              color="border-blue-500"
            />
            <SummaryCard
              title="Total Transaksi"
              value={`${summary.total_transaksi || summary.filteredTransactionCount || 0} Pesanan`}
              subtext="Jumlah transaksi masuk"
              icon={<FiShoppingBag className="text-orange-600 text-xl" />}
              color="border-orange-500"
            />
            <SummaryCard
              title="Menu Terlaris"
              value={summary.produk_terlaris || topFoods?.[0]?.food?.nama || '-'}
              subtext="Menu paling diminati"
              icon={<FiTrendingUp className="text-purple-600 text-xl" />}
              color="border-purple-500"
            />
          </div>

          {/* Banner Komparasi Cash vs QRIS */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg text-green-700 font-bold text-sm">
                💰 Rekapitulasi Arus Kas Kasir
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-800">Distribusi Pembayaran: </span>
                <span className="text-emerald-700 font-black">💵 Kas Tunai (Cash) {summary.cash_percent || 0}% ({formatRp(summary.total_cash || summary.cash_revenue || summary.cashRevenue || 0)})</span>
                <span className="text-gray-400 mx-1.5">•</span>
                <span className="text-blue-700 font-black">📱 Non-Tunai (QRIS) {summary.qris_percent || 0}% ({formatRp(summary.total_qris || summary.qris_revenue || summary.qrisRevenue || 0)})</span>
              </div>
            </div>
            <div className="w-full sm:w-64 bg-gray-100 h-3 rounded-full overflow-hidden flex border border-gray-200">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${summary.cash_percent || 0}%` }}
                title={`Cash: ${summary.cash_percent || 0}%`}
              ></div>
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${summary.qris_percent || 0}%` }}
                title={`QRIS: ${summary.qris_percent || 0}%`}
              ></div>
            </div>
          </div>
        </section>

        {/* 3. REPORT CATALOG (2 MAIN REPORTS) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard
            title="Laporan Penjualan & Transaksi Kantin"
            desc="Analisis tren pendapatan kasir, detail transaksi meja, dan status pembayaran."
            icon={<FiBarChart2 />}
            type="penjualan"
          />
          <ReportCard
            title="Laporan Menu & Makanan Terlaris"
            desc="Analisis penjualan menu makanan/minuman, kuantitas porsi terjual, dan kontribusi omzet."
            icon={<FiTrendingUp />}
            type="menu-terlaris"
          />
        </section>

        {/* 4. PREVIEW SECTION */}
        {previewType && (
          <section id="preview-section" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiFileText className="text-green-600" />
                Preview: {previewType === 'menu-terlaris' ? 'MENU & MAKANAN TERLARIS' : 'LAPORAN PENJUALAN KANTIN'}
              </h3>
              <button
                onClick={() => setPreviewType(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Tutup Preview
              </button>
            </div>

            <div className="p-6 space-y-8">
              {previewLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <LoadingSpinner />
                  <span className="mt-2 text-sm">Memuat visualisasi data...</span>
                </div>
              ) : previewData ? (
                <>
                  {/* CHART Section (Full Width Top) */}
                  <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-700 mb-6 text-center">
                      Visualisasi Tren & Komparasi ({previewType === 'menu-terlaris' ? 'Porsi Menu Terjual' : 'Omzet Penjualan Harian'})
                    </h4>
                    <div className="h-80 w-full">
                      {previewType === 'menu-terlaris' ? (
                        <Bar
                          data={previewData.chart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' },
                            }
                          }}
                        />
                      ) : (
                        <Line
                          data={previewData.chart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            tension: 0.4,
                            fill: true,
                            plugins: {
                              legend: { position: 'top' },
                            },
                            interaction: {
                              mode: 'index',
                              intersect: false,
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* TABLE Section (Full Width Bottom) */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="text-base font-bold text-gray-700">Detail Data (Overview)</h4>
                        <p className="text-xs text-gray-500">Menampilkan rekapan transaksi dan rincian item kantin sesuai rentang filter.</p>
                      </div>

                      {/* Search Bar for Penjualan Table */}
                      {previewType === 'penjualan' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative flex-1 sm:w-56">
                            <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
                            <input
                              type="text"
                              placeholder="Cari pesanan / meja..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyFilter();
                              }}
                              className="w-full pl-8 pr-3 py-1 bg-white border border-gray-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-sm text-left relative">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b sticky top-0 z-10">
                          <tr>
                            {previewData.table.headers.map((h, i) => (
                              <th key={i} className="px-6 py-3 font-semibold tracking-wider bg-gray-100">{h}</th>
                            ))}
                            {previewType === 'penjualan' && (
                              <th className="px-6 py-3 font-semibold tracking-wider bg-gray-100 text-center">Aksi</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders && orders.data && orders.data.length > 0 && previewType === 'penjualan' ? (
                            orders.data.map((order) => {
                              const isPaid = order.payment_status === 'PAID';
                              const isCancelled = order.order_status === 'CANCELLED';
                              const metode = order.payment?.metode_pembayaran || order.metode_pembayaran || (isPaid ? 'Cash' : 'UNPAID');

                              return (
                                <tr key={order.id} className="bg-white hover:bg-green-50 transition-colors">
                                  {/* Col 1: Waktu */}
                                  <td className="px-6 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                                    <div className="font-bold text-gray-900">
                                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <span className="text-[11px] text-gray-400">
                                      {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                  </td>

                                  {/* Col 2: No Pesanan & Meja */}
                                  <td className="px-6 py-3 text-xs">
                                    <span className="font-mono font-bold text-gray-900 block">{order.nomor_pesanan}</span>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-green-100 text-green-800 border border-green-200 mt-0.5">
                                      MEJA {order.table?.nomor_meja || '--'}
                                    </span>
                                  </td>

                                  {/* Col 3: Menu Dipesan */}
                                  <td className="px-6 py-3 text-xs text-gray-700 max-w-xs">
                                    <span className="font-bold text-gray-800 block text-xs mb-0.5">
                                      {order.nama_pelanggan || 'Pelanggan Kantin'}
                                    </span>
                                    <div className="line-clamp-2 text-[11px] text-gray-500">
                                      {order.items?.map(it => `${it.jumlah}x ${it.food?.nama || 'Menu'}`).join(', ')}
                                    </div>
                                  </td>

                                  {/* Col 4: Total & Metode */}
                                  <td className="px-6 py-3 text-xs">
                                    <div className="font-black text-sm text-green-700 block">{formatRp(order.total)}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      {/* Badge Metode Clickable to Edit */}
                                      {!isCancelled && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditModal(order)}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold border transition-all cursor-pointer ${
                                            metode === 'QRIS' ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' :
                                            metode === 'SPLIT' ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' :
                                            metode === 'UNPAID' ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' :
                                            'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                          }`}
                                          title="Klik untuk ubah metode bayar / catatan"
                                        >
                                          <span>{metode}</span>
                                          <FiEdit2 size={9} />
                                        </button>
                                      )}
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                        isCancelled ? 'bg-red-100 text-red-800' :
                                        isPaid ? 'bg-green-100 text-green-800 border border-green-200' :
                                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                      }`}>
                                        {isCancelled ? 'BATAL' : isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Col 5: Aksi */}
                                  <td className="px-6 py-3 text-xs text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {!isPaid && !isCancelled && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPayModal(order)}
                                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                                        >
                                          <FiDollarSign size={12} /> Bayar
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReceipt(order, 'both')}
                                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 transition-colors"
                                        title="Cetak Struk"
                                      >
                                        <FiPrinter size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : previewData.table.rows.length > 0 ? (
                            previewData.table.rows.map((row, i) => (
                              <tr key={i} className="bg-white hover:bg-green-50 transition-colors">
                                <td className="px-6 py-3 font-medium text-gray-900">{row.col1}</td>
                                <td className="px-6 py-3 text-gray-600">{row.col2}</td>
                                {row.col3 && <td className="px-6 py-3 text-gray-600 font-bold">{row.col3}</td>}
                                {row.col4 && (
                                  <td className="px-6 py-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                      {row.col4}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={previewType === 'penjualan' ? 5 : 4} className="px-6 py-12 text-center text-gray-400 italic">
                                Tidak ada data transaksi pada periode ini
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {previewType === 'penjualan' && (
                          <tfoot className="bg-gray-100/80 border-t-2 border-gray-300 font-bold text-xs text-gray-800">
                            <tr>
                              <td colSpan={3} className="px-6 py-3 text-right uppercase tracking-wider text-gray-600">
                                Total Rekapitulasi (Sesuai Filter):
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm font-black text-green-700">{formatRp(summary.total_penjualan || 0)}</div>
                                <div className="flex gap-2 text-[10px] mt-0.5 font-bold">
                                  <span className="text-emerald-700">Cash: {formatRp(summary.total_cash || 0)}</span>
                                  <span className="text-blue-700">QRIS: {formatRp(summary.total_qris || 0)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center text-[11px] text-gray-500 font-semibold">
                                {summary.total_orders || 0} Trx
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* Pagination for Penjualan Table */}
                    {previewType === 'penjualan' && orders && orders.links && orders.links.length > 3 && (
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          Menampilkan {orders.from || 0} - {orders.to || 0} dari {orders.total} transaksi
                        </span>
                        <div className="flex gap-1">
                          {orders.links.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.url || '#'}
                              preserveScroll
                              preserveState
                              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                                link.active
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : link.url
                                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                  : 'text-gray-300 pointer-events-none'
                              }`}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">Gagal memuat preview data.</div>
              )}
            </div>
          </section>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: UBAH METODE BAYAR & KOREKSI KASIR               */}
      {/* ======================================================== */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="p-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <FiEdit2 size={16} /> Ubah Metode Bayar & Koreksi Kasir
                </h3>
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Order #{editingOrder.nomor_pesanan} • Meja {editingOrder.table?.nomor_meja || '--'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePaymentNote} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Tagihan:</span>
                  <span className="font-black text-sm text-green-700">{formatRp(editingOrder.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Metode Saat Ini:</span>
                  <span className="font-extrabold text-gray-800 uppercase px-2 py-0.5 rounded bg-gray-200 text-[10px]">
                    {editingOrder.payment?.metode_pembayaran || editingOrder.metode_pembayaran || (editingOrder.payment_status === 'UNPAID' ? 'BELUM BAYAR (UNPAID)' : 'CASH')}
                  </span>
                </div>
              </div>

              {/* Edit Customer Name & Table */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Pelanggan:
                  </label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    placeholder="Contoh: Meja 5 / Bpk Andi"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor Meja:
                  </label>
                  <select
                    value={editTableId}
                    onChange={(e) => setEditTableId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">-- Tanpa Meja (Takeaway) --</option>
                    {tables && tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Meja #{t.nomor_meja}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Pilih Metode Pembayaran Baru:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Cash', label: '💵 Cash' },
                    { id: 'QRIS', label: '📱 QRIS' },
                    { id: 'SPLIT', label: '⚡ SPLIT' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setEditPaymentMethod(m.id);
                        if (m.id === 'QRIS') {
                          setEditQrisAmount(editingOrder.total.toString());
                          setEditCashAmount('0');
                        } else if (m.id === 'Cash') {
                          setEditCashAmount(editingOrder.total.toString());
                          setEditQrisAmount('0');
                        } else if (m.id === 'SPLIT') {
                          const half = Math.floor(editingOrder.total / 2);
                          setEditCashAmount(half.toString());
                          setEditQrisAmount((editingOrder.total - half).toString());
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        editPaymentMethod === m.id
                          ? (m.id === 'QRIS' ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300' :
                             m.id === 'SPLIT' ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300' :
                             'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300')
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {editPaymentMethod === 'Cash' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                    <span>Uang Tunai Diterima (Rp):</span>
                    <input
                      type="number"
                      min="0"
                      value={editCashAmount}
                      onChange={(e) => setEditCashAmount(e.target.value)}
                      className="w-36 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-right font-black text-gray-900 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    💡 Omzet akan otomatis dialokasikan ke kas fisik uang tunai.
                  </p>
                </div>
              )}

              {editPaymentMethod === 'QRIS' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs text-blue-900">
                  <div className="flex justify-between items-center font-bold">
                    <span>Nominal Transfer QRIS:</span>
                    <span className="font-black text-sm text-blue-800">{formatRp(parseInt(editQrisAmount) || editingOrder.total)}</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    📱 Transaksi ini akan tercatat ke mutasi non-tunai QRIS.
                  </p>
                </div>
              )}

              {editPaymentMethod === 'SPLIT' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-purple-900">
                    <span>Porsi Uang Tunai (Rp):</span>
                    <input
                      type="number"
                      min="0"
                      value={editCashAmount}
                      onChange={(e) => setEditCashAmount(e.target.value)}
                      className="w-36 px-2 py-1 bg-white border border-purple-300 rounded-lg text-right font-black text-gray-900 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center font-bold text-purple-900">
                    <span>Porsi QRIS (Rp):</span>
                    <input
                      type="number"
                      min="0"
                      value={editQrisAmount}
                      onChange={(e) => setEditQrisAmount(e.target.value)}
                      className="w-36 px-2 py-1 bg-white border border-purple-300 rounded-lg text-right font-black text-gray-900 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between pt-1 border-t border-purple-200 font-extrabold text-purple-950">
                    <span>Total Gabungan:</span>
                    <span>{formatRp((parseInt(editCashAmount) || 0) + (parseInt(editQrisAmount) || 0))}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kembalian Tunai Diberikan (Rp) (Opsional):
                </label>
                <input
                  type="number"
                  min="0"
                  value={editKembalian}
                  onChange={(e) => setEditKembalian(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan Koreksi Kasir (Penjelasan):
                </label>
                <textarea
                  rows="2"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Contoh: Salah tekan Cash, pelanggan sebenarnya bayar via QRIS."
                  className="w-full px-3 py-2 border rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmittingNote ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PELUNASAN PEMBAYARAN KASIR (UNPAID)             */}
      {/* ======================================================== */}
      {showPayModal && orderToPay && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <FiDollarSign size={16} /> Pelunasan Pembayaran Kasir
                </h3>
                <p className="text-[11px] text-green-100 mt-0.5">
                  Order #{orderToPay.nomor_pesanan} • Meja {orderToPay.table?.nomor_meja || '--'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessReportPayment} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <span className="text-xs text-gray-500 font-bold block uppercase">Total Tagihan Yang Harus Dibayar</span>
                <span className="text-2xl font-black text-green-700">{formatRp(orderToPay.total)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['QRIS', 'Cash', 'SPLIT'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPayMethod(m);
                        if (m === 'QRIS' && orderToPay) {
                          setPayQrisAmount(orderToPay.total.toString());
                          setPayCashAmount('0');
                        } else if (m === 'Cash' && orderToPay) {
                          setPayCashAmount(orderToPay.total.toString());
                          setPayQrisAmount('0');
                        } else if (m === 'SPLIT' && orderToPay) {
                          const half = Math.floor(orderToPay.total / 2);
                          setPayCashAmount(half.toString());
                          setPayQrisAmount((orderToPay.total - half).toString());
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        payMethod === m
                          ? (m === 'QRIS' ? 'bg-blue-600 text-white shadow-xs' : m === 'SPLIT' ? 'bg-purple-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs')
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m === 'QRIS' ? '📱 QRIS' : m === 'Cash' ? '💵 Cash' : '⚡ SPLIT'}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'Cash' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Uang Tunai Diterima (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={payCashAmount}
                    onChange={(e) => setPayCashAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-base font-black text-gray-900 focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    required
                  />
                  {parseInt(payCashAmount) > orderToPay.total && (
                    <p className="text-xs font-bold text-green-700 mt-1">
                      Kembalian Tunai: {formatRp(parseInt(payCashAmount) - orderToPay.total)}
                    </p>
                  )}
                </div>
              )}

              {payMethod === 'QRIS' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span>📱 Scan QRIS / Transfer:</span>
                    <span className="font-black text-sm text-blue-800">{formatRp(parseInt(payQrisAmount) || orderToPay.total)}</span>
                  </div>
                  <p className="text-[11px] text-blue-700">Pastikan customer telah mentransfer sesuai total tagihan di atas.</p>
                </div>
              )}

              {payMethod === 'SPLIT' && (
                <div className="space-y-3 p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">Porsi Uang Tunai (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={payCashAmount}
                      onChange={(e) => setPayCashAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">Porsi QRIS / Transfer (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={payQrisAmount}
                      onChange={(e) => setPayQrisAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-purple-200 text-xs font-black text-purple-900">
                    <span>Total Gabungan:</span>
                    <span>{formatRp((parseInt(payCashAmount) || 0) + (parseInt(payQrisAmount) || 0))}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Memproses...' : '✅ Lunaskan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CETAK STRUK RESI RESMI (CUSTOMER & DAPUR)       */}
      {/* ======================================================== */}
      {showReceiptModal && selectedReceiptOrder && (() => {
        const activeTypeToRender = receiptType === 'both'
          ? (bothPrintStep === 1 ? 'customer' : 'kitchen')
          : receiptType;

        const handlePrintStep = () => {
          if (receiptType === 'both') {
            if (bothPrintStep === 1) {
              window.print();
              setBothPrintStep(2);
            } else if (bothPrintStep === 2) {
              window.print();
              setBothPrintStep(3);
            }
          } else {
            window.print();
          }
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-gray-800 text-xs">Cetak Struk Transaksi Kantin</h3>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => {
                        setReceiptType('both');
                        setBothPrintStep(1);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all ${
                        receiptType === 'both' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ✂️ 2 Lembar
                    </button>
                    <button
                      onClick={() => setReceiptType('customer')}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'customer' ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🖨️ Customer
                    </button>
                    <button
                      onClick={() => setReceiptType('kitchen')}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        receiptType === 'kitchen' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🍳 Dapur
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {receiptType === 'both' && (
                <div className="px-3 py-1.5 text-xs font-bold flex justify-between items-center bg-gray-100 border-b border-gray-200">
                  <span className="text-gray-800">
                    {bothPrintStep === 1 && '📄 Lembar 1: Struk Pembayaran Customer'}
                    {bothPrintStep === 2 && '🍳 Lembar 2: Ticket Pesanan Dapur'}
                    {bothPrintStep === 3 && '✅ Kedua lembar resi telah dicetak!'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    bothPrintStep === 1 ? 'bg-green-100 text-green-800' :
                    bothPrintStep === 2 ? 'bg-blue-100 text-blue-800 animate-pulse' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {bothPrintStep === 1 && 'Klik 1 dari 2'}
                    {bothPrintStep === 2 && 'Klik 2 dari 2'}
                    {bothPrintStep === 3 && 'Selesai'}
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 bg-gray-100 custom-scrollbar">
                <Receipt order={selectedReceiptOrder} type={activeTypeToRender} paperSize="80mm" />
              </div>

              <div className="p-3 bg-white border-t space-y-1.5 shrink-0">
                {receiptType === 'both' ? (
                  <>
                    {bothPrintStep === 1 && (
                      <button
                        type="button"
                        onClick={handlePrintStep}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FiPrinter size={16} /> [Klik 1] Print Struk Customer
                      </button>
                    )}

                    {bothPrintStep === 2 && (
                      <button
                        type="button"
                        onClick={handlePrintStep}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm animate-pulse"
                      >
                        <FiPrinter size={16} /> [Klik 2] Lanjut Print Ticket Dapur
                      </button>
                    )}

                    {bothPrintStep === 3 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBothPrintStep(1)}
                          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
                        >
                          🔄 Cetak Ulang Lembar 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReceiptModal(false)}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs"
                        >
                          ✅ Selesai & Tutup
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrintStep}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FiPrinter size={16} /> Print Resi Ini
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL BUKU PANDUAN KASIR */}
      <CashierGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </Mainbar>
  );
}
