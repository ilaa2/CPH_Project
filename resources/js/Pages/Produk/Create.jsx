import { Head, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';

export default function Create({ kategori = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    nama: '',
    id_kategori: '',
    deskripsi: '', // <-- Ditambahkan
    harga: '',
    stok: '',
    gambar: null,
    status: 'Aktif',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/produk');
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Tambah Produk</h2>}>
      <Head title="Tambah Produk" />

      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Form Tambah Produk */}
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="bg-white p-6 rounded-lg shadow-md space-y-6"
          >
            {/* Nama Produk */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Nama Produk</label>
              <input
                type="text"
                value={data.nama}
                onChange={(e) => setData('nama', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.nama && <div className="text-red-600 mt-1 text-sm">{errors.nama}</div>}
            </div>

            {/* Kategori */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Kategori</label>
              <select
                value={data.id_kategori}
                onChange={(e) => setData('id_kategori', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">-- Pilih Kategori --</option>
                {kategori.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.nama_kategori}
                  </option>
                ))}
              </select>
              {errors.id_kategori && <div className="text-red-600 mt-1 text-sm">{errors.id_kategori}</div>}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Deskripsi</label>
              <textarea
                value={data.deskripsi}
                onChange={(e) => setData('deskripsi', e.target.value)}
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.deskripsi && <div className="text-red-600 mt-1 text-sm">{errors.deskripsi}</div>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Harga */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Harga</label>
                <input
                  type="number"
                  value={data.harga}
                  onChange={(e) => setData('harga', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                {errors.harga && <div className="text-red-600 mt-1 text-sm">{errors.harga}</div>}
              </div>

              {/* Stok */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Stok</label>
                <input
                  type="number"
                  value={data.stok}
                  onChange={(e) => setData('stok', e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                {errors.stok && <div className="text-red-600 mt-1 text-sm">{errors.stok}</div>}
              </div>
            </div>

            {/* Gambar */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Gambar</label>
              <input
                type="file"
                onChange={(e) => setData('gambar', e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {errors.gambar && <div className="text-red-600 mt-1 text-sm">{errors.gambar}</div>}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Status</label>
              <select
                value={data.status}
                onChange={(e) => setData('status', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              {errors.status && <div className="text-red-600 mt-1 text-sm">{errors.status}</div>}
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Link
                href="/produk"
                className="w-full sm:w-auto text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold text-sm"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 font-semibold text-sm"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      </div>
    </Mainbar>
  );
}
