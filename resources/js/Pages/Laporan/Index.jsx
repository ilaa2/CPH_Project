import { Head, router } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { FiBarChart2, FiCalendar, FiFileText, FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';
import LoadingSpinner from '@/Components/LoadingSpinner';
import axios from 'axios';
import Swal from 'sweetalert2';
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
  Legend
);

export default function LaporanIndex({ initialSummary, filters }) {
  // State Filter
  const [dateRange, setDateRange] = useState({
    start: filters.start_date || '',
    end: filters.end_date || ''
  });

  // State Data
  const [summary, setSummary] = useState(initialSummary || {});
  const [previewData, setPreviewData] = useState(null); // { chart: {}, table: { headers: [], rows: [] } }
  const [previewType, setPreviewType] = useState(null); // 'penjualan', 'kunjungan', 'produk-terlaris'

  // State UI
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- HANDLERS ---

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      // 1. Update Summary
      const res = await axios.get('/admin/laporan', {
        params: { start_date: dateRange.start, end_date: dateRange.end },
        headers: { 'Accept': 'application/json' }
      });
      setSummary(res.data.summary);

      // 2. Jika preview sedang terbuka, refresh juga
      if (previewType) {
        await fetchPreview(previewType);
      }

      router.replace('/admin/laporan', {
        start_date: dateRange.start,
        end_date: dateRange.end
      }, { preserveState: true, preserveScroll: true, replace: true });

    } catch (error) {
      console.error("Filter error:", error);
      Swal.fire('Error', 'Gagal memuat data laporan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async (type) => {
    setPreviewLoading(true);
    setPreviewType(type);
    try {
      const res = await axios.get(`/admin/laporan/${type}/json`, {
        params: { start_date: dateRange.start, end_date: dateRange.end }
      });
      setPreviewData(res.data);
      // Scroll to preview section
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Preview fetch error:', error);
      Swal.fire('Oops', 'Gagal memuat preview data.', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const [activePreset, setActivePreset] = useState(null);

  const setPreset = async (type) => {
    const today = new Date();
    let start, end;

    const formatDate = (date) => date.toISOString().split('T')[0];

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
      default: return;
    }

    setActivePreset(type);
    setDateRange({ start, end });

    // Auto-apply filter immediately
    setLoading(true);
    try {
      const res = await axios.get('/admin/laporan', {
        params: { start_date: start, end_date: end },
        headers: { 'Accept': 'application/json' }
      });
      setSummary(res.data.summary);

      // Refresh preview if open
      if (previewType) {
        const previewRes = await axios.get(`/admin/laporan/${previewType}/json`, {
          params: { start_date: start, end_date: end }
        });
        setPreviewData(previewRes.data);
      }
    } catch (error) {
      console.error("Quick filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const SummaryCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-5 rounded-xl border-l-4 ${color} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</h3>
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
          onClick={() => fetchPreview(type)}
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
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <a
                href={`/admin/laporan/${type}/pdf?start_date=${dateRange.start}&end_date=${dateRange.end}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
              >
                <FaFilePdf className="text-red-500" /> PDF Document
              </a>
              <a
                href={`/admin/laporan/${type}/excel?start_date=${dateRange.start}&end_date=${dateRange.end}`}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
              >
                <FaFileExcel className="text-green-600" /> Excel Spreadsheet
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Overlay click to close dropdown */}
      {openDropdown === type && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
      )}
    </div>
  );

  return (
    <Mainbar header={<h2 className="text-xl font-bold text-gray-800">Pusat Laporan & Analitik</h2>}>
      <Head title="Laporan & Analitik" />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* 1. FILTER BAR - Fixed Layout */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between min-h-[48px]">
            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap min-w-[80px] ${isActive
                      ? 'bg-green-600 text-white shadow-md ring-2 ring-green-200'
                      : 'bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700'
                      } disabled:opacity-60 disabled:cursor-wait`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Date Range + Apply Button */}
            <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => {
                  setActivePreset(null);
                  setDateRange({ ...dateRange, start: e.target.value });
                }}
                className="bg-transparent border-0 text-sm focus:ring-0 p-1 w-[130px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => {
                  setActivePreset(null);
                  setDateRange({ ...dateRange, end: e.target.value });
                }}
                className="bg-transparent border-0 text-sm focus:ring-0 p-1 w-[130px]"
              />
              <button
                onClick={handleApplyFilter}
                disabled={loading}
                className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-70"
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

        {/* 2. SUMMARY STATS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Pendapatan"
            value={`Rp ${new Intl.NumberFormat('id-ID').format(summary.total_pendapatan || 0)}`}
            icon={<FiDollarSign className="text-green-600 text-xl" />}
            color="border-green-500"
          />
          <SummaryCard
            title="Total Transaksi"
            value={summary.total_transaksi || 0}
            icon={<FiShoppingBag className="text-blue-600 text-xl" />}
            color="border-blue-500"
          />
          <SummaryCard
            title="Total Kunjungan"
            value={`${summary.total_kunjungan || 0} Orang`}
            icon={<FiUsers className="text-orange-600 text-xl" />}
            color="border-orange-500"
          />
          <SummaryCard
            title="Produk Terlaris"
            value={summary.produk_terlaris || '-'}
            icon={<FiTrendingUp className="text-purple-600 text-xl" />}
            color="border-purple-500"
          />
        </section>

        {/* 3. REPORT CATALOG - 2 Main Reports */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard
            title="Laporan Penjualan"
            desc="Analisis tren penjualan, detail transaksi, dan produk terlaris."
            icon={<FiBarChart2 />}
            type="penjualan"
          />
          <ReportCard
            title="Laporan Kunjungan"
            desc="Rekapitulasi pengunjung, reservasi, dan tipe kunjungan."
            icon={<FiCalendar />}
            type="kunjungan"
          />
        </section>

        {/* 4. PREVIEW SECTION */}
        {previewType && (
          <section id="preview-section" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiFileText className="text-green-600" />
                Preview: {previewType.replace('-', ' ').toUpperCase()}
              </h3>
              <button
                onClick={() => setPreviewType(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Tutup Preview
              </button>
            </div>

            <div className="p-6">
              {previewLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <LoadingSpinner />
                  <span className="mt-2 text-sm">Memuat visualisasi data...</span>
                </div>
              ) : previewData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* CHART */}
                  <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">Visualisasi Tren & Komparasi</h4>
                    <div className="h-72 w-full">
                      {previewType === 'produk-terlaris' ? (
                        <Bar
                          data={previewData.chart}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      ) : (
                        <Line
                          data={previewData.chart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            tension: 0.4,
                            fill: true
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="lg:col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-600">Overview Table (Top 10)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                          <tr>
                            {previewData.table.headers.map((h, i) => (
                              <th key={i} className="px-4 py-2 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.table.rows.length > 0 ? (
                            previewData.table.rows.map((row, i) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-[100px]">{row.col1}</td>
                                <td className="px-4 py-2 text-gray-600 truncate max-w-[100px]">{row.col2}</td>
                                {row.col3 && <td className="px-4 py-2 text-gray-600">{row.col3}</td>}
                                {row.col4 && (
                                  <td className="px-4 py-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                      {row.col4}
                                    </span>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                Tidak ada data pada periode ini
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">Gagal memuat data preview.</div>
              )}
            </div>
          </section>
        )}
      </div>
    </Mainbar>
  );
}
