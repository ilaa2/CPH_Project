import { Head, Link, router, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Modal from '@/Components/Modal';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import UlasanPreview from '@/Components/UlasanPreview';
import FilterHeader from '@/Components/FilterHeader';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PesananFormModal from './Partials/PesananFormModal'; // Import Component Modal Baru

// Komponen Detail Modal (Tetap Pertahankan)
const DetailModal = ({ model, onClose }) => (
  <Modal show={true} onClose={onClose} maxWidth="2xl">
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">INVOICE</h1>
          <p className="text-sm text-gray-500 mt-1">#INV-{String(model.id).padStart(5, '0')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-green-700 uppercase tracking-wide">CENTRAL PALANTEA HIDROPONIK</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-[250px] ml-auto">
            Jl. Melayu, Babussalam, Mandau, Bengkalis Regency, Riau 28784
          </p>
        </div>
      </div>

      {/* Info Pelanggan & Tanggal */}
      <div className="grid grid-cols-2 gap-8 text-sm text-gray-700 mb-8 border-t border-b border-gray-100 py-6">
        <div>
          <p className="text-gray-500 text-xs uppercase font-semibold mb-2">DITAGIHkan KEPADA</p>
          <p className="font-bold text-gray-900 text-base">{model.user?.name || '-'}</p>
          <p className="text-gray-600 mt-1">{model.user?.alamat || 'Alamat tidak tersedia'}</p>
          <p className="text-gray-600">{model.user?.phone || '-'}</p>
        </div>
        <div className="text-right">
          <div className="mb-3">
            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">TANGGAL PESANAN</p>
            <p className="font-medium text-gray-900">{new Date(model.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">STATUS</p>
            {(() => {
              const s = model.status?.toLowerCase();
              let label = model.status;
              let color = 'bg-gray-100 text-gray-800';

              if (s === 'completed' || s === 'selesai') {
                label = 'Selesai';
                color = 'bg-green-100 text-green-800';
              } else if (s === 'processed' || s === 'diproses') {
                label = 'Diproses';
                color = 'bg-blue-100 text-blue-800';
              } else if (s === 'shipped' || s === 'dikirim') {
                label = 'Dikirim';
                color = 'bg-purple-100 text-purple-800';
              } else if (s === 'pending' || s === 'menunggu pembayaran') {
                label = 'Menunggu';
                color = 'bg-yellow-100 text-yellow-800';
              } else if (s === 'dibatalkan' || s === 'cancelled') {
                label = 'Dibatalkan';
                color = 'bg-red-100 text-red-800';
              }

              return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
            })()}
          </div>
        </div>
      </div>

      {/* Tabel Item */}
      <div className="overflow-hidden border border-gray-200 rounded-lg mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">PRODUK</th>
              <th className="p-4 text-center font-semibold text-gray-600">JUMLAH</th>
              <th className="p-4 text-right font-semibold text-gray-600">HARGA SATUAN</th>
              <th className="p-4 text-right font-semibold text-gray-600">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {model.items.map(item => (
              <tr key={item.id}>
                <td className="p-4 text-gray-800 font-medium">{item.produk?.nama}</td>
                <td className="p-4 text-center text-gray-600">{item.jumlah}</td>
                <td className="p-4 text-right text-gray-600">Rp {(item.subtotal / item.jumlah).toLocaleString('id-ID')}</td>
                <td className="p-4 text-right text-gray-900 font-medium">Rp {item.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-gray-600">
            <span className="font-medium">Subtotal</span>
            <span>Rp {model.items.reduce((acc, item) => acc + item.subtotal, 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span className="font-medium">Ongkos Kirim</span>
            <span>Rp {(model.total - model.items.reduce((acc, item) => acc + item.subtotal, 0)).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
            <span>Total Tagihan</span>
            <span className="text-green-700">Rp {Number(model.total).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 font-medium mb-1">Terima kasih telah berbelanja di Central Palantea Hidroponik.</p>
        <p className="text-xs text-gray-400 italic">Invoice ini dihasilkan secara otomatis oleh sistem.</p>
      </div>
    </div>
  </Modal>
);

// Pagination
const Pagination = ({ links }) => (
  <div className="flex flex-wrap justify-center mt-4">
    {links.map((link, index) => (
      <Link key={index} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 mx-1 my-1 rounded-md text-sm ${link.active ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'text-gray-400' : ''}`} />
    ))}
  </div>
);

export default function PesananIndex({ pesanan, filters, pelangganList, produkList }) {
  const { flash } = usePage().props;
  const { data, links, from } = pesanan;

  // State 
  const [modalState, setModalState] = useState({ type: null, model: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State khusus buat Create Modal Baru
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Filter Handlers
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    router.get(route('admin.pesanan.index'), { status: status !== 'Semua' ? status : undefined, search: searchValue }, {
      preserveState: true, replace: true,
      onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false)
    });
  };

  const openModal = (type, model = null) => setModalState({ type, model });
  const closeModal = () => setModalState({ type: null, model: null });

  const debouncedSearch = useCallback(debounce((value) => {
    router.get(route('admin.pesanan.index'), { search: value, status: statusFilter !== 'Semua' ? statusFilter : undefined }, {
      preserveState: true, replace: true,
      onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false)
    });
  }, 300), [statusFilter]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => { // Global Loading Handler
    const removeStart = router.on('start', () => setIsLoading(true));
    const removeFinish = router.on('finish', () => setIsLoading(false));
    return () => { removeStart(); removeFinish(); };
  }, []);

  useEffect(() => { // Flash Message Handler
    if (flash.success) Swal.fire({ icon: 'success', title: 'Berhasil!', text: flash.success, timer: 2000, showConfirmButton: false });
    if (flash.error) Swal.fire({ icon: 'error', title: 'Gagal!', text: flash.error });
  }, [flash]);

  const tabs = ['Semua', 'Menunggu', 'Diproses', 'Dikirim', 'Selesai'];

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Pesanan</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
        >
          + Tambah Pesanan
        </button>
      </div>
    }>
      <Head title="Manajemen Pesanan" />
      <div className="p-6 space-y-6">
        <FilterHeader
          tabs={tabs}
          activeTab={statusFilter}
          onTabChange={handleStatusChange}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cari nama pelanggan..."
        />

        <div className="overflow-x-auto bg-white rounded-xl shadow-md min-h-[300px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-sm">
              <LoadingSpinner text="Memuat data pesanan..." />
            </div>
          )}
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map(item => ( // Render Logic Sama
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.kode_pesanan || item.nomor_pesanan || item.id}</td>
                    <td className="px-4 py-2 font-medium">{item.user?.name || '-'}</td>
                    <td className="px-4 py-2">{item.tanggal}</td>
                    <td className="px-4 py-2">Rp {Number(item.total).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        item.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal('detail', item)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-sm active:scale-95" title="Lihat Detail">👁️</button>
                        <Link href={route('admin.pesanan.edit', item.id)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-all shadow-sm active:scale-95" title="Edit Pesanan">✏️</Link>
                        <button
                          onClick={() => item.ulasan?.length > 0 ? openModal('ulasan', item) : null}
                          className={`p-2 rounded-full transition-all shadow-sm active:scale-95 ${item.ulasan?.length > 0
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                          title={item.ulasan?.length > 0 ? 'Lihat Ulasan' : 'Belum ada ulasan'}
                          disabled={!item.ulasan?.length}
                        >
                          ⭐
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination links={links} />
      </div >

      {/* Modal Detail (Existing) */}
      {modalState.type === 'detail' && <DetailModal model={modalState.model} onClose={closeModal} />}

      {/* Modal Ulasan */}
      {modalState.type === 'ulasan' && (
        <Modal show={true} onClose={closeModal} maxWidth="lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Ulasan Pesanan</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {modalState.model?.ulasan?.map((review) => (
              <UlasanPreview
                key={review.id}
                ulasan={review}
                pelanggan={review.user || modalState.model?.user}
                isAdmin={true}
              />
            ))}
            <div className="mt-6 text-right">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal CREATE Pesanan Baru (Modified) */}
      <PesananFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        pelangganList={pelangganList}
        produkList={produkList}
      />

    </Mainbar >
  );
}