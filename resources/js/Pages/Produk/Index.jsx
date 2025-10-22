import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal'; // <-- Import Modal Generik

// Komponen Form (untuk Tambah dan Edit)
const ProdukForm = ({ isEditing, model, kategori, onSubmit, onCancel }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    nama: model?.nama || '',
    id_kategori: model?.id_kategori || '',
    deskripsi: model?.deskripsi || '',
    harga: model?.harga || '',
    stok: model?.stok || '',
    gambar: null,
    status: model?.status || 'Aktif',
    _method: isEditing ? 'PUT' : 'POST',
  });

  useEffect(() => {
    // Reset form state when the model to edit changes
    setData({
      nama: model?.nama || '',
      id_kategori: model?.id_kategori || '',
      deskripsi: model?.deskripsi || '',
      harga: model?.harga || '',
      stok: model?.stok || '',
      gambar: null,
      status: model?.status || 'Aktif',
      _method: isEditing ? 'PUT' : 'POST',
    });
  }, [model, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing ? route('produk.update', model.id) : route('produk.store');
    // Gunakan 'post' untuk kedua kasus karena Inertia menangani method spoofing (_method)
    post(url, {
      onSuccess: () => {
        reset();
        onSubmit();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
      </h2>
      <div>
        <label className="block font-medium text-sm text-gray-700">Nama Produk</label>
        <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
        <InputError message={errors.nama} className="mt-2" />
      </div>
      <div>
        <label className="block font-medium text-sm text-gray-700">Kategori</label>
        <select value={data.id_kategori} onChange={e => setData('id_kategori', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full">
          <option value="">-- Pilih Kategori --</option>
          {kategori.map(cat => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
        </select>
        <InputError message={errors.id_kategori} className="mt-2" />
      </div>
      <div>
        <label className="block font-medium text-sm text-gray-700">Deskripsi</label>
        <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} rows="3" className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full"></textarea>
        <InputError message={errors.deskripsi} className="mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm text-gray-700">Harga</label>
          <input type="number" value={data.harga} onChange={e => setData('harga', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
          <InputError message={errors.harga} className="mt-2" />
        </div>
        <div>
          <label className="block font-medium text-sm text-gray-700">Stok</label>
          <input type="number" value={data.stok} onChange={e => setData('stok', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
          <InputError message={errors.stok} className="mt-2" />
        </div>
      </div>
      <div>
        <label className="block font-medium text-sm text-gray-700">Gambar {isEditing && '(Baru, opsional)'}</label>
        <input type="file" onChange={e => setData('gambar', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        <InputError message={errors.gambar} className="mt-2" />
      </div>
      <div>
        <label className="block font-medium text-sm text-gray-700">Status</label>
        <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full">
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <InputError message={errors.status} className="mt-2" />
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Batal</button>
        <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-transform transform hover:scale-105 disabled:opacity-50">
          {isEditing ? 'Simpan Perubahan' : 'Simpan Produk'}
        </button>
      </div>
    </form>
  );
};


// Komponen Pagination
const Pagination = ({ links }) => (
    <div className="flex flex-wrap justify-center mt-4">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || '#'}
          dangerouslySetInnerHTML={{ __html: link.label }}
          className={`px-4 py-2 mx-1 my-1 rounded-md text-sm ${
            link.active ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
          } ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
          disabled={!link.url}
        />
      ))}
    </div>
);

// Komponen Filter Pills
const FilterPills = ({ kategori, activeFilter, onFilterChange }) => {
    const filters = ['Semua', ...kategori.map(k => k.nama_kategori)];
    return (
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeFilter === filter
                ? 'bg-green-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    );
};

export default function ProdukList({ produk, kategori, filters }) {
  const [modalState, setModalState] = useState({ isOpen: false, isEditing: false, model: null });
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || 'Semua');
  const { flash } = usePage().props;
  const { data, links, from } = produk;

  const openModal = (isEditing = false, model = null) => {
    setModalState({ isOpen: true, isEditing, model });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, isEditing: false, model: null });
  };

  const debouncedFilter = useCallback(
    debounce((nextValue, filterValue) => {
      const query = {};
      if (nextValue) query.search = nextValue;
      if (filterValue && filterValue !== 'Semua') query.kategori = filterValue;

      router.get(route('produk.index'), query, {
        preserveState: true,
        replace: true,
      });
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchValue(newSearch);
    debouncedFilter(newSearch, kategoriFilter);
  };

  const handleFilterChange = (newKategori) => {
    setKategoriFilter(newKategori);
    debouncedFilter(searchValue, newKategori);
  };

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: flash.success, timer: 2000, showConfirmButton: false });
    }
  }, [flash]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data produk yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('produk.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          }
        });
      }
    });
  };

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Produk</h2>
        <button onClick={() => openModal(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
            + Tambah Produk
        </button>
      </div>
    }>
      <Head title="Daftar Produk" />
      <div className="p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <FilterPills kategori={kategori} activeFilter={kategoriFilter} onFilterChange={handleFilterChange} />
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Cari nama produk..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Nama Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{from + index}</td>
                  <td className="px-4 py-2">
                    <img
                      src={item.gambar ? `/storage/${item.gambar}` : 'https://via.placeholder.com/80'}
                      alt={item.nama}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-4 py-2">{item.kategori || '-'}</td>
                  <td className="px-4 py-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}</td>
                  <td className="px-4 py-2">{item.stok}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(true, item)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition" title="Hapus">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination links={links} />

        <Modal show={modalState.isOpen} onClose={closeModal}>
          <ProdukForm
            isEditing={modalState.isEditing}
            model={modalState.model}
            kategori={kategori}
            onSubmit={closeModal}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </Mainbar>
  );
}