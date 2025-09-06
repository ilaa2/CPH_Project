import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Head, Link } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { FiArrowLeft } from 'react-icons/fi';

export default function Kalender({ kunjungan = [] }) {
  const [modalData, setModalData] = useState(null);

  const statusColor = {
    'dijadwalkan': '#34d399',
    'selesai': '#60a5fa',
    'dibatalkan': '#f87171',
  };

  const events = kunjungan.map(k => ({
    id: k.id,
    title: `${k.pelanggan.nama} (${k.status})`,
    start: k.tanggal,
    backgroundColor: statusColor[k.status.toLowerCase()] || '#e5e7eb',
    borderColor: statusColor[k.status.toLowerCase()] || '#e5e7eb',
    textColor: '#1f2937',
    extendedProps: {
      alamat: k.pelanggan.alamat,
      no_hp: k.pelanggan.no_hp,
      status: k.status,
      jumlah_pengunjung: k.jumlah_pengunjung,
      total_biaya: k.total_biaya,
      keterangan: k.deskripsi,
      judul: k.judul,
      jam: k.jam,
    }
  }));

  const handleEventClick = (info) => {
    setModalData({
      nama: info.event.title.split(' (')[0],
      alamat: info.event.extendedProps.alamat,
      judul: info.event.extendedProps.judul,
      tipe: info.event.extendedProps.tipe || 'Umum',
      deskripsi: info.event.extendedProps.keterangan,
      tanggal: info.event.start.toISOString().split('T')[0],
      jam: info.event.extendedProps.jam,
      jumlah_pengunjung: info.event.extendedProps.jumlah_pengunjung,
      total_biaya: info.event.extendedProps.total_biaya,
      status: info.event.extendedProps.status,
    });
  };

  return (
    <Mainbar
      header={
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Kalender Kunjungan
        </h2>
      }
    >
      <Head title="Kalender Kunjungan" />

      <div className="p-6 space-y-6">
        <Link
          href="/kunjungan"
          className="inline-flex items-center px-4 py-2 bg-white text-green-600 border border-green-600 rounded hover:bg-green-50 transition"
        >
          <FiArrowLeft className="mr-2" />
          Kembali
        </Link>

        <div className="bg-white rounded-xl shadow border-l-4 border-green-600 p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            eventDisplay="block"
          />
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <h3 className="font-semibold text-green-700 mb-3">Keterangan Warna:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><span className="inline-block w-4 h-4 bg-[#34d399] mr-2 rounded-sm"></span>Dijadwalkan</li>
            <li><span className="inline-block w-4 h-4 bg-[#60a5fa] mr-2 rounded-sm"></span>Selesai</li>
            <li><span className="inline-block w-4 h-4 bg-[#f87171] mr-2 rounded-sm"></span>Dibatalkan</li>
          </ul>
        </div>
      </div>

      {/* Modal Detail */}
      {modalData && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setModalData(null)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-green-700 font-semibold mb-4">Detail Kunjungan</h3>
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr><td className="py-1 font-medium">Nama Pelanggan</td><td className="py-1">{modalData.nama}</td></tr>
                  <tr><td className="py-1 font-medium">Alamat</td><td className="py-1">{modalData.alamat}</td></tr>
                  <tr><td className="py-1 font-medium">Judul</td><td className="py-1">{modalData.judul}</td></tr>
                  <tr><td className="py-1 font-medium">Tipe</td><td className="py-1">{modalData.tipe}</td></tr>
                  <tr><td className="py-1 font-medium">Deskripsi</td><td className="py-1">{modalData.deskripsi || '-'}</td></tr>
                  <tr><td className="py-1 font-medium">Tanggal</td><td className="py-1">{modalData.tanggal}</td></tr>
                  <tr><td className="py-1 font-medium">Jam</td><td className="py-1">{modalData.jam}</td></tr>
                  <tr><td className="py-1 font-medium">Jumlah Pengunjung</td><td className="py-1">{modalData.jumlah_pengunjung}</td></tr>
                  <tr><td className="py-1 font-medium">Total Biaya</td><td className="py-1">Rp {modalData.total_biaya?.toLocaleString('id-ID')}</td></tr>
                  <tr><td className="py-1 font-medium">Status</td><td className="py-1">{modalData.status}</td></tr>
                </tbody>
              </table>
              <div className="mt-6 text-right">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={() => setModalData(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Mainbar>
  );
}
