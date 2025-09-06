import { Head, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState } from 'react';
import Swal from 'sweetalert2'; // pastikan sudah install sweetalert2

export default function CreatePesanan({ pelangganList, produkList }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    pelanggan_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    items: [{ produk_id: '', jumlah: 1 }]
  });

  const handleChangeItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const addItem = () => {
    setData('items', [...data.items, { produk_id: '', jumlah: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('pesanan.store'), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Pesanan berhasil disimpan!',
        });
        reset(); // reset form setelah sukses
      },
      onError: (errors) => {
  Swal.fire({
    icon: 'error',
    title: 'Gagal',
    text: errors.message ?? 'Terjadi kesalahan saat menyimpan pesanan.',
  });
}

    });
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Tambah Pesanan</h2>}>
      <Head title="Tambah Pesanan" />

      <div className="p-6 bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pelanggan */}
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Pelanggan</label>
            <select
              value={data.pelanggan_id}
              onChange={(e) => setData('pelanggan_id', e.target.value)}
              className="w-full border-gray-300 rounded"
            >
              <option value="">-- Pilih --</option>
              {pelangganList.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
            {errors.pelanggan_id && <p className="text-sm text-red-600">{errors.pelanggan_id}</p>}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Pesanan</label>
            <input
              type="date"
              value={data.tanggal}
              onChange={(e) => setData('tanggal', e.target.value)}
              className="w-full border-gray-300 rounded"
            />
            {errors.tanggal && <p className="text-sm text-red-600">{errors.tanggal}</p>}
          </div>

          {/* Produk & Jumlah */}
          <div>
            <label className="block text-sm font-medium mb-1">Detail Produk</label>
            {data.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <select
                  value={item.produk_id}
                  onChange={(e) => handleChangeItem(index, 'produk_id', e.target.value)}
                  className="w-2/3 border-gray-300 rounded"
                >
                  <option value="">-- Pilih Produk --</option>
                  {produkList.map((p) => (
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
                  <button type="button" onClick={() => removeItem(index)} className="text-red-600 text-sm">
                    Hapus
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-green-600 text-sm hover:underline">
              + Tambah Produk
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Link href={route('pesanan.index')} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2">
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
