import { Head, useForm, Link } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";

export default function CreatePelanggan() {
  const { data, setData, post, processing, errors } = useForm({
    nama: '',
    email: '',
    telepon: '',
    alamat: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('pelanggan.store'));
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Tambah Pelanggan</h2>}>
      <Head title="Tambah Pelanggan" />

      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
            {/* Nama */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Nama</label>
              <input
                type="text"
                value={data.nama}
                onChange={(e) => setData('nama', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.nama && <div className="text-red-600 text-sm mt-1">{errors.nama}</div>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
            </div>

            {/* Telepon */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Telepon</label>
              <input
                type="text"
                value={data.telepon}
                onChange={(e) => setData('telepon', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.telepon && <div className="text-red-600 text-sm mt-1">{errors.telepon}</div>}
            </div>

            {/* Alamat */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Alamat</label>
              <textarea
                value={data.alamat}
                onChange={(e) => setData('alamat', e.target.value)}
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {errors.alamat && <div className="text-red-600 text-sm mt-1">{errors.alamat}</div>}
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Link
                href={route('pelanggan.index')}
                className="w-full sm:w-auto text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold text-sm"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 font-semibold text-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </Mainbar>
  );
}
