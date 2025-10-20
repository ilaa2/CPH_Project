import { Head, Link, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { FiArrowLeft } from 'react-icons/fi';
import { useState } from 'react';

export default function RiwayatKunjungan() {
  const { props } = usePage();
  const riwayat = props.riwayat || [];
  const [selected, setSelected] = useState(null);

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Riwayat Kunjungan
      </h2>
    }>
      <Head title="Riwayat Kunjungan" />

      <div className="p-4 space-y-6">
        {/* Tombol kembali */}


        <p className="text-gray-600 text-sm">
          Berikut adalah riwayat kunjungan yang telah selesai dilakukan.
        </p>

        {/* Tabel */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-green-100 text-green-800 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama Pelanggan</th>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? riwayat.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.pelanggan?.nama || '-'}</td>
                  <td className="px-4 py-2">{item.judul}</td>
                  <td className="px-4 py-2">{item.tipe?.nama_tipe || '-'}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2 capitalize">{item.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => setSelected(item)}
                      className="text-gray-600 hover:text-blue-600"
                      title="Lihat Detail"
                    >
                      ℹ️
                    </button>
                    {item.status === 'Selesai' && !item.ulasan && (
                      <Link
                        href={route('customer.kunjungan.ulasan.create', item.id)}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Beri Ulasan
                      </Link>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">Belum ada riwayat kunjungan selesai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Detail */}
{selected && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
      <h2 className="text-xl font-semibold text-green-700 mb-4">
        Detail Kunjungan
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border rounded">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Nama Pelanggan</td>
              <td className="px-4 py-2">{selected.pelanggan?.nama}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Alamat</td>
              <td className="px-4 py-2">{selected.pelanggan?.alamat}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Judul</td>
              <td className="px-4 py-2">{selected.judul}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Tipe</td>
              <td className="px-4 py-2">{selected.tipe?.nama_tipe || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Deskripsi</td>
              <td className="px-4 py-2">{selected.deskripsi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Tanggal</td>
              <td className="px-4 py-2">{selected.tanggal}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Jam</td>
              <td className="px-4 py-2">{selected.jam}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Jumlah Pengunjung</td>
              <td className="px-4 py-2">{selected.jumlah_pengunjung}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Total Biaya</td>
              <td className="px-4 py-2">Rp {selected.total_biaya.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">Status</td>
              <td className="px-4 py-2 capitalize">{selected.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={() => setSelected(null)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </Mainbar>
  );
}
