import { Head, Link, router, usePage } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function PesananIndex({ pesanan }) {
  const [modalData, setModalData] = useState(null);
  const { flash } = usePage().props;

  useEffect(() => {
    if (flash.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: flash.success,
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'OK',
      });
    }
  }, [flash.success]);

  const handleOpenModal = (pesanan) => setModalData(pesanan);
  const handleCloseModal = () => setModalData(null);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data pesanan akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) router.delete(route('pesanan.destroy', id));
    });
  };

  return (
    <Mainbar header={<h2 className="text-xl font-semibold text-gray-800">Pesanan</h2>}>
      <Head title="Pesanan" />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-700">Daftar Pesanan</h3>
          <Link
            href={route('pesanan.create')}
            className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full sm:w-auto"
          >
            + Tambah Pesanan
          </Link>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-[600px] sm:min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama Pelanggan</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesanan.length > 0 ? (
                pesanan.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item.pelanggan?.nama || '-'}</td>
                    <td className="px-4 py-2">{item.tanggal}</td>
                    <td className="px-4 py-2">Rp {(item.total || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Selesai'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Diproses'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-600 hover:underline w-full sm:w-auto text-left sm:text-center"
                      >
                        Lihat
                      </button>
                      <Link
                        href={route('pesanan.edit', item.id)}
                        className="text-green-600 hover:underline w-full sm:w-auto text-left sm:text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline w-full sm:w-auto text-left sm:text-center"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                    Tidak ada data pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full sm:max-w-lg md:max-w-xl p-4 sm:p-6 overflow-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-4 text-green-700">Detail Produk Pesanan</h2>
            {modalData.items && modalData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-2 px-3">Nama Produk</th>
                      <th className="py-2 px-3">Jumlah</th>
                      <th className="py-2 px-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.items.map((i, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-3">{i.produk?.nama}</td>
                        <td className="py-2 px-3">{i.jumlah}</td>
                        <td className="py-2 px-3">Rp {i.subtotal.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Tidak ada item dalam pesanan ini.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 w-full sm:w-auto bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </Mainbar>
  );
}
