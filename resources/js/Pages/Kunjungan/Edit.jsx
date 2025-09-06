import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useEffect } from 'react';

export default function EditKunjungan() {
  const { kunjungan, pelanggan: pelangganList, tipe: tipeList } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    pelanggan_id: kunjungan.pelanggan_id || '',
    tipe_id: kunjungan.tipe_id || '',
    judul: kunjungan.judul || '',
    deskripsi: kunjungan.deskripsi || '',
    tanggal: kunjungan.tanggal || '',
    jam: kunjungan.jam || '',
    jumlah_pengunjung: kunjungan.jumlah_pengunjung || '',
    total_biaya: kunjungan.total_biaya || '',
    status: kunjungan.status || 'dijadwalkan',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('kunjungan.update', kunjungan.id), {
      onSuccess: () => router.visit('/kunjungan/jadwal'),
    });
  };

  useEffect(() => {
    const jumlah = parseInt(data.jumlah_pengunjung);
    if (!isNaN(jumlah)) {
      setData('total_biaya', jumlah * 15000);
    } else {
      setData('total_biaya', '');
    }
  }, [data.jumlah_pengunjung]);

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Edit Kunjungan</h2>}>
      <Head title="Edit Kunjungan" />

      <div className="p-6 max-w-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
          {/* Pelanggan */}
          <div>
            <label className="block mb-1 font-semibold">Pelanggan</label>
            <select
              value={data.pelanggan_id}
              onChange={(e) => setData('pelanggan_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Pilih Pelanggan --</option>
              {pelangganList.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
            {errors.pelanggan_id && <div className="text-red-600 text-sm">{errors.pelanggan_id}</div>}
          </div>

          {/* Tipe Kunjungan */}
          <div>
            <label className="block mb-1 font-semibold">Tipe Kunjungan</label>
            <select
              value={data.tipe_id}
              onChange={(e) => setData('tipe_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Pilih Tipe --</option>
              {tipeList.map(t => (
                <option key={t.id} value={t.id}>{t.nama}</option>
              ))}
            </select>
            {errors.tipe_id && <div className="text-red-600 text-sm">{errors.tipe_id}</div>}
          </div>

          {/* Judul */}
          <div>
            <label className="block mb-1 font-semibold">Judul</label>
            <input
              type="text"
              value={data.judul}
              onChange={(e) => setData('judul', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.judul && <div className="text-red-600 text-sm">{errors.judul}</div>}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block mb-1 font-semibold">Deskripsi</label>
            <textarea
              value={data.deskripsi}
              onChange={(e) => setData('deskripsi', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.deskripsi && <div className="text-red-600 text-sm">{errors.deskripsi}</div>}
          </div>

          {/* Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Tanggal</label>
              <input
                type="date"
                value={data.tanggal}
                onChange={(e) => setData('tanggal', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.tanggal && <div className="text-red-600 text-sm">{errors.tanggal}</div>}
            </div>
            <div>
              <label className="block mb-1 font-semibold">Jam</label>
              <input
                type="time"
                value={data.jam}
                onChange={(e) => setData('jam', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.jam && <div className="text-red-600 text-sm">{errors.jam}</div>}
            </div>
          </div>

          {/* Jumlah Pengunjung */}
          <div>
            <label className="block mb-1 font-semibold">Jumlah Pengunjung</label>
            <input
              type="number"
              min={1}
              value={data.jumlah_pengunjung}
              onChange={(e) => setData('jumlah_pengunjung', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.jumlah_pengunjung && <div className="text-red-600 text-sm">{errors.jumlah_pengunjung}</div>}
          </div>

          {/* Total Biaya */}
          <div>
            <label className="block mb-1 font-semibold">Total Biaya (Rp)</label>
            <input
              type="text"
              value={data.total_biaya.toLocaleString('id-ID')}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-4">
            <Link
              href={route('kunjungan.jadwal')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Perbarui
            </button>
          </div>
        </form>
      </div>
    </Mainbar>
  );
}
