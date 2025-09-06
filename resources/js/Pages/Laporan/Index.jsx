import { Head } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { FiBarChart2, FiCalendar, FiFileText } from 'react-icons/fi';
import { useState } from 'react';
import { FaChevronDown, FaFilePdf, FaFileExcel } from 'react-icons/fa';

export default function LaporanIndex() {
  const laporanCards = [
    {
      icon: <FiFileText className="text-green-600 text-2xl" />,
      title: 'Laporan Penjualan',
      desc: 'Rekap jumlah transaksi dan total pendapatan selama periode tertentu.',
      downloadPrefix: '/laporan/penjualan',
    },
    {
      icon: <FiCalendar className="text-green-600 text-2xl" />,
      title: 'Laporan Kunjungan',
      desc: 'Data kunjungan pelanggan yang telah tercatat dalam jadwal kunjungan.',
      downloadPrefix: '/laporan/kunjungan',
    },
    {
      icon: <FiBarChart2 className="text-green-600 text-2xl" />,
      title: 'Laporan Produk Terlaris',
      desc: 'Daftar produk dengan jumlah penjualan terbanyak.',
      downloadPrefix: '/laporan/produk-terlaris',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <Mainbar header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Laporan</h2>}>
      <Head title="Laporan" />

      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Panel Laporan & Analisis</h3>
          <p className="text-sm text-gray-600">Pilih jenis laporan yang ingin ditampilkan dan ekspor jika diperlukan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {laporanCards.map((item, idx) => (
            <div key={idx} className="bg-white border border-green-200 rounded-xl p-4 sm:p-5 shadow hover:shadow-md transition relative">
              <div className="flex items-start gap-3 mb-3">
                {item.icon}
                <div>
                  <h4 className="text-md font-semibold text-green-800">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>

              <div className="relative mt-4">
                <button
                  onClick={() => toggleDropdown(idx)}
                  className="w-full inline-flex justify-between items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  Pilih Format Ekspor
                  <FaChevronDown className="ml-2" />
                </button>

                {openIndex === idx && (
                  <div className="absolute z-10 mt-2 w-full sm:w-auto left-0 sm:left-auto sm:right-0 bg-white border border-green-200 rounded shadow-lg text-sm">
                    <a
                      href={`${item.downloadPrefix}/pdf`}
                      target="_blank"
                      className="block px-4 py-2 hover:bg-green-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaFilePdf className="text-red-600" /> PDF
                    </a>
                    <a
                      href={`${item.downloadPrefix}/excel`}
                      target="_blank"
                      className="block px-4 py-2 hover:bg-green-50 flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaFileExcel className="text-green-600" /> Excel
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Mainbar>
  );
}
