import { Head, usePage, router } from '@inertiajs/react';
import KunjunganLayout from '@/Layouts/KunjunganLayout';
import Modal from '@/Components/Modal';
import UlasanPreview from '@/Components/UlasanPreview';
import LoadingSpinner from '@/Components/LoadingSpinner'; // Import LoadingSpinner
import { useState, useEffect, useCallback } from 'react'; // Import useEffect
import { debounce } from 'lodash';
import FilterHeader from '@/Components/FilterHeader';
import DetailModal from './DetailModal';

export default function RiwayatKunjungan() {
  const { props } = usePage();
  const riwayat = props.riwayat || [];
  const filters = props.filters || {};
  const [selected, setSelected] = useState(null);
  const [ulasanModalState, setUlasanModalState] = useState({ isOpen: false, item: null });
  const [tipeFilter, setTipeFilter] = useState(filters.tipe || 'Semua');
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [isLoading, setIsLoading] = useState(false); // State Loading

  const debouncedFilter = useCallback(
    debounce((search, tipe) => {
      router.get(route('admin.kunjungan.riwayat'), {
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

  // Listener Loading
  useEffect(() => {
    const removeStartListener = router.on('start', () => setIsLoading(true));
    const removeFinishListener = router.on('finish', () => setIsLoading(false));

    return () => {
      removeStartListener();
      removeFinishListener();
    };
  }, []);

  const openUlasanModal = (item) => {
    setUlasanModalState({ isOpen: true, item: item });
  };

  const closeUlasanModal = () => {
    setUlasanModalState({ isOpen: false, item: null });
  };

  const handleFilterTipe = (tipe) => {
    setTipeFilter(tipe);
    router.get(route('admin.kunjungan.riwayat'), { tipe: tipe !== 'Semua' ? tipe : undefined }, {
      preserveState: true,
      replace: true
    });
  };

  const tabs = ['Semua', 'Umum', 'Outing Class'];

  return (
    <>
      <Head title="Riwayat Kunjungan" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            Berikut adalah riwayat kunjungan yang telah selesai dilakukan.
          </p>
        </div>

        <FilterHeader
          tabs={tabs}
          activeTab={tipeFilter}
          onTabChange={handleTipeChange}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cari nama pelanggan..."
        />

        {/* Tabel */}
        <div className="overflow-x-auto bg-white rounded-lg shadow relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-sm">
              <LoadingSpinner text="Memuat riwayat kunjungan..." />
            </div>
          )}
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-green-100 text-green-800 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama Pelanggan</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item.user?.name || 'Guest'}</td>
                    <td className="px-4 py-2">{item.tipe?.nama_tipe || '-'}</td>
                    <td className="px-4 py-2">{item.tanggal}</td>
                    <td className="px-4 py-2 capitalize">{item.status}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-all shadow-sm active:scale-95"
                          title="Lihat Detail Kunjungan"
                        >
                          👁️
                        </button>

                        <button
                          onClick={() => item.ulasan ? openUlasanModal(item) : null}
                          className={`p-2 rounded-full transition-all shadow-sm active:scale-95 ${item.ulasan
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                          title={item.ulasan ? 'Lihat Ulasan' : 'Belum ada ulasan'}
                          disabled={!item.ulasan}
                        >
                          ⭐
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">Belum ada riwayat kunjungan selesai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Detail Kunjungan */}
        {selected && (
          <DetailModal
            item={selected}
            onClose={() => setSelected(null)}
            onViewReview={openUlasanModal}
          />
        )}

        {/* Modal Ulasan */}
        {ulasanModalState.isOpen && (
          <Modal show={true} onClose={closeUlasanModal} maxWidth="lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Ulasan Kunjungan</h2>
                <button onClick={closeUlasanModal} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <UlasanPreview
                ulasan={ulasanModalState.item?.ulasan}
                pelanggan={ulasanModalState.item?.user}
                tipe={ulasanModalState.item?.tipe?.nama_tipe}
                isAdmin={true}
              />

              <div className="mt-6 text-right">
                <button
                  onClick={closeUlasanModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

RiwayatKunjungan.layout = page => <KunjunganLayout children={page} />;
