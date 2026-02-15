import { Head, useForm, Link } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";

export default function Edit({ pelanggan }) {
  const { data, setData, put, processing, errors } = useForm({
    name: pelanggan.name || '',
    email: pelanggan.email || '',
    phone: pelanggan.phone || '',
    alamat: pelanggan.alamat || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    put(route('admin.pelanggan.update', pelanggan.id));
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
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
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
              value={data.phone}
              onChange={e => setData('phone', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.phone && <div className="text-red-600 text-sm">{errors.phone}</div>}
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
              href={route('admin.pelanggan.index')}
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
