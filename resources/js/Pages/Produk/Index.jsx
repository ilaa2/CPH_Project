import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import Mainbar from "@/Components/Bar/Mainbar";
import { FiPlus } from "react-icons/fi";

export default function ProdukList({ produk }) {
  const { flash } = usePage().props;

  // Notifikasi flash success (tambah/edit produk)
  useEffect(() => {
    if (flash.success) {
      Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: flash.success,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }, [flash]);

  // Konfirmasi hapus
  function handleDelete(id) {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data produk yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('produk.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          }
        });
      }
    });
  }

  return (
    <Mainbar header={
      <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
        Produk
      </h2>
    }>
      <Head title="Produk" />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Header & Tambah Produk */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-700">Daftar Produk</h3>
          <Link
            href="/produk/create"
            className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full sm:w-auto"
          >
            <FiPlus className="mr-2" /> Tambah Produk
          </Link>
        </div>

        {/* Konten Responsif */}
        {/* Tampilan Card untuk Mobile */}
        <div className="sm:hidden space-y-4">
          {produk && produk.length > 0 ? (
            produk.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex items-start gap-4">
                  {item.gambar ? (
                    <img
                      src={`/storage/${item.gambar}`}
                      alt={item.nama}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 italic">No Img</div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-800">{item.nama}</h4>
                    <p className="text-sm text-gray-500">{item.kategori ? item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1) : '-'}</p>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="truncate" title={item.deskripsi}><strong>Deskripsi:</strong> {item.deskripsi || '-'}</p>
                  <p><strong>Stok:</strong> {item.stok}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    (item.status || '').toLowerCase() === 'aktif'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status || 'Tidak Ada'}
                  </span>
                  <div className="flex items-center gap-4">
                    <Link href={`/produk/${item.id}/edit`} className="text-blue-600 hover:underline font-medium">Edit</Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline font-medium">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada produk tersedia.
            </div>
          )}
        </div>

        {/* Tampilan Tabel untuk Desktop */}
        <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Gambar</th>
                <th className="px-4 py-2">Nama Produk</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Kategori</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Stok</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk && produk.length > 0 ? (
                produk.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">
                      {item.gambar ? (
                        <img
                          src={`/storage/${item.gambar}`}
                          alt={item.nama}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{item.nama}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate" title={item.deskripsi}>
                      {item.deskripsi || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {item.kategori
                        ? item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1)
                        : '-'}
                    </td>
                    <td className="px-4 py-2">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-2">{item.stok}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        (item.status || '').toLowerCase() === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status || 'Tidak Ada'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                        <Link
                          href={`/produk/${item.id}/edit`}
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    Tidak ada produk tersedia.
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
