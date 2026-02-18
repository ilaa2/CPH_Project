import { Head, Link, router, usePage } from '@inertiajs/react';
import Mainbar from "@/Components/Bar/Mainbar";
import Modal from '@/Components/Modal';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import FilterHeader from '@/Components/FilterHeader';

// Komponen Modal Detail Customer
const CustomerDetailModal = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Profil Lengkap Customer</h2>
          <p className="text-sm text-gray-500 mt-1">Detail informasi dan aktivitas</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Kolom Kiri: Profil Hero */}
        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={customer.avatar ? `/storage/${customer.avatar}` : `https://ui-avatars.com/api/?name=${customer.name}&background=e8f5e9&color=166534`}
              alt={customer.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-4">{customer.name}</h3>
          <p className="text-sm text-gray-500">{customer.email}</p>

          <div className="mt-6 w-full space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Bergabung Sejak</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(customer.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Info & Transaksi */}
        <div className="w-full md:w-2/3 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Telepon
              </label>
              <p className="text-gray-800 font-semibold mt-1">{customer.phone || '-'}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Alamat Utama
              </label>
              <p className="text-gray-700 leading-snug text-sm">
                {customer.alamat || 'Belum mencantumkan alamat lengkap.'}
              </p>
            </div>
          </div>

          {/* Riwayat Transaksi Terakhir */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h4 className="font-bold text-gray-700">3 Transaksi Terakhir</h4>
              <Link href={route('admin.pesanan.index', { search: customer.name })} className="text-xs text-green-600 font-bold hover:underline">
                Lihat Semua Pesanan →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="px-4 py-2 font-medium">Tanggal</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.latest_orders && customer.latest_orders.length > 0 ? (
                    customer.latest_orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-4 py-2 text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-2 font-semibold text-gray-800">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold
                                            ${order.status === 'completed' || order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' || order.status === 'Menunggu Pembayaran' ? 'bg-orange-100 text-orange-800' :
                                order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-center text-gray-400 text-xs italic">
                        Belum ada transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 pt-4 border-t text-right">
        <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
          Tutup Detail
        </button>
      </div>
    </div>
  );
};

// Komponen Pagination
const Pagination = ({ links }) => (
  <div className="flex flex-wrap justify-center mt-6">
    {links.map((link, index) => (
      <Link
        key={index}
        href={link.url || '#'}
        dangerouslySetInnerHTML={{ __html: link.label }}
        className={`px-3 py-1 mx-1 rounded text-sm transition-colors ${link.active
          ? 'bg-green-600 text-white font-medium'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          } ${!link.url ? 'text-gray-300 cursor-not-allowed hover:bg-white' : ''}`}
        disabled={!link.url}
      />
    ))}
  </div>
);

export default function PelangganList({ pelanggan, filters, stats }) {
  const { data, links, from } = pelanggan;
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const debouncedSearch = useCallback(
    debounce((nextValue) => {
      /* Gunakan replace agar history tidak menumpuk saat ngetik */
      router.get(route('admin.pelanggan.index'), { search: nextValue }, {
        preserveState: true,
        replace: true,
      });
    }, 400),
    []
  );

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchValue(newSearch);
    debouncedSearch(newSearch);
  };

  return (
    <Mainbar header={null}> {/* Header Custom di Body */}
      <Head title="Manajemen Customer" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Customer</h2>
            <p className="text-gray-500 mt-1">Kelola dan pantau aktivitas pelanggan toko Anda.</p>
          </div>
          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 bg-white shadow-sm transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Customer */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-green-100 font-medium text-sm uppercase tracking-wider">Total Customer</p>
              <h3 className="text-4xl font-bold mt-2">{stats?.total || 0}</h3>
              <p className="text-green-100 text-xs mt-1">Terdaftar di sistem</p>
            </div>
            <svg className="w-32 h-32 absolute -right-6 -bottom-6 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
          </div>

          {/* Card 2: Total Kunjungan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Kunjungan</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.kunjungan || 0}</h3>
              <p className="text-gray-400 text-xs mt-2">Reservasi Booking</p>
            </div>
            <div className="absolute top-4 right-4 p-3 bg-indigo-50 rounded-xl text-indigo-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>

          {/* Card 3: Total Ulasan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Ulasan</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.ulasan || 0}</h3>
              <p className="text-gray-400 text-xs mt-2">Feedback Customer</p>
            </div>
            <div className="absolute top-4 right-4 p-3 bg-yellow-50 rounded-xl text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
          </div>
        </div>

        {/* Tabel Layout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Customer Profile</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Statistik</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{from + index}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.avatar ? `/storage/${item.avatar}` : `https://ui-avatars.com/api/?name=${item.name}&background=e8f5e9&color=166534`}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {item.phone || '-'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate max-w-[150px] inline-block" title={item.alamat}>{item.alamat || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-6">
                          {/* Stats Belanja */}
                          <div className="flex-1 min-w-[140px]">
                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                              Aktivitas Belanja
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="bg-green-50 text-green-600 p-2 rounded-lg shrink-0">
                                <span className="font-bold text-sm block text-center min-w-[20px]">{item.pesanan_count}</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-sm">
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_belanja || 0)}
                                </div>
                                <div className="text-[10px] text-gray-400">Total Transaksi</div>
                              </div>
                            </div>
                          </div>

                          {/* Divider Visual */}
                          <div className="w-px bg-gray-100"></div>

                          {/* Stats Kunjungan */}
                          <div className="flex-1 min-w-[120px]">
                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                              Kunjungan
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg shrink-0">
                                <span className="font-bold text-sm block text-center min-w-[20px]">{item.kunjungan_count || 0}</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-800 text-sm">
                                  {item.kunjungan_count ? 'Pernah Berkunjung' : 'Belum Berkunjung'}
                                </div>
                                <div className="text-[10px] text-gray-400">Total Reservasi</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedCustomer(item)}
                          className="p-2 text-gray-400 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-100"
                          title="Lihat Detail Customer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic bg-gray-50">
                      Tidak ada data customer yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination links={links} />

        {/* Modal Detail */}
        <Modal show={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} maxWidth="2xl">
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </Modal>

      </div>
    </Mainbar>
  );
}
