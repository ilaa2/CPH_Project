import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { FiArchive, FiCalendar, FiShoppingBag, FiMapPin, FiUsers } from 'react-icons/fi';

// ... (Komponen PesananProdukCard dan PesananKunjunganCard tetap sama) ...
const PesananProdukCard = ({ pesanan }) => {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const statusStyles = {
        'Diproses': 'bg-blue-100 text-blue-800',
        'Selesai': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 overflow-hidden">
            <Link href={route('customer.pesanan.show', pesanan.id)}>
                <div className="p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-green-600 text-sm flex items-center"><FiArchive className="mr-2" />{pesanan.nomor_pesanan}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(pesanan.created_at)}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[pesanan.status] || 'bg-gray-100 text-gray-800'}`}>
                            {pesanan.status}
                        </span>
                    </div>
                    <div className="border-t my-4"></div>
                    <div className="flex items-center">
                        <div className="flex -space-x-4">
                            {pesanan.items.slice(0, 3).map(item => (
                                <img key={item.id} src={`/storage/${item.produk.gambar}`} alt={item.produk.nama} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                            ))}
                        </div>
                        {pesanan.items.length > 3 && (
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 border-2 border-white">
                                +{pesanan.items.length - 3}
                            </div>
                        )}
                        <div className="ml-4 flex-grow">
                            <p className="text-sm font-medium text-gray-800">{pesanan.items.length} Produk</p>
                            <p className="text-xs text-gray-500">Lihat detail pesanan</p>
                        </div>
                    </div>
                </div>
            </Link>
            <div className="bg-gray-50/70 px-5 py-3 flex justify-between items-center text-sm">
                <div>
                    <span className="text-gray-600">Total Pembayaran</span>
                    <p className="font-bold text-gray-900">{formatCurrency(pesanan.total)}</p>
                </div>
                {pesanan.status === 'Selesai' && (
                    pesanan.ulasan?.length > 0 ? (
                        <Link href={route('customer.pesanan.show', pesanan.id)} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-xs">
                            Lihat Ulasan
                        </Link>
                    ) : (
                        <Link href={route('customer.ulasan.create', pesanan.id)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-xs">
                            Beri Ulasan
                        </Link>
                    )
                )}
            </div>
        </div>
    );
};

const PesananKunjunganCard = ({ kunjungan }) => {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const statusStyles = {
        'Selesai': 'bg-green-100 text-green-800 border border-green-200',
        'Dijadwalkan': 'bg-blue-100 text-blue-800 border border-blue-200',
        'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'Batal': 'bg-red-100 text-red-800 border border-red-200',
    };

    // Format jam (ambil 5 karakter pertama, misal 09:00:00 -> 09:00)
    const formatJam = (jam) => jam ? jam.substring(0, 5) + ' WIB' : '-';

    return (
        <div className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-500 transition-all duration-300 overflow-hidden group">
            <Link href={route('customer.kunjungan.show', kunjungan.id)} className="block p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start">
                        <div className="bg-green-50 p-3 rounded-lg mr-4 group-hover:bg-green-100 transition-colors">
                            <FiCalendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                                {kunjungan.tipe ? kunjungan.tipe.nama_tipe : 'Kunjungan'}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 gap-1 sm:gap-3">
                                <span>{formatDate(kunjungan.tanggal)}</span>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs w-fit">
                                    {formatJam(kunjungan.jam)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${statusStyles[kunjungan.status] || 'bg-gray-100 text-gray-800'}`}>
                        {kunjungan.status}
                    </span>
                </div>

                <div className="border-t border-gray-100 my-3"></div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs mb-1">Pengunjung</p>
                        <div className="flex items-center text-gray-800 font-medium">
                            <FiUsers className="mr-2 text-gray-400" />
                            {kunjungan.jumlah_pengunjung} Orang
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 pl-6">
                            {(kunjungan.jumlah_dewasa || 0) > 0 && `${kunjungan.jumlah_dewasa} Dws`}
                            {(kunjungan.jumlah_anak || 0) > 0 && `, ${kunjungan.jumlah_anak} Ank`}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">Total Biaya</p>
                        <p className="font-bold text-gray-900 text-base">{formatCurrency(kunjungan.total_biaya)}</p>
                    </div>
                </div>
            </Link>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center sm:justify-end gap-3">
                <Link
                    href={route('customer.kunjungan.show', kunjungan.id)}
                    className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                >
                    Lihat Detail
                </Link>
                {kunjungan.status === 'Selesai' && (
                    kunjungan.ulasan?.length > 0 ? (
                        <Link
                            href={route('customer.kunjungan.show', kunjungan.id)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                        >
                            <span className="mr-2">⭐</span> Lihat Ulasan
                        </Link>
                    ) : (
                        <Link
                            href={route('customer.kunjungan.ulasan.create', kunjungan.id)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                        >
                            Beri Ulasan
                        </Link>
                    )
                )}
                {kunjungan.payment_status === 'pending' && kunjungan.status !== 'Batal' && (
                    <a href={route('customer.kunjungan.payment', kunjungan.id)} className="inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-all animate-pulse">
                        Bayar Sekarang
                    </a>
                )}
            </div>
        </div>
    );
};


export default function Riwayat({ riwayatProduk, riwayatKunjungan, auth }) {
    const [activeTab, setActiveTab] = useState('produk');

    const TabButton = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center w-full justify-center sm:w-auto px-4 py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-colors ${activeTab === tabName ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <CustomerLayout auth={auth}>
            <Head title="Riwayat Pesanan" />

            <main className="bg-gray-50 font-sans min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Riwayat Transaksi Saya</h1>

                    <div className="bg-white p-2 rounded-xl shadow-sm border mb-8 flex space-x-2">
                        <TabButton tabName="produk" label="Pesanan Produk" icon={<FiShoppingBag className="mr-2" />} />
                        <TabButton tabName="kunjungan" label="Jadwal Kunjungan" icon={<FiCalendar className="mr-2" />} />
                    </div>

                    <div>
                        {activeTab === 'produk' && (
                            <div className="space-y-6">
                                {riwayatProduk.length > 0 ? (
                                    riwayatProduk.map(pesanan => <PesananProdukCard key={pesanan.id} pesanan={pesanan} />)
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                                        <FiArchive className="mx-auto text-5xl text-gray-300" />
                                        <h3 className="mt-4 text-lg font-medium text-gray-800">Belum Ada Pesanan</h3>
                                        <p className="mt-1 text-sm text-gray-500">Sepertinya Anda belum pernah berbelanja produk.</p>
                                        <Link href={route('belanja.index')} className="mt-6 inline-block bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                            Mulai Belanja
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'kunjungan' && (
                            <div className="space-y-6">
                                {riwayatKunjungan.length > 0 ? (
                                    riwayatKunjungan.map(kunjungan => <PesananKunjunganCard key={kunjungan.id} kunjungan={kunjungan} />)
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                                        <FiCalendar className="mx-auto text-5xl text-gray-300" />
                                        <h3 className="mt-4 text-lg font-medium text-gray-800">Belum Ada Jadwal</h3>
                                        <p className="mt-1 text-sm text-gray-500">Anda belum pernah menjadwalkan kunjungan.</p>
                                        <Link href={route('kunjungan.index')} className="mt-6 inline-block bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                            Jadwalkan Kunjungan
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
}
