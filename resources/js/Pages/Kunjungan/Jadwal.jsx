import { Head, usePage, router } from '@inertiajs/react';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import DetailModal from './DetailModal'; // Assuming these exist or will be fixed
import EditModal from './EditModal';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { format, isBefore, startOfDay } from 'date-fns';
import { debounce } from 'lodash';
import FilterHeader from '@/Components/FilterHeader';

const STATUS_STYLES = {
  'Dijadwalkan': 'bg-green-100 text-green-800',
  'Menunggu Konfirmasi': 'bg-orange-100 text-orange-800',
  'Selesai': 'bg-blue-100 text-blue-800'
};

// ... existing components

export default function JadwalKunjungan({ kunjungan, filters }) {
  const { data, links, from } = kunjungan;
  const [selected, setSelected] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [tipeFilter, setTipeFilter] = useState(filters.tipe || 'Semua');

  const debouncedFilter = useCallback(
    debounce((search, tipe) => {
      router.get(route('kunjungan.jadwal'), {
        search: search || undefined,
        tipe: tipe !== 'Semua' ? tipe : undefined
      }, {
        preserveState: true,
        replace: true,
      });
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedFilter(e.target.value, tipeFilter);
  };

  const handleTipeChange = (tipe) => {
    setTipeFilter(tipe);
    debouncedFilter(searchValue, tipe);
  };

  useEffect(() => {
    const removeStartListener = router.on('start', () => setIsLoading(true));
    const removeFinishListener = router.on('finish', () => setIsLoading(false));
    return () => {
      removeStartListener();
      removeFinishListener();
    };
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
        router.delete(route('kunjungan.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Data kunjungan berhasil dihapus.', 'success');
          }
        });
      }
    });
  };

  // Helper for status logic
  const getStatusInfo = (item) => {
    const today = startOfDay(new Date());
    const visitDate = startOfDay(new Date(item.tanggal));
    const isOverdue = item.status === 'Dijadwalkan' && isBefore(visitDate, today);

    let displayStatus = item.status;
    let badgeClass = STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-800';

    if (isOverdue) {
      displayStatus = 'Menunggu Konfirmasi';
      badgeClass = STATUS_STYLES['Menunggu Konfirmasi'];
    }

    return { displayStatus, badgeClass, isOverdue };
  };

  const tabs = ['Semua', 'Umum', 'Outing Class'];

  return (
    <>
      <Head title="Jadwal Kunjungan" />
      <div className="space-y-6">
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
              <LoadingSpinner text="Memuat data kunjungan..." />
            </div>
          )}
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Total Biaya</th>
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
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {item.pelanggan?.nama}
                        {isOverdue && <span className="block text-[10px] text-orange-600 font-bold">Perlu Konfirmasi</span>}
                      </td>
                      <td className="px-4 py-2">
                        {format(new Date(item.tanggal), 'dd/MM/yyyy')}
                        <div className="text-xs text-gray-500">{item.jam}</div>
                      </td>
                      <td className="px-4 py-2">{item.tipe?.nama_tipe || '-'}</td>
                      <td className="px-4 py-2">{`${(item.jumlah_dewasa || 0) + (item.jumlah_anak || 0) + (item.jumlah_balita || 0)} Orang`}</td>
                      <td className="px-4 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_biaya)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 flex items-center justify-center gap-2">
                        <button onClick={() => setSelected(item)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition" title="Detail">👁️</button>
                        <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition" title="Hapus">🗑️</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Data kunjungan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination links={links} />

        {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
        {editingItem && <EditModal item={editingItem} onClose={() => setEditingItem(null)} />}
      </div>
    </>
  );
}

JadwalKunjungan.layout = page => <KunjunganLayout children={page} />