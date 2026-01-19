import { Head, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Swal from 'sweetalert2';

export default function CreatePesanan({ pelangganList, produkList }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    pelanggan_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    status: 'Diproses',
    metode_pengiriman: 'pickup',
    alamat_pengiriman: '',
    ekspedisi: '',
    estimasi: '',
    biaya_pengiriman: 0,
    items: [{ produk_id: '', jumlah: 1 }]
  });

  const handleChangeItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = field === 'jumlah' ? parseInt(value) || 1 : value;
    setData('items', newItems);
  };

  const addItem = () => {
    setData('items', [...data.items, { produk_id: '', jumlah: 1 }]);
  };

  const removeItem = (index) => {
    setData('items', data.items.filter((_, i) => i !== index));
  };

  // Parse estimasi to check if > 5 days
  const getMaxDays = (est) => {
    if (!est) return 0;
    const matches = est.match(/\d+/g);
    return matches ? Math.max(...matches.map(Number)) : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[DEBUG] Submitting order:', data);

    post(route('admin.pesanan.store'), {
      onSuccess: () => {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pesanan berhasil disimpan!' });
        reset();
      },
      onError: (errs) => {
        console.error('[DEBUG] Validation errors:', errs);
        const msg = errs.message || Object.values(errs).flat().join(', ') || 'Terjadi kesalahan.';
        Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
      }
    });
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Tambah Pesanan</h2>}>
      <Head title="Tambah Pesanan" />

      <div className="p-6 bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ROW 1: Pelanggan & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Pelanggan <span className="text-red-500">*</span></label>
              <select
                value={data.pelanggan_id}
                onChange={(e) => setData('pelanggan_id', e.target.value)}
                className="w-full border-gray-300 rounded"
              >
                <option value="">-- Pilih Pelanggan --</option>
                {pelangganList.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
              {errors.pelanggan_id && <p className="text-sm text-red-600 mt-1">{errors.pelanggan_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Pesanan <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={data.tanggal}
                onChange={(e) => setData('tanggal', e.target.value)}
                className="w-full border-gray-300 rounded"
              />
              {errors.tanggal && <p className="text-sm text-red-600 mt-1">{errors.tanggal}</p>}
            </div>
          </div>

          {/* ROW 2: Metode Pengiriman */}
          <div>
            <label className="block text-sm font-medium mb-2">Metode Pengiriman <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'pickup', label: '🏪 Ambil di Toko', desc: 'Pelanggan ambil langsung' },
                { value: 'local', label: '🛵 Kurir Lokal', desc: 'Pengiriman area Duri' },
                { value: 'shipping', label: '📦 Ekspedisi', desc: 'JNE/J&T/Pos dll' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${data.metode_pengiriman === opt.value
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="metode_pengiriman"
                    value={opt.value}
                    checked={data.metode_pengiriman === opt.value}
                    onChange={(e) => setData('metode_pengiriman', e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-lg font-semibold">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </label>
              ))}
            </div>
            {errors.metode_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.metode_pengiriman}</p>}
          </div>

          {/* DYNAMIC FIELDS based on method */}
          {data.metode_pengiriman !== 'pickup' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Pengiriman <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="2"
                  value={data.alamat_pengiriman}
                  onChange={(e) => setData('alamat_pengiriman', e.target.value)}
                  placeholder={data.metode_pengiriman === 'local' ? 'Contoh: Jl. Sudirman No. 10, Duri' : 'Alamat lengkap (Jl, Kec, Kota, Provinsi)'}
                  className="w-full border-gray-300 rounded"
                />
                {errors.alamat_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.alamat_pengiriman}</p>}
              </div>

              {/* Ekspedisi fields (only for 'shipping') */}
              {data.metode_pengiriman === 'shipping' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Ekspedisi <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={data.ekspedisi}
                      onChange={(e) => setData('ekspedisi', e.target.value)}
                      placeholder="JNE REG / J&T Express / Pos Kilat"
                      className="w-full border-gray-300 rounded"
                    />
                    {errors.ekspedisi && <p className="text-sm text-red-600 mt-1">{errors.ekspedisi}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimasi Pengiriman</label>
                    <input
                      type="text"
                      value={data.estimasi}
                      onChange={(e) => setData('estimasi', e.target.value)}
                      placeholder="Contoh: 2-3 Hari"
                      className="w-full border-gray-300 rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Disarankan maksimal 5 hari agar produk tetap segar.</p>
                    {getMaxDays(data.estimasi) > 5 && (
                      <p className="text-xs text-yellow-600 font-bold mt-1">⚠️ Estimasi melebihi rekomendasi kesegaran produk!</p>
                    )}
                    {errors.estimasi && <p className="text-sm text-red-600 mt-1">{errors.estimasi}</p>}
                  </div>
                </div>
              )}

              {/* Biaya Pengiriman */}
              <div>
                <label className="block text-sm font-medium mb-1">Biaya Pengiriman (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={data.biaya_pengiriman}
                  onChange={(e) => setData('biaya_pengiriman', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full border-gray-300 rounded"
                />
                {errors.biaya_pengiriman && <p className="text-sm text-red-600 mt-1">{errors.biaya_pengiriman}</p>}
              </div>
            </div>
          )}

          {/* Pickup Info */}
          {data.metode_pengiriman === 'pickup' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Info:</strong> Pesanan akan diambil langsung oleh pelanggan. Biaya pengiriman otomatis Rp 0.
              </p>
            </div>
          )}

          {/* PRODUK */}
          <div>
            <label className="block text-sm font-medium mb-2">Detail Produk <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {data.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.produk_id}
                    onChange={(e) => handleChangeItem(index, 'produk_id', e.target.value)}
                    className="flex-1 border-gray-300 rounded"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {produkList.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.jumlah}
                    onChange={(e) => handleChangeItem(index, 'jumlah', e.target.value)}
                    className="w-20 border-gray-300 rounded"
                  />
                  {data.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-green-600 text-sm hover:underline">+ Tambah Produk</button>
            {errors.items && <p className="text-sm text-red-600 mt-1">{errors.items}</p>}
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href={route('admin.pesanan.index')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Menyimpan...' : 'Simpan Pesanan'}
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
