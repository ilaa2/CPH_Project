import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import Select from 'react-select';

// Komponen Detail Modal
const DetailModal = ({ model, onClose }) => (
    <Modal show={true} onClose={onClose} maxWidth="2xl">
        <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
                    <p className="text-sm text-gray-500">Pesanan #{model.id}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold text-green-600">Cahaya Pagi Hidroponik</h2>
                    <p className="text-xs text-gray-500">Jl. Marsan Sejahtera, Pekanbaru</p>
                </div>
            </div>

            {/* Info Pelanggan & Tanggal */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-8">
                <div>
                    <p className="font-semibold mb-1">Ditagihkan Kepada:</p>
                    <p className="font-bold">{model.pelanggan?.nama}</p>
                    <p>{model.pelanggan?.alamat || 'Alamat tidak tersedia'}</p>
                    <p>{model.pelanggan?.telepon}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold">Tanggal Pesanan:</span> {new Date(model.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p><span className="font-semibold">Status:</span> <span className={`font-medium ${model.status === 'Selesai' ? 'text-green-600' : 'text-yellow-600'}`}>{model.status}</span></p>
                </div>
            </div>

            {/* Tabel Item */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">Produk</th>
                            <th className="p-3 text-center font-semibold text-gray-600">Jumlah</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Harga Satuan</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {model.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3">{item.produk?.nama}</td>
                                <td className="p-3 text-center">{item.jumlah}</td>
                                <td className="p-3 text-right">Rp {(item.subtotal / item.jumlah).toLocaleString('id-ID')}</td>
                                <td className="p-3 text-right">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-6">
                <div className="w-full max-w-xs text-gray-700 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold">Subtotal</span>
                        <span>Rp {model.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2">
                        <span>Total</span>
                        <span>Rp {model.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
                <p>Terima kasih telah berbelanja di Cahaya Pagi Hidroponik.</p>
            </div>
        </div>
    </Modal>
);

// Komponen Form Pesanan
const PesananForm = ({ isEditing, model, pelangganList, produkList, onSubmit, onCancel }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    pelanggan_id: model?.id_pelanggan || '',
    tanggal: model?.tanggal || new Date().toISOString().split('T')[0],
    status: model?.status || 'Diproses',
    items: model?.items?.map(i => ({ produk_id: i.produk_id, jumlah: i.jumlah })) || [{ produk_id: '', jumlah: 1 }],
    _method: isEditing ? 'PUT' : 'POST',
  });

  useEffect(() => {
    reset({
      pelanggan_id: model?.id_pelanggan || '',
      tanggal: model?.tanggal || new Date().toISOString().split('T')[0],
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
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
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

export default function PesananIndex({ pesanan, filters, pelangganList, produkList }) {
  const { flash } = usePage().props;
  const { data, links, from } = pesanan;
  const [modalState, setModalState] = useState({ type: null, model: null });
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const openModal = (type, model = null) => setModalState({ type, model });
  const closeModal = () => setModalState({ type: null, model: null });

  const debouncedSearch = useCallback(debounce((value) => {
    router.get(route('pesanan.index'), { search: value }, { preserveState: true, replace: true });
  }, 300), []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

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

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Pesanan</h2>
        <button onClick={() => openModal('form')} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
          + Tambah Pesanan
        </button>
      </div>
    }>
      <Head title="Daftar Pesanan" />
      <div className="p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <input type="text" value={searchValue} onChange={handleSearchChange} placeholder="Cari nama pelanggan..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-green-500" />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
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
              {data.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{from + index}</td>
                  <td className="px-4 py-2 font-medium">{item.pelanggan?.nama || '-'}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">Rp {item.total.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Selesai' ? 'bg-green-100 text-green-800' : item.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal('detail', item)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full" title="Lihat">👁️</button>
                      <button onClick={() => openModal('form', item)} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-full" title="Hapus">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination links={links} />
      </div>

      {modalState.type === 'detail' && <DetailModal model={modalState.model} onClose={closeModal} />}
      {modalState.type === 'form' && (
        <Modal show={true} onClose={closeModal} maxWidth="2xl">
          <PesananForm isEditing={!!modalState.model} model={modalState.model} pelangganList={pelangganList} produkList={produkList} onSubmit={closeModal} onCancel={closeModal} />
        </Modal>
      )}
    </Mainbar>
  );
}