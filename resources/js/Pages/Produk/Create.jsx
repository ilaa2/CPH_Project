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

      <div className="p-4 sm:p-6 flex justify-center">
        {/* Form Tambah Produk */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-white p-4 sm:p-6 rounded shadow w-full max-w-full sm:max-w-2xl space-y-4 sm:space-y-6"
        >
          {/* Nama Produk */}
          <div>
            <label className="block mb-1 font-semibold">Nama Produk</label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => setData('nama', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.nama && <div className="text-red-600 mt-1">{errors.nama}</div>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block mb-1 font-semibold">Kategori</label>
            <select
              value={data.id_kategori}
              onChange={(e) => setData('id_kategori', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategori.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama_kategori}
                </option>
              ))}
            </select>
            {errors.id_kategori && <div className="text-red-600 mt-1">{errors.id_kategori}</div>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block mb-1 font-semibold">Deskripsi</label>
            <textarea
              value={data.deskripsi}
              onChange={(e) => setData('deskripsi', e.target.value)}
              rows="4"
              className="w-full border rounded px-3 py-2"
            />
            {errors.deskripsi && <div className="text-red-600 mt-1">{errors.deskripsi}</div>}
          </div>

          {/* Harga */}
          <div>
            <label className="block mb-1 font-semibold">Harga</label>
            <input
              type="number"
              value={data.harga}
              onChange={(e) => setData('harga', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.harga && <div className="text-red-600 mt-1">{errors.harga}</div>}
          </div>

          {/* Stok */}
          <div>
            <label className="block mb-1 font-semibold">Stok</label>
            <input
              type="number"
              value={data.stok}
              onChange={(e) => setData('stok', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.stok && <div className="text-red-600 mt-1">{errors.stok}</div>}
          </div>

          {/* Gambar */}
          <div>
            <label className="block mb-1 font-semibold">Gambar</label>
            <input
              type="file"
              onChange={(e) => setData('gambar', e.target.files[0])}
              className="w-full"
            />
            {errors.gambar && <div className="text-red-600 mt-1">{errors.gambar}</div>}
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <select
              value={data.status}
              onChange={(e) => setData('status', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            {errors.status && <div className="text-red-600 mt-1">{errors.status}</div>}
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Link
              href="/produk"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
