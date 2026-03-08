import { Head, usePage, router } from '@inertiajs/react';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import DetailModal from './DetailModal';
// import EditModal from './EditModal'; // Unused for now
import KunjunganFormModal from './Partials/KunjunganFormModal'; // Import Modal Create
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { format, isBefore, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { debounce } from 'lodash';
import FilterHeader from '@/Components/FilterHeader';

const STATUS_STYLES = {
  'Dijadwalkan': 'bg-green-100 text-green-800',
  'Menunggu Konfirmasi': 'bg-orange-100 text-orange-800',
  'Selesai': 'bg-blue-100 text-blue-800',
  'Dibatalkan': 'bg-red-100 text-red-800'
};

export default function JadwalKunjungan({ kunjungan, filters, pelangganList, tipeKunjunganList }) {
  const { data, links, from } = kunjungan;
  const [selected, setSelected] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State Modal Create
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [tipeFilter, setTipeFilter] = useState(filters.tipe || 'Semua');

  const debouncedFilter = useCallback(debounce((search, tipe) => {
    router.get(route('admin.kunjungan.jadwal'), {
      search: search || undefined,
      tipe: tipe !== 'Semua' ? tipe : undefined
    }, { preserveState: true, replace: true });
  }, 300), []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedFilter(e.target.value, tipeFilter);
  };

  const handleTipeChange = (tipe) => {
    setTipeFilter(tipe);
    debouncedFilter(searchValue, tipe);
  };

  useEffect(() => {
    const start = router.on('start', () => setIsLoading(true));
    const finish = router.on('finish', () => setIsLoading(false));
    return () => { start(); finish(); };
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data kunjungan akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.kunjungan.destroy', id), {
          onSuccess: () => Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success')
        });
      }
    });
  };

  const handleComplete = (item) => {
    Swal.fire({
      title: 'Selesaikan Kunjungan?',
      text: `Kunjungan ${item.user?.name || 'Guest'} akan ditandai selesai.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Ya, Selesaikan',
      cancelButtonText: 'Batal',
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
            setSelected(null); // Close the detail modal
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

  const getStatusInfo = (item) => {
    const today = startOfDay(new Date());
    const visitDate = startOfDay(new Date(item.tanggal));
    const isOverdue = item.status === 'Dijadwalkan' && isBefore(visitDate, today);
    let displayStatus = item.status;
    let badgeClass = STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-800';

    if (isOverdue) displayStatus = 'Menunggu Konfirmasi';

    return { displayStatus, badgeClass, isOverdue };
  };

  const tabs = ['Semua', 'Umum', 'Outing Class'];

  return (
    <KunjunganLayout>
      <Head title="Jadwal Kunjungan" />
      <div className="space-y-6">
        {/* Header Section with Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manajemen Kunjungan</h2>
            <p className="text-sm text-gray-500">Kelola jadwal kunjungan pelanggan</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all flex items-center justify-center gap-2 font-medium"
          >
            <span>+</span> Buat Kunjungan Baru
          </button>
        </div>

        <FilterHeader
          tabs={tabs}
          activeTab={tipeFilter}
          onTabChange={handleTipeChange}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cari nama pelanggan..."
        />

        <div className="overflow-x-auto bg-white rounded-xl shadow-md min-h-[300px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-sm">
              <LoadingSpinner text="Memuat data..." />
            </div>
          )}
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Waktu Kunjungan</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3 text-center">Peserta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => {
                  const { displayStatus, badgeClass, isOverdue } = getStatusInfo(item);
                  return (
                    <tr key={item.id} className={`border-b hover:bg-gray-50 ${isOverdue ? 'bg-orange-50' : ''}`}>
                      <td className="px-4 py-2">{from + index}</td>
                      <td className="px-4 py-2">
                        <div className="font-semibold text-gray-900">{item.user?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{item.user?.email || '-'}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-800">
                          {format(new Date(item.tanggal), 'dd MMMM yyyy', { locale: id })}
                        </div>
                        <div className="text-xs text-gray-500">Pukul {item.jam} WIB</div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium border border-gray-200">
                          {item.tipe?.nama_tipe}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="text-xs">
                          <span title="Dewasa">👨 {item.jumlah_dewasa}</span> •
                          <span title="Anak">👶 {item.jumlah_anak}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {displayStatus}
                        </span>
                        {isOverdue && <div className="text-[10px] text-orange-600 font-bold mt-1">Lewat Jadwal</div>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setSelected(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Detail">👁️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Belum ada jadwal kunjungan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination links={links} />
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} onEdit={handleComplete} />}

      {/* Modal Create Baru */}
      <KunjunganFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        pelangganList={pelangganList}
        tipeKunjunganList={tipeKunjunganList}
      />
    </KunjunganLayout>
  );
}