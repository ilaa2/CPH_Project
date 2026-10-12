import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Bar/Sidebar';
import Swal from 'sweetalert2';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiCheck, FiX,
  FiCoffee, FiFolderPlus, FiImage
} from 'react-icons/fi';

export default function FoodIndex({ foods = { data: [] }, categories = [], filters = {} }) {
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [search, setSearch] = useState(filters.search || '');

  // Form for Food CRUD
  const { data: foodData, setData: setFoodData, post: postFood, processing: processingFood, errors: foodErrors, reset: resetFood } = useForm({
    category_id: '',
    nama: '',
    harga: '',
    deskripsi: '',
    status: 'Aktif',
    gambar: null,
  });

  // Form for Category
  const { data: catData, setData: setCatData, post: postCat, processing: processingCat, errors: catErrors, reset: resetCat } = useForm({
    nama_kategori: '',
    deskripsi: '',
  });

  const handleOpenAddFood = () => {
    setEditingFood(null);
    resetFood();
    if (categories.length > 0) setFoodData('category_id', categories[0].id.toString());
    setShowFoodModal(true);
  };

  const handleOpenEditFood = (food) => {
    setEditingFood(food);
    setFoodData({
      category_id: food.category_id.toString(),
      nama: food.nama,
      harga: food.harga.toString(),
      deskripsi: food.deskripsi || '',
      status: food.status,
      gambar: null,
    });
    setShowFoodModal(true);
  };

  const handleSubmitFood = (e) => {
    e.preventDefault();

    if (editingFood) {
      router.post(route('admin.pos.foods.update', editingFood.id), {
        ...foodData,
        _method: 'POST',
      }, {
        onSuccess: () => {
          setShowFoodModal(false);
          resetFood();
          Swal.fire({ icon: 'success', title: 'Menu Makanan Diperbarui!', timer: 1500, showConfirmButton: false });
        }
      });
    } else {
      postFood(route('admin.pos.foods.store'), {
        onSuccess: () => {
          setShowFoodModal(false);
          resetFood();
          Swal.fire({ icon: 'success', title: 'Menu Makanan Berhasil Ditambahkan!', timer: 1500, showConfirmButton: false });
        }
      });
    }
  };

  const handleDeleteFood = (id, nama) => {
    Swal.fire({
      title: `Hapus Menu "${nama}"?`,
      text: 'Menu ini akan dihapus (soft delete) dari sistem POS.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.pos.foods.delete', id), {}, {
          onSuccess: () => {
            Swal.fire({ icon: 'success', title: 'Menu Dihapus!', timer: 1500, showConfirmButton: false });
          }
        });
      }
    });
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    postCat(route('admin.pos.food-categories.store'), {
      onSuccess: () => {
        setShowCategoryModal(false);
        resetCat();
        Swal.fire({ icon: 'success', title: 'Kategori Berhasil Ditambahkan!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.pos.foods.index'), { search }, { preserveState: true });
  };

  return (
    <Sidebar header={
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiCoffee className="text-green-600" /> Kelola Menu Makanan POS
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiFolderPlus size={15} /> + Tambah Kategori
          </button>
          <button
            onClick={handleOpenAddFood}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <FiPlus size={16} /> + Tambah Menu Makanan
          </button>
        </div>
      </div>
    }>
      <Head title="Kelola Menu Makanan - Central Palantea" />

      <div className="space-y-6">

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama menu makanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-green-500"
            />
          </form>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Total Kategori: <strong>{categories.length}</strong></span> |
            <span>Total Menu: <strong>{foods.total || foods.data.length}</strong></span>
          </div>
        </div>

        {/* FOOD ITEMS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Gambar</th>
                  <th className="p-3">Nama Menu</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {foods.data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      Belum ada data menu makanan. Klik tombol "+ Tambah Menu Makanan" di atas.
                    </td>
                  </tr>
                ) : (
                  foods.data.map((food, idx) => (
                    <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-gray-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                          {food.gambar ? (
                            <img
                              src={food.gambar.startsWith('/') || food.gambar.startsWith('http') ? food.gambar : `/storage/${food.gambar}`}
                              alt={food.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiImage className="text-gray-400" size={18} />
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        {food.nama}
                        {food.deskripsi && <p className="text-[10px] text-gray-400 font-normal line-clamp-1">{food.deskripsi}</p>}
                      </td>
                      <td className="p-3 font-semibold text-gray-600">
                        {food.category?.nama_kategori || 'Uncategorized'}
                      </td>
                      <td className="p-3 font-extrabold text-green-700">
                        Rp {Number(food.harga).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${food.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {food.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditFood(food)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food.id, food.nama)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL FOOD FORM */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-800">
                {editingFood ? 'Edit Menu Makanan' : 'Tambah Menu Makanan Baru'}
              </h3>
              <button onClick={() => setShowFoodModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitFood} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Kategori Menu:</label>
                <select
                  value={foodData.category_id}
                  onChange={(e) => setFoodData('category_id', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nama Menu:</label>
                <input
                  type="text"
                  value={foodData.nama}
                  onChange={(e) => setFoodData('nama', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                  placeholder="Contoh: Nasi Goreng Spesial"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Harga (Rp):</label>
                <input
                  type="number"
                  value={foodData.harga}
                  onChange={(e) => setFoodData('harga', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                  placeholder="Contoh: 18000"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Deskripsi Ringkas:</label>
                <textarea
                  value={foodData.deskripsi}
                  onChange={(e) => setFoodData('deskripsi', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                  rows={2}
                  placeholder="Keterangan bahan/rasa..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Status Ketersediaan:</label>
                <select
                  value={foodData.status}
                  onChange={(e) => setFoodData('status', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                >
                  <option value="Aktif">Aktif (Dapat Dipesan)</option>
                  <option value="Tidak Aktif">Tidak Aktif (Habis)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Foto Makanan (Opsional):</label>
                <input
                  type="file"
                  onChange={(e) => setFoodData('gambar', e.target.files[0])}
                  className="w-full text-xs p-1.5 border rounded-lg"
                  accept="image/*"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={processingFood}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
                >
                  {processingFood ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORY FORM */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-800">Tambah Kategori Baru</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nama Kategori:</label>
                <input
                  type="text"
                  value={catData.nama_kategori}
                  onChange={(e) => setCatData('nama_kategori', e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-green-500"
                  placeholder="Contoh: Desserts"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={processingCat}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
              >
                {processingCat ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
