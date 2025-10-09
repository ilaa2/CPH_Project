import { Head, Link, usePage, router } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";
import { FiPlus } from "react-icons/fi";
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function PelangganList({ pelanggan }) {
  const { flash } = usePage().props;

  // Notifikasi flash
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: flash.success,
        icon: 'success',
        confirmButtonColor: '#16a34a'
      });
    }
  }, [flash]);

  // Konfirmasi hapus
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data pelanggan akan dihapus secara permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('pelanggan.destroy', id));
      }
    });
  };

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Pelanggan
      </h2>
    }>
      <Head title="Pelanggan" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Daftar Pelanggan</h3>
          <Link
            href={route('pelanggan.create')}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <FiPlus className="mr-2" /> Tambah Pelanggan
          </Link>
        </div>

        {/* Konten Responsif */}
        {/* Tampilan Card untuk Mobile */}
        <div className="sm:hidden space-y-4">
          {pelanggan.length > 0 ? (
            pelanggan.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.nama}</h4>
                    <p className="text-sm text-gray-500">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Link href={route('pelanggan.edit', item.id)} className="text-blue-600 hover:underline font-medium text-sm">Edit</Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline font-medium text-sm">Hapus</button>
                  </div>
                </div>
                <div className="text-sm text-gray-700 pt-2 border-t">
                  <p><strong>Telepon:</strong> {item.telepon || '-'}</p>
                  <p><strong>Alamat:</strong> {item.alamat || '-'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data pelanggan.
            </div>
          )}
        </div>

        {/* Tampilan Tabel untuk Desktop */}
        <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Telepon</th>
                <th className="px-6 py-3">Alamat</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pelanggan.length > 0 ? (
                pelanggan.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item.nama}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.telepon || '-'}</td>
                    <td className="px-6 py-4">{item.alamat || '-'}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={route('pelanggan.edit', item.id)}
                        className="text-blue-600 hover:underline mr-2"
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Mainbar>
  );
}
