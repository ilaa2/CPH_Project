import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Head } from '@inertiajs/react';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import Modal from '@/Components/Modal'; // Menggunakan komponen Modal yang konsisten
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Fungsi untuk mendapatkan kelas styling berdasarkan status
const getEventStyle = (status) => {
  switch (status) {
    case 'Dijadwalkan':
      return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    case 'Selesai':
      return 'bg-green-100 text-green-800 border-l-4 border-green-500';
    case 'Dibatalkan':
      return 'bg-gray-100 text-gray-600 border-l-4 border-gray-400 line-through';
    default:
      return 'bg-gray-100 text-gray-800 border-l-4 border-gray-400';
  }
};

// Komponen untuk merender event kustom di kalender
const renderEventContent = (eventInfo) => {
  const { status, tipe_kunjungan } = eventInfo.event.extendedProps;
  const time = format(new Date(eventInfo.event.start), 'HH:mm');

  return (
    <div className={`px-2 py-1 rounded shadow-sm overflow-hidden h-full ${getEventStyle(status)}`}>
      <div className="font-semibold text-sm truncate">{eventInfo.event.title}</div>
      <div className="text-xs opacity-80">{`${time} - ${tipe_kunjungan}`}</div>
    </div>
  );
};

export default function Kalender({ kunjungan = [] }) {
  const [modalData, setModalData] = useState(null);

  const events = kunjungan.map(k => ({
    id: k.id,
    title: k.pelanggan.nama,
    start: `${k.tanggal}T${k.jam || '00:00:00'}`,
    allDay: !k.jam,
    extendedProps: {
      ...k,
      tipe_kunjungan: k.tipe_kunjungan?.nama || 'Umum',
    }
  }));

  const handleEventClick = (info) => {
    setModalData(info.event.extendedProps);
  };

  const closeModal = () => setModalData(null);

  return (
    <>
      <Head title="Kalender Kunjungan" />

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="80vh"
            locale={id}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            buttonText={{
                today:    'Hari Ini',
                month:    'Bulan',
                week:     'Minggu',
                day:      'Hari',
            }}
            dayCellClassNames="text-sm"
            eventClassNames="cursor-pointer"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border">
          <h3 className="font-semibold text-gray-700 mb-3">Keterangan Status:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center"><span className="w-4 h-4 bg-blue-500 mr-2 rounded-sm"></span>Dijadwalkan</div>
            <div className="flex items-center"><span className="w-4 h-4 bg-green-500 mr-2 rounded-sm"></span>Selesai</div>
            <div className="flex items-center"><span className="w-4 h-4 bg-gray-400 mr-2 rounded-sm"></span>Dibatalkan</div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {modalData && (
        <Modal show={true} onClose={closeModal} maxWidth="lg">
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detail Kunjungan</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Pelanggan:</span><span>{modalData.pelanggan.nama}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Tanggal:</span><span>{format(new Date(modalData.tanggal), 'd MMMM yyyy', { locale: id })}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Jam:</span><span>{modalData.jam} WIB</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Tipe:</span><span>{modalData.tipe_kunjungan}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            {'Dijadwalkan': 'bg-blue-100 text-blue-800', 'Selesai': 'bg-green-100 text-green-800', 'Dibatalkan': 'bg-gray-100 text-gray-700'}[modalData.status]
                        }`}>{modalData.status}</span>
                    </div>
                    <hr className="my-2"/>
                    <div className="flex justify-between font-bold"><span className="text-gray-600">Total Biaya:</span><span>Rp {modalData.total_biaya?.toLocaleString('id-ID')}</span></div>
                </div>
                <div className="mt-6 text-right">
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300" onClick={closeModal}>
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
}

Kalender.layout = page => <KunjunganLayout children={page} />;