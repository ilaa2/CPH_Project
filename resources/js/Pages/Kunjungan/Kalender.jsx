import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Head } from '@inertiajs/react';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import Modal from '@/Components/Modal';
import { format, isBefore, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

import DetailModal from './DetailModal';
import EditModal from './EditModal';
import UlasanPreview from '@/Components/UlasanPreview';
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

// Konstanta Styles
const STATUS_STYLES = {
  'Dijadwalkan': 'bg-green-100 text-green-800 border-l-4 border-green-500', // Future
  'Menunggu Konfirmasi': 'bg-orange-100 text-orange-800 border-l-4 border-orange-500', // Past Scheduled
  'Selesai': 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
};

const renderEventContent = (eventInfo) => {
  const { displayStatus, tipe_kunjungan, colorClass } = eventInfo.event.extendedProps;
  const time = format(new Date(eventInfo.event.start), 'HH:mm');

  return (
    <div className={`px-2 py-1 rounded shadow-sm overflow-hidden h-full ${colorClass}`}>
      <div className="font-semibold text-sm truncate">{eventInfo.event.title}</div>
      <div className="text-xs">{`${time} - ${tipe_kunjungan}`}</div>
      <div className="text-[10px] font-bold uppercase mt-1 tracking-wider">{displayStatus}</div>
    </div>
  );
};

export default function Kalender({ kunjungan = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);

  // Proses data events dengan useMemo untuk performance
  const events = useMemo(() => {
    const today = startOfDay(new Date());

    return kunjungan.map(k => {
      const visitDate = startOfDay(new Date(k.tanggal));
      const isPast = isBefore(visitDate, today);

      let displayStatus = k.status;
      let colorClass = '';

      // LOGIKA UTAMA PENENTUAN STATUS & WARNA
      if (k.status === 'Dijadwalkan') {
        if (isPast) {
          displayStatus = 'Menunggu Konfirmasi';
          colorClass = STATUS_STYLES['Menunggu Konfirmasi'];
        } else {
          displayStatus = 'Dijadwalkan';
          colorClass = STATUS_STYLES['Dijadwalkan'];
        }
      } else if (k.status === 'Selesai') {
        colorClass = STATUS_STYLES['Selesai'];
      } else if (k.status === 'Dibatalkan') {
        colorClass = STATUS_STYLES['Dibatalkan'];
      } else {
        colorClass = 'bg-gray-100 text-gray-800 border-l-4 border-gray-400';
      }

      return {
        id: k.id,
        title: k.user?.name || k.pelanggan?.nama || 'Unknown',
        start: `${k.tanggal}T${k.jam || '09:00:00'}`,
        allDay: false,
        extendedProps: {
          ...k,
          tipe_kunjungan: k.tipe?.nama_tipe || 'Umum',
          displayStatus,
          colorClass
        }
      };
    });
  }, [kunjungan]);

  const handleEventClick = (info) => {
    setSelectedItem(info.event.extendedProps);
  };

  const handleComplete = (item) => {
    Swal.fire({
      title: 'Selesaikan Kunjungan?',
      text: "Pastikan kunjungan telah selesai dan pembayaran sudah diterima. Status akan diubah menjadi 'Selesai'.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Selesaikan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Send PUT request with only the actual database fields required by validation
        router.put(route('admin.kunjungan.update', item.id), {
          pelanggan_id: item.user_id,
          tipe_id: item.tipe_id,
          tanggal: item.tanggal,
          jam: item.jam,
          jumlah_dewasa: item.jumlah_dewasa,
          jumlah_anak: item.jumlah_anak,
          jumlah_balita: item.jumlah_balita,
          total_biaya: item.total_biaya,
          status: 'Selesai'
        }, {
          onSuccess: () => {
            setSelectedItem(null); // Close the detail modal
            Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Status kunjungan berhasil diubah menjadi Selesai.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          onError: (errors) => {
            console.error(errors);
            Swal.fire('Gagal', 'Gagal menyelesaikan kunjungan. Periksa form atau muat ulang halaman.', 'error');
          }
        });
      }
    });
  };

  return (
    <KunjunganLayout>
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
              today: 'Hari Ini',
              month: 'Bulan',
              week: 'Minggu',
              day: 'Hari',
            }}
            dayCellClassNames="text-sm align-top p-1"
            eventClassNames="cursor-pointer mb-1"
          />
        </div>

        {/* Legend Status */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Keterangan Status:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center p-2 rounded bg-green-50">
              <span className="w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
              <span className="text-green-800 font-medium">Dijadwalkan (Akan Datang)</span>
            </div>
            <div className="flex items-center p-2 rounded bg-orange-50">
              <span className="w-3 h-3 bg-orange-500 mr-2 rounded-full"></span>
              <span className="text-orange-800 font-medium">Menunggu Konfirmasi (Lewat)</span>
            </div>
            <div className="flex items-center p-2 rounded bg-blue-50">
              <span className="w-3 h-3 bg-blue-500 mr-2 rounded-full"></span>
              <span className="text-blue-800 font-medium">Selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail & Actions */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => handleComplete(selectedItem)}
          onViewReview={() => setReviewingItem(selectedItem)}
        />
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {reviewingItem && (
        <Modal show={true} onClose={() => setReviewingItem(null)} maxWidth="2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Ulasan Pengunjung</h2>
              <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <UlasanPreview
              ulasan={reviewingItem.ulasan}
              pelanggan={reviewingItem.pelanggan}
              tipe={reviewingItem.tipe_kunjungan}
              isAdmin={true}
            />

            <div className="mt-8 text-right">
              <button
                onClick={() => setReviewingItem(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </KunjunganLayout>
  );
}