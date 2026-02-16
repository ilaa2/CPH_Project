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

  const [preview, setPreview] = useState(model?.gambar ? `/storage/${model.gambar}` : null);

  useEffect(() => {
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
    setPreview(model?.gambar ? `/storage/${model.gambar}` : null);
  }, [model, isEditing]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('gambar', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing ? route('admin.produk.update', model.id) : route('admin.produk.store');
    post(url, {
      onSuccess: () => {
        reset();
        onSubmit();
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">

      {/* Header Modal - Sticky Top */}
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          {isEditing && model && (
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="font-semibold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">{model.nama}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">{model.kategori || 'Tanpa Kategori'}</span>
              <span className="text-gray-300">•</span>
              <span className={`font-semibold ${model.status === 'Aktif' ? 'text-green-600' : 'text-red-600'}`}>
                {model.status}
              </span>
            </div>
          )}
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* KOLOM KIRI (7/12) - Data Utama */}
            <div className="lg:col-span-7 space-y-5">

              {/* Nama Produk */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={data.nama}
                  onChange={e => setData('nama', e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm py-2"
                  placeholder="Contoh: Bayam Hidroponik"
                  required
                />
                <InputError message={errors.nama} className="mt-1" />
              </div>

              {/* Kategori */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                <select
                  value={data.id_kategori}
                  onChange={e => setData('id_kategori', e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm py-2"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategori.map(cat => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
                </select>
                <InputError message={errors.id_kategori} className="mt-1" />
              </div>

              {/* Harga & Stok (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm text-gray-700 mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={data.harga}
                      onChange={e => setData('harga', e.target.value)}
                      className="w-full pl-9 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm py-2 font-medium"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-sm text-gray-700 mb-1">Stok <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={data.stok}
                    onChange={e => setData('stok', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm py-2"
                    placeholder="0"
                    required
                  />
                  {data.stok !== '' && data.stok < 5 && (
                    <span className="text-xs text-amber-600 font-bold mt-1 block">⚠️ Stok menipis!</span>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2">Status</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 border rounded-lg transition select-none ${data.status === 'Aktif' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500 ring-opacity-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" value="Aktif" checked={data.status === 'Aktif'} onChange={e => setData('status', e.target.value)} className="sr-only" />
                    <span className="w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-green-500 shrink-0 block ring-2 ring-white"></span>
                    <span className="text-sm font-medium">Aktif</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 border rounded-lg transition select-none ${data.status === 'Nonaktif' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500 ring-opacity-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" value="Nonaktif" checked={data.status === 'Nonaktif'} onChange={e => setData('status', e.target.value)} className="sr-only" />
                    <span className="w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-red-500 shrink-0 block ring-2 ring-white"></span>
                    <span className="text-sm font-medium">Nonaktif</span>
                  </label>
                </div>
              </div>

            </div>

            {/* KOLOM KANAN (5/12) - Visual & Info */}
            <div className="lg:col-span-5 space-y-5 border-l pl-0 lg:pl-6 border-gray-100">

              {/* Foto Produk Compact */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2">Foto Produk</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 text-center">

                  {preview ? (
                    <div className="relative inline-block group">
                      <img src={preview} alt="Preview" className="h-28 w-auto max-w-full rounded-lg object-cover shadow-sm mx-auto" />
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setData('gambar', null); }}
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow border hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400 py-4">
                      <span className="text-xs">Belum ada foto</span>
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="cursor-pointer inline-block px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                      <span>{data.gambar ? 'Ganti Foto' : 'Upload Foto'}</span>
                      <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Deskripsi Short */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={data.deskripsi}
                  onChange={e => setData('deskripsi', e.target.value)}
                  rows="4"
                  className="w-full border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                  placeholder="Deskripsi produk..."
                ></textarea>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions - Sticky Bottom */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition text-sm">
            Batal
          </button>
          <button
            type="submit"
            disabled={processing}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 font-bold transition text-sm disabled:opacity-50"
          >
            {isEditing ? 'Simpan Perubahan' : 'Simpan Produk'}
          </button>
        </div>

      </form>
    </div >
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
        className={`px-4 py-2 mx-1 my-1 rounded-md text-sm ${link.active ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
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
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeFilter === filter
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

      router.get(route('admin.produk.index'), query, {
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
        // FIX 403 & 405: Use PURE POST method. Do NOT use _method='delete' or it will be routed as DELETE.
        router.post(route('admin.produk.delete', id), {}, {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          }
        });
      }
    });
  };

  return (
    <Mainbar header={
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Produk</h2>
        <button onClick={() => openModal(false)} className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
          + Tambah Produk
        </button>
      </div>
    }>
      <Head title="Daftar Produk" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <FilterPills kategori={kategori} activeFilter={kategoriFilter} onFilterChange={handleFilterChange} />
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Cari nama produk..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
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
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900 min-w-[150px]">{item.nama}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.kategori || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className={item.stok < 5 ? 'text-red-600 font-bold' : ''}>
                        {item.stok}
                      </span>
                      {item.stok < 5 && (
                        <span className="text-[10px] text-red-500 font-semibold bg-red-100 px-2 py-0.5 rounded-full w-max mt-1 whitespace-nowrap">
                          Stok Menipis!
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => router.post(route('admin.produk.duplicate', item.id))} className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-full transition" title="Duplicate">
                        📋
                      </button>
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

        <Modal show={modalState.isOpen} onClose={closeModal} maxWidth="5xl">
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