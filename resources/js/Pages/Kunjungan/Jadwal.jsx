import { Head, Link, router, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function JadwalKunjungan({ kunjungan }) {
  const [selected, setSelected] = useState(null);
  const { flash } = usePage().props;

  // Notifikasi sukses setelah simpan/hapus
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: flash.success,
        confirmButtonColor: '#16a34a',
      });
    }
  }, [flash]);

  // Konfirmasi hapus
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('kunjungan.destroy', id));
      }
    });
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Jadwal Kunjungan</h2>}>
      <Head title="Jadwal Kunjungan" />

      <div className="p-6 space-y-6">
        <Link
          href="/kunjungan"
          className="inline-flex items-center text-sm text-green-600 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Kunjungan
        </Link>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Daftar Kunjungan Pelanggan</h3>
          <Link
            href={route('kunjungan.create')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            + Tambah Kunjungan
          </Link>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama Pelanggan</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Jam</th>
                <th className="px-4 py-2">Alamat</th>
                <th className="px-4 py-2">Tipe</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kunjungan.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.pelanggan?.nama}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">{item.jam}</td>
                  <td className="px-4 py-2">{item.pelanggan?.alamat}</td>
                  <td className="px-4 py-2">{item.tipe?.nama_tipe || '-'}</td>
                  <td className="px-4 py-2 capitalize">{item.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => setSelected(item)}
                      className="text-gray-600 hover:text-blue-600"
                      title="Lihat Detail"
                    >
                      ℹ️
                    </button>
                    <Link
                      href={route('kunjungan.edit', item.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
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
              <td className="px-4 py-2 font-medium">Deskripsi</td>
              <td className="px-4 py-2">{selected.deskripsi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium">Tipe Kunjungan</td>
              <td className="px-4 py-2">{selected.tipe?.nama_tipe || '-'}</td>
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
