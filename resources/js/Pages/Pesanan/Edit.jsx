import { Head, Link, useForm, router } from '@inertiajs/react';
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

  // Special handler for Quick Ship action (avoids state race conditions)
  const handleQuickShip = (resi) => {
    router.put(route('admin.pesanan.update', pesanan.id), {
      ...data,
      status: 'shipped',
      nomor_resi: resi
    }, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Dikirim!',
          text: `Status diubah menjadi Dikirim. Resi: ${resi}`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      onError: (errs) => {
        const msg = errs.message || Object.values(errs).flat().join(', ') || 'Gagal memperbarui status.';
        Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
      }
    });
  };

  // Atomic status update handler
  const updateStatus = (newStatus) => {
    router.put(route('admin.pesanan.update', pesanan.id), {
      ...data,
      status: newStatus
    }, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Status pesanan berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false
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
  const showResiInput = ['shipped', 'completed'].includes(data.status);

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
                    {(() => {
                      const s = normalizeStatus(pesanan.status);
                      const labels = {
                        pending: 'Menunggu Pembayaran',
                        processed: 'Diproses',
                        shipped: 'Dikirim',
                        completed: 'Selesai'
                      };
                      return labels[s] || pesanan.status;
                    })()}
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
                <div className="font-semibold text-gray-800">
                  {['Ambil di Toko', 'Ambil Sendiri', 'Kurir Lokal'].includes(pesanan.metode_pengiriman)
                    ? pesanan.metode_pengiriman
                    : 'Ekspedisi'}
                </div>

                {/* Hide Ekspedisi/Estimasi for Pickup AND Local Courier (redundant) */}
                {!['Ambil di Toko', 'Ambil Sendiri', 'Kurir Lokal'].includes(pesanan.metode_pengiriman) && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Ekspedisi / Estimasi</label>
                    <div className="text-gray-800">
                      {pesanan.ekspedisi || pesanan.metode_pengiriman || '-'}
                      {pesanan.estimasi && <span className="text-gray-500 text-sm"> ({pesanan.estimasi})</span>}

                      {/* Estimasi Tanggal Sampai */}
                      {(() => {
                        if (!pesanan.estimasi || !pesanan.tanggal) return null;

                        // Parse "2-3 Hari" or "1 Hari"
                        const matches = pesanan.estimasi.match(/(\d+)(?:-(\d+))?/);
                        if (!matches) return null;

                        const minDays = parseInt(matches[1]);
                        const maxDays = matches[2] ? parseInt(matches[2]) : minDays;

                        const orderDate = new Date(pesanan.tanggal);

                        // Add days to order date
                        const minDate = new Date(orderDate);
                        minDate.setDate(orderDate.getDate() + minDays);

                        const maxDate = new Date(orderDate);
                        maxDate.setDate(orderDate.getDate() + maxDays);

                        const options = { weekday: 'long', day: 'numeric', month: 'short' };
                        const minStr = new Intl.DateTimeFormat('id-ID', options).format(minDate);
                        const maxStr = new Intl.DateTimeFormat('id-ID', options).format(maxDate);

                        return (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            <span role="img" aria-label="calendar">📅</span> Sampai: {minStr} {minDays !== maxDays && `- ${maxStr}`}
                          </div>
                        );
                      })()}
                    </div>
                    {pesanan.nomor_resi && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                        <label className="text-xs text-gray-500 uppercase font-bold">No. Resi</label>
                        <div className="font-mono font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded text-sm mt-1">
                          {pesanan.nomor_resi}
                        </div>
                      </div>
                    )}
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
            <h3 className="text-lg font-bold text-indigo-900 mb-4">
              {isCompleted ? 'Status Pesanan' : 'Update Status'}
            </h3>

            {/* Quick Actions (Aksi Cepat) */}
            {!isCompleted ? (
              <div className="mb-6">


                {data.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => updateStatus('processed')}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    <span>✅</span> Konfirmasi Pembayaran
                  </button>
                )}

                {data.status === 'processed' && (
                  <button
                    type="button"
                    onClick={() => {
                      Swal.fire({
                        title: 'Input Nomor Resi',
                        input: 'text',
                        inputLabel: 'Masukkan nomor resi pengiriman:',
                        inputPlaceholder: 'Contoh: JNE12345678',
                        showCancelButton: true,
                        confirmButtonText: 'Kirim Pesanan',
                        cancelButtonText: 'Batal',
                        inputValidator: (value) => {
                          if (!value) {
                            return 'Nomor resi wajib diisi!';
                          }
                        }
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setData(data => ({ ...data, status: 'shipped', nomor_resi: result.value }));
                          // Small delay to ensure state update before submit implies race condition, 
                          // better to call submit directly with manual data but Inertia useForm is reactive.
                          // We will trigger manual submit in useEffect or just use helper command.
                          // Alternative: Since setData is async-like in batching, we cannot immediately submit.
                          // We will use a dedicated handler for this action.
                          handleQuickShip(result.value);
                        }
                      });
                    }}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    <span>🚚</span> Kirim Pesanan
                  </button>
                )}

                {data.status === 'shipped' && (
                  <button
                    type="button"
                    onClick={() => updateStatus('completed')}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    <span>🏁</span> Selesaikan Pesanan
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-800">Pesanan Selesai</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Transaksi ini telah selesai diproses.<br />Data sudah terkunci dan tersimpan di arsip.
                </p>
              </div>
            )}

            {/* Manual Update section removed to enforce linear flow via Quick Actions */}
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
