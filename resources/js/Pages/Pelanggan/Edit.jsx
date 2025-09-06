import { Head, useForm, Link } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";

export default function Edit({ pelanggan }) {
  const { data, setData, put, processing, errors } = useForm({
    nama: pelanggan.nama || '',
    email: pelanggan.email || '',
    telepon: pelanggan.telepon || '',
    alamat: pelanggan.alamat || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    put(route('pelanggan.update', pelanggan.id));
  }

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Edit Pelanggan</h2>}>
      <Head title="Edit Pelanggan" />

      <div className="p-6 max-w-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
          <div>
            <label className="block font-medium mb-1">Nama</label>
            <input
              type="text"
              value={data.nama}
              onChange={e => setData('nama', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.nama && <div className="text-red-600 text-sm">{errors.nama}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={e => setData('email', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Telepon</label>
            <input
              type="text"
              value={data.telepon}
              onChange={e => setData('telepon', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.telepon && <div className="text-red-600 text-sm">{errors.telepon}</div>}
          </div>

          <div>
            <label className="block font-medium mb-1">Alamat</label>
            <textarea
              value={data.alamat}
              onChange={e => setData('alamat', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.alamat && <div className="text-red-600 text-sm">{errors.alamat}</div>}
          </div>

          {/* Tombol Update dan Batal */}
          <div className="flex justify-end gap-2">
            <Link
              href={route('pelanggan.index')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={processing}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
