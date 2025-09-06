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

      <div className="p-6 max-w-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
          <div>
            <label className="block font-medium mb-1">Nama</label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => setData('nama', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.nama && <div className="text-red-600 text-sm">{errors.nama}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Telepon</label>
            <input
              type="text"
              value={data.telepon}
              onChange={(e) => setData('telepon', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.telepon && <div className="text-red-600 text-sm">{errors.telepon}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Alamat</label>
            <textarea
              value={data.alamat}
              onChange={(e) => setData('alamat', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.alamat && <div className="text-red-600 text-sm">{errors.alamat}</div>}
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="flex justify-end gap-2">
            <Link
              href={route('pelanggan.index')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
