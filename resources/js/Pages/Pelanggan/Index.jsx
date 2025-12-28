import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';

// Komponen Form Pelanggan (untuk Tambah dan Edit)
const PelangganForm = ({ isEditing, model, onSubmit, onCancel }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    nama: model?.nama || '',
    email: model?.email || '',
    telepon: model?.telepon || '',
    alamat: model?.alamat || '',
    foto_profil: null,
    _method: isEditing ? 'PUT' : 'POST',
  });

  useEffect(() => {
    setData({
      nama: model?.nama || '',
      email: model?.email || '',
      telepon: model?.telepon || '',
      alamat: model?.alamat || '',
      foto_profil: null,
      _method: isEditing ? 'PUT' : 'POST',
    });
  }, [model, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing ? route('pelanggan.update', model.id) : route('pelanggan.store');
    post(url, {
      onSuccess: () => {
        reset();
        onSubmit();
      },
      forceFormData: true, // Penting untuk upload file
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
      </h2>
      
      {/* Nama */}
      <div>
        <label className="block font-medium text-sm text-gray-700">Nama</label>
        <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
        <InputError message={errors.nama} className="mt-2" />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium text-sm text-gray-700">Email</label>
        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
        <InputError message={errors.email} className="mt-2" />
      </div>

      {/* Telepon */}
      <div>
        <label className="block font-medium text-sm text-gray-700">Telepon</label>
        <input type="text" value={data.telepon} onChange={e => setData('telepon', e.target.value)} className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full" />
        <InputError message={errors.telepon} className="mt-2" />
      </div>

      {/* Alamat */}
      <div>
        <label className="block font-medium text-sm text-gray-700">Alamat</label>
        <textarea value={data.alamat} onChange={e => setData('alamat', e.target.value)} rows="3" className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm mt-1 block w-full"></textarea>
        <InputError message={errors.alamat} className="mt-2" />
      </div>

      {/* Foto Profil */}
      <div>
        <label className="block font-medium text-sm text-gray-700">Foto Profil {isEditing && '(Baru, opsional)'}</label>
        <input type="file" onChange={e => setData('foto_profil', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        <InputError message={errors.foto_profil} className="mt-2" />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Batal</button>
        <button type="submit" disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50">
          {isEditing ? 'Simpan Perubahan' : 'Simpan'}
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

export default function PelangganList({ pelanggan, filters }) {
  const { flash } = usePage().props;
  const { data, links, from } = pelanggan;
  const [modalState, setModalState] = useState({ isOpen: false, isEditing: false, model: null });
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const openModal = (isEditing = false, model = null) => {
    setModalState({ isOpen: true, isEditing, model });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, isEditing: false, model: null });
  };

  const debouncedSearch = useCallback(
    debounce((nextValue) => {
      router.get(route('pelanggan.index'), { search: nextValue }, {
        preserveState: true,
        replace: true,
      });
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchValue(newSearch);
    debouncedSearch(newSearch);
  };

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: flash.success, timer: 2000, showConfirmButton: false });
    }
  }, [flash]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data pelanggan akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('pelanggan.destroy', id));
      }
    });
  };

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Pelanggan</h2>
        <button onClick={() => openModal(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
          + Tambah Pelanggan
        </button>
      </div>
    }>
      <Head title="Daftar Pelanggan" />

      <div className="p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Cari nama pelanggan..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telepon</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{from + index}</td>
                  <td className="px-4 py-2">
                    <img
                      src={item.foto_profil ? `/storage/${item.foto_profil}` : `https://ui-avatars.com/api/?name=${item.nama}&background=e8f5e9&color=166534`}
                      alt={item.nama}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-4 py-2">{item.email || '-'}</td>
                  <td className="px-4 py-2">{item.telepon || '-'}</td>
                  <td className="px-4 py-2 truncate max-w-xs">{item.alamat || '-'}</td>
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
          <PelangganForm
            isEditing={modalState.isEditing}
            model={modalState.model}
            onSubmit={closeModal}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </Mainbar>
  );
}
