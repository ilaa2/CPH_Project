import { useForm, Head, Link, router } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";

export default function ProdukEdit({ produk, kategori }) {
  const { data, setData, put, processing, errors } = useForm({
    nama: produk.nama || '',
    id_kategori: produk.id_kategori || '',
    deskripsi: produk.deskripsi || '', // <-- Ditambahkan
    harga: produk.harga || '',
    stok: produk.stok || '',
    gambar: null,
    status: produk.status || 'Aktif',
  });

  function handleSubmit(e) {
    e.preventDefault();
    // Karena 'deskripsi' sudah ada di state 'data',
    // Inertia akan otomatis mengirimkannya saat update.
    // Namun, kita harus menggunakan metode POST karena form mengandung file.
    // Laravel akan menanganinya sebagai PUT/PATCH jika ada _method.
    router.post(`/produk/${produk.id}`, {
      _method: 'put',
      ...data,
    });
  }

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Edit Produk
      </h2>
    }>
      <Head title="Edit Produk" />

      <div className="p-4 sm:p-6 flex justify-center">
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-4 sm:space-y-6 bg-white rounded shadow-md p-4 sm:p-6 w-full max-w-full sm:max-w-xl"
        >
          {/* Nama Produk */}
          <div>
            <label className="block font-medium mb-1">Nama Produk</label>
            <input
              type="text"
              value={data.nama}
              onChange={e => setData('nama', e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            {errors.nama && <p className="text-red-600 text-sm mt-1">{errors.nama}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block font-medium mb-1">Kategori</label>
            <select
              value={data.id_kategori}
              onChange={e => setData('id_kategori', e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategori.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
              ))}
            </select>
            {errors.id_kategori && <p className="text-red-600 text-sm mt-1">{errors.id_kategori}</p>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-medium mb-1">Deskripsi</label>
            <textarea
              value={data.deskripsi}
              onChange={e => setData('deskripsi', e.target.value)}
              rows="4"
              className="border px-3 py-2 rounded w-full"
            />
            {errors.deskripsi && <p className="text-red-600 text-sm mt-1">{errors.deskripsi}</p>}
          </div>

          {/* Harga */}
          <div>
            <label className="block font-medium mb-1">Harga</label>
            <input
              type="number"
              value={data.harga}
              onChange={e => setData('harga', e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            {errors.harga && <p className="text-red-600 text-sm mt-1">{errors.harga}</p>}
          </div>

          {/* Stok */}
          <div>
            <label className="block font-medium mb-1">Stok</label>
            <input
              type="number"
              value={data.stok}
              onChange={e => setData('stok', e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
            {errors.stok && <p className="text-red-600 text-sm mt-1">{errors.stok}</p>}
          </div>

          {/* Gambar Baru */}
          <div>
            <label className="block font-medium mb-1">Gambar Baru (opsional)</label>
            <input
              type="file"
              onChange={e => setData('gambar', e.target.files[0])}
              className="w-full"
            />
            {errors.gambar && <p className="text-red-600 text-sm mt-1">{errors.gambar}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              value={data.status}
              onChange={e => setData('status', e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
          </div>

          {/* Tombol Batal & Simpan */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Link
              href={route('produk.index')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
