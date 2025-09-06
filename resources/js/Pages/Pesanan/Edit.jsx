import { Head, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Swal from 'sweetalert2';

export default function Edit({ pesanan, pelangganList, produkList }) {
  const { data, setData, put, processing, errors } = useForm({
    pelanggan_id: pesanan.pelanggan?.id || '',
    tanggal: pesanan.tanggal || '',
    status: pesanan.status || 'Diproses',
    items: pesanan.items.map(i => ({
      produk_id: i.produk_id,
      jumlah: i.jumlah,
    })),
  });

  const handleChangeItem = (index, field, value) => {
    const updatedItems = [...data.items];
    updatedItems[index][field] = value;
    setData('items', updatedItems);
  };

  const addItem = () => {
    setData('items', [...data.items, { produk_id: '', jumlah: 1 }]);
  };

  const removeItem = (index) => {
    setData('items', data.items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('pesanan.update', pesanan.id), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Pesanan berhasil diperbarui!',
        });
      },
    });
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Edit Pesanan</h2>}>
      <Head title="Edit Pesanan" />
      <div className="p-6 space-y-6 bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Pelanggan */}
          <div>
            <label className="block mb-1 font-medium">Pelanggan</label>
            <select
              value={data.pelanggan_id}
              onChange={(e) => setData('pelanggan_id', e.target.value)}
              className="w-full border-gray-300 rounded"
            >
              <option value="">-- Pilih Pelanggan --</option>
              {pelangganList.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
            {errors.pelanggan_id && <p className="text-red-600 text-sm">{errors.pelanggan_id}</p>}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block mb-1 font-medium">Tanggal</label>
            <input
              type="date"
              value={data.tanggal}
              onChange={(e) => setData('tanggal', e.target.value)}
              className="w-full border-gray-300 rounded"
            />
            {errors.tanggal && <p className="text-red-600 text-sm">{errors.tanggal}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              value={data.status}
              onChange={(e) => setData('status', e.target.value)}
              className="w-full border-gray-300 rounded"
            >
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
            {errors.status && <p className="text-red-600 text-sm">{errors.status}</p>}
          </div>

          {/* Produk */}
          <div>
            <label className="block mb-1 font-medium">Produk</label>
            {data.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <select
                  value={item.produk_id}
                  onChange={(e) => handleChangeItem(index, 'produk_id', e.target.value)}
                  className="w-2/3 border-gray-300 rounded"
                >
                  <option value="">-- Pilih Produk --</option>
                  {produkList.map(p => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.jumlah}
                  onChange={(e) => handleChangeItem(index, 'jumlah', e.target.value)}
                  className="w-1/4 border-gray-300 rounded"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-green-600 text-sm hover:underline">
              + Tambah Produk
            </button>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-2">
            <Link
              href={route('pesanan.index')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
