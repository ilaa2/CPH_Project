import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import Select from 'react-select';
import UlasanPreview from '@/Components/UlasanPreview';
import FilterHeader from '@/Components/FilterHeader';

// Komponen Detail Modal
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
          <p className="font-bold text-gray-900 text-base">{model.pelanggan?.nama}</p>
          <p className="text-gray-600 mt-1">{model.pelanggan?.alamat || 'Alamat tidak tersedia'}</p>
          <p className="text-gray-600">{model.pelanggan?.telepon}</p>
        </div>
        <div className="text-right">
          <div className="mb-3">
            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">TANGGAL PESANAN</p>
            <p className="font-medium text-gray-900">{new Date(model.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">STATUS</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${model.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {model.status}
            </span>
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
            <span className="text-green-700">Rp {model.total.toLocaleString('id-ID')}</span>
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

// Komponen Form Pesanan
const PesananForm = ({ isEditing, model, pelangganList, produkList, onSubmit, onCancel }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    pelanggan_id: model?.id_pelanggan || '',
    tanggal: model?.tanggal || new Date().toISOString().split('T')[0],
    biaya_pengiriman: model?.biaya_pengiriman || 0,
    status: model?.status || 'Diproses',
    items: model?.items?.map(i => ({ produk_id: i.produk_id, jumlah: i.jumlah })) || [{ produk_id: '', jumlah: 1 }],
    _method: isEditing ? 'PUT' : 'POST',
  });

  useEffect(() => {
    reset({
      pelanggan_id: model?.id_pelanggan || '',
      tanggal: model?.tanggal || new Date().toISOString().split('T')[0],
      biaya_pengiriman: model?.biaya_pengiriman || 0,
      status: model?.status || 'Diproses',
      items: model?.items?.map(i => ({ produk_id: i.produk_id, jumlah: i.jumlah })) || [{ produk_id: '', jumlah: 1 }],
      _method: isEditing ? 'PUT' : 'POST',
    });
  }, [model, isEditing]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const addItem = () => setData('items', [...data.items, { produk_id: '', jumlah: 1 }]);
  const removeItem = (index) => setData('items', data.items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing ? route('pesanan.update', model.id) : route('pesanan.store');
    post(url, { onSuccess: () => { reset(); onSubmit(); } });
  };

  const produkOptions = produkList.map(p => ({ value: p.id, label: `${p.nama} (Stok: ${p.stok})` }));
  const pelangganOptions = pelangganList.map(p => ({ value: p.id, label: p.nama }));

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? 'Edit Pesanan' : 'Tambah Pesanan'}</h2>

      <div>
        <label className="block font-medium text-sm text-gray-700">Pelanggan</label>
        <Select options={pelangganOptions} value={pelangganOptions.find(o => o.value === data.pelanggan_id)} onChange={opt => setData('pelanggan_id', opt.value)} />
        <InputError message={errors.pelanggan_id} className="mt-2" />
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Biaya Pengiriman</label>
        <input type="number" min="0" value={data.biaya_pengiriman} onChange={e => setData('biaya_pengiriman', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        <InputError message={errors.biaya_pengiriman} className="mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm text-gray-700">Tanggal</label>
          <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          <InputError message={errors.tanggal} className="mt-2" />
        </div>
        {isEditing && (
          <div>
            <label className="block font-medium text-sm text-gray-700">Status</label>
            <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option value="pending">Pending</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
            <InputError message={errors.status} className="mt-2" />
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700 mb-2">Item Produk</label>
        {data.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Select options={produkOptions} value={produkOptions.find(o => o.value === item.produk_id)} onChange={opt => handleItemChange(index, 'produk_id', opt.value)} className="flex-grow" />
            <input type="number" min="1" value={item.jumlah} onChange={e => handleItemChange(index, 'jumlah', e.target.value)} className="w-24 border-gray-300 rounded-md shadow-sm" />
            {data.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-500">Hapus</button>}
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-green-600 hover:underline mt-2">+ Tambah Item</button>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
        <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50">{isEditing ? 'Simpan' : 'Tambah'}</button>
      </div>
    </form>
  );
};

// Komponen Pagination
const Pagination = ({ links }) => (
  <div className="flex flex-wrap justify-center mt-4">
    {links.map((link, index) => (
      <Link key={index} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 mx-1 my-1 rounded-md text-sm ${link.active ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'text-gray-400' : ''}`} />
    ))}
  </div>
);

import LoadingSpinner from '@/Components/LoadingSpinner'; // Update import

export default function PesananIndex({ pesanan, filters, pelangganList, produkList }) {
  const { flash } = usePage().props;
  const { data, links, from } = pesanan;
  const [modalState, setModalState] = useState({ type: null, model: null });
  const [searchValue, setSearchValue] = useState(filters.search || '');
  // State untuk Status Filter
  const [statusFilter, setStatusFilter] = useState(filters.status || 'Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Handler Filter Status
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    router.get(route('pesanan.index'), { status: status !== 'Semua' ? status : undefined, search: searchValue }, {
      preserveState: true,
      replace: true,
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false)
    });
  };

  const openModal = (type, model = null) => setModalState({ type, model });
  const closeModal = () => setModalState({ type: null, model: null });

  const debouncedSearch = useCallback(debounce((value) => {
    router.get(route('pesanan.index'), { search: value, status: statusFilter !== 'Semua' ? statusFilter : undefined }, {
      preserveState: true,
      replace: true,
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false)
    });
  }, 300), [statusFilter]); // Dependensi statusFilter penting

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    const removeStartListener = router.on('start', () => setIsLoading(true));
    const removeFinishListener = router.on('finish', () => setIsLoading(false));
    return () => {
      removeStartListener();
      removeFinishListener();
    };
  }, []);

  useEffect(() => {
    if (flash.success) Swal.fire({ icon: 'success', title: 'Berhasil!', text: flash.success, timer: 2000, showConfirmButton: false });
    if (flash.error) Swal.fire({ icon: 'error', title: 'Gagal!', text: flash.error });
  }, [flash]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data pesanan akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) router.delete(route('pesanan.destroy', id));
    });
  };

  const tabs = ['Semua', 'Diproses', 'Selesai']; // Tab yang tersedia

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Pesanan</h2>
        <Link href={route('pesanan.create')} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
          + Tambah Pesanan
        </Link>
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
                data.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{from + index}</td>
                    <td className="px-4 py-2 font-medium">{item.pelanggan?.nama || '-'}</td>
                    <td className="px-4 py-2">{item.tanggal}</td>
                    <td className="px-4 py-2">Rp {item.total.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span></td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal('detail', item)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full" title="Lihat Detail">👁️</button>
                        <Link href={route('pesanan.edit', item.id)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full inline-flex items-center justify-center" title="Edit">✏️</Link>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-full" title="Hapus">🗑️</button>
                        {item.status === 'Selesai' && item.ulasan && (
                          <button
                            onClick={() => openModal('ulasan', item)}
                            className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-full text-yellow-700"
                            title="Lihat Ulasan"
                          >
                            ⭐
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Data pesanan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination links={links} />
      </div >

      {modalState.type === 'detail' && <DetailModal model={modalState.model} onClose={closeModal} />}

      {/* Modal Ulasan */}
      {
        modalState.type === 'ulasan' && (
          <Modal show={true} onClose={closeModal} maxWidth="lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Ulasan Pesanan</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <UlasanPreview
                ulasan={modalState.model?.ulasan}
                pelanggan={modalState.model?.pelanggan}
                tipe="Pembelian Produk"
                isAdmin={true}
              />

              <div className="mt-6 text-right">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </Modal>
        )
      }

      {
        modalState.type === 'form' && (
          <Modal show={true} onClose={closeModal} maxWidth="2xl">
            <PesananForm isEditing={!!modalState.model} model={modalState.model} pelangganList={pelangganList} produkList={produkList} onSubmit={closeModal} onCancel={closeModal} />
          </Modal>
        )
      }
    </Mainbar >
  );
}