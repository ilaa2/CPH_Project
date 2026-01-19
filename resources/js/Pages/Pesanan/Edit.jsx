import { Head, Link, useForm } from '@inertiajs/react';
import Mainbar from '@/Components/Bar/Mainbar';
import Swal from 'sweetalert2';

export default function Edit({ pesanan }) {
  // Normalize status for legacy data support
  const normalizeStatus = (s) => {
    if (!s) return 'pending';
    const lower = s.toLowerCase();
    if (lower === 'menunggu pembayaran') return 'pending';
    if (lower === 'diproses') return 'processed';
    if (lower === 'dikirim') return 'shipped';
    if (lower === 'selesai') return 'completed';
    return lower;
  };

  const currentStatus = normalizeStatus(pesanan.status);

  const { data, setData, put, processing, errors } = useForm({
    status: currentStatus,
    nomor_resi: pesanan.nomor_resi || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('admin.pesanan.update', pesanan.id), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Status pesanan berhasil diperbarui!'
        });
      },
      onError: (errs) => {
        const msg = errs.message || Object.values(errs).flat().join(', ') || 'Gagal memperbarui status.';
        Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
      }
    });
  };

  // Format Date (10 Okt 2025)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(date);
  };

  // Format Currency
  const formatRp = (num) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num);

  // Status Badge Color
  const getStatusColor = (s) => {
    const status = normalizeStatus(s);
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCompleted = currentStatus === 'completed';
  const showResiInput = ['processed', 'shipped'].includes(data.status);

  // Calculate Subtotal from snapshot items to ensure accuracy
  const subtotal = pesanan.items?.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0) || 0;

  return (
    <Mainbar header={
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Detail & Edit Status Pesanan</h2>
        <Link
          href={route('admin.pesanan.index')}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm"
        >
          &larr; Kembali ke Daftar Pesanan
        </Link>
      </div>
    }>
      <Head title={`Edit Pesanan #${pesanan.nomor_pesanan}`} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

        {/* LEFT COLUMN: Order Info & Items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Order Info */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Pesanan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Nomor Pesanan</label>
                <div className="font-mono text-gray-800 font-bold">#{pesanan.nomor_pesanan}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Tanggal Pesanan</label>
                <div className="text-gray-800">{formatDate(pesanan.tanggal)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Pelanggan</label>
                <div className="text-gray-800 font-medium">{pesanan.user?.nama || pesanan.user?.name || 'Guest'}</div>
                <div className="text-sm text-gray-500">{pesanan.user?.email}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Status Saat Ini</label>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(pesanan.status)}`}>
                    {pesanan.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Order Items (Read Only) */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Detail Produk</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pesanan.items?.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.produk?.nama || 'Produk Dihapus'}
                      </td>
                      <td className="px-4 py-3 text-right">{formatRp(item.subtotal / item.jumlah)}</td>
                      <td className="px-4 py-3 text-center">{item.jumlah}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatRp(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Shipping Info (Read Only) */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Pengiriman</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Metode</label>
                <div className="font-semibold text-gray-800">{pesanan.metode_pengiriman}</div>

                {pesanan.metode_pengiriman !== 'Ambil di Toko' && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Ekspedisi / Estimasi</label>
                    <div className="text-gray-800">
                      {pesanan.ekspedisi || pesanan.metode_pengiriman || '-'}
                      {pesanan.estimasi && <span className="text-gray-500 text-sm"> ({pesanan.estimasi})</span>}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Alamat Tujuan</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1 border text-sm leading-relaxed">
                  {pesanan.alamat_pengiriman}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Status Manager & Summary */}
        <div className="space-y-6">

          {/* Card: Action / Status Manager */}
          <div className="bg-white p-6 rounded-lg shadow border-2 border-indigo-50">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">Update Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status Pesanan</label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  disabled={isCompleted}
                  className="w-full border-gray-300 rounded font-semibold focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="pending">Pending (Menunggu Pembayaran)</option>
                  <option value="processed">Processed (Diproses)</option>
                  <option value="shipped">Shipped (Dikirim)</option>
                  <option value="completed">Completed (Selesai)</option>
                </select>
                {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
                {isCompleted && <p className="text-xs text-gray-500 mt-1 italic">Status selesai tidak dapat diubah.</p>}
              </div>

              {/* Input Resi hanya muncul jika processed/shipped */}
              {showResiInput && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-medium mb-1">Nomor Resi / Tracking Info</label>
                  <input
                    type="text"
                    value={data.nomor_resi}
                    onChange={(e) => setData('nomor_resi', e.target.value)}
                    placeholder="Input nomor resi..."
                    disabled={isCompleted}
                    className="w-full border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.nomor_resi && <p className="text-xs text-red-600 mt-1">{errors.nomor_resi}</p>}
                </div>
              )}

              {!isCompleted && (
                <div className="pt-4 border-t flex justify-end items-center">
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Menyimpan...' : 'Update Status'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card: Payment Summary */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Pembayaran</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Produk</span>
                <span>{formatRp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span>{formatRp(pesanan.biaya_pengiriman)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900 mt-2">
                <span>Total Bayar</span>
                <span className="text-indigo-600">{formatRp(pesanan.total)}</span>
              </div>
            </div>
          </div>

          {[
            'pending',
            'processed',
            'shipped',
            'completed'
          ].map(s => (
            data.status === s ? (
              <div key={s} className={`p-4 rounded-lg text-sm border font-medium ${getStatusColor(s).replace('text-', 'border-').replace('100', '200')}`}>
                ℹ️ Info: {
                  s === 'pending' ? 'Pesanan menunggu pembayaran. Item tidak dapat diubah.' :
                    s === 'processed' ? 'Pesanan sedang disiapkan. Silakan input resi jika tersedia.' :
                      s === 'shipped' ? 'Pesanan dikirim. Pastikan resi valid.' :
                        'Pesanan selesai. Data terkunci permanen.'
                }
              </div>
            ) : null
          ))}

        </div>
      </form>
    </Mainbar>
  );
}
