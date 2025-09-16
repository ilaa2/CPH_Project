import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { SiteHeader, FooterNote } from '@/Layouts/CustomerLayout';
import { FiArchive, FiCalendar, FiShoppingBag, FiMapPin } from 'react-icons/fi';

// Komponen untuk menampilkan kartu pesanan produk
const PesananProdukCard = ({ pesanan }) => {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const statusStyles = {
        'Diproses': 'bg-blue-100 text-blue-800',
        'Selesai': 'bg-green-100 text-green-800',
        'Dibatalkan': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <Link href={route('customer.pesanan.show', pesanan.id)} className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-green-600 text-sm flex items-center"><FiArchive className="mr-2"/>{pesanan.nomor_pesanan}</p>
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
                            <img key={item.id} src={`/storage/${item.produk.gambar}`} alt={item.produk.nama} className="w-12 h-12 rounded-full border-2 border-white object-cover"/>
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
            <div className="bg-gray-50/70 px-5 py-3 flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Pembayaran</span>
                <span className="font-bold text-gray-900">{formatCurrency(pesanan.total)}</span>
            </div>
        </Link>
    );
};

// Komponen untuk menampilkan kartu pesanan kunjungan
const PesananKunjunganCard = ({ kunjungan }) => {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const statusStyles = {
        'Dikonfirmasi': 'bg-green-100 text-green-800',
        'Menunggu Konfirmasi': 'bg-yellow-100 text-yellow-800',
        'Dibatalkan': 'bg-red-100 text-red-800',
    };

    return (
         <div className="block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <div>
                        {/* --- BAGIAN YANG DIPERBAIKI ADA DI SINI --- */}
                        <p className="font-semibold text-green-600 text-sm flex items-center">
                            <FiMapPin className="mr-2"/>
                            {/* Tambahkan pengecekan: jika tipe_kunjungan ada, tampilkan namanya. Jika tidak, tampilkan teks pengganti. */}
                            {kunjungan.tipe_kunjungan ? kunjungan.tipe_kunjungan.nama : 'Tipe Kunjungan Dihapus'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{kunjungan.jumlah_pengunjung} Pengunjung</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[kunjungan.status] || 'bg-gray-100 text-gray-800'}`}>
                        {kunjungan.status}
                    </span>
                </div>
                <div className="border-t my-4"></div>
                <div className="flex items-start">
                     <FiCalendar className="text-green-500 text-2xl mt-1"/>
                     <div className="ml-4 flex-grow">
                        <p className="text-sm font-medium text-gray-800">Jadwal Kunjungan</p>
                        <p className="text-sm text-gray-600">{formatDate(kunjungan.tanggal_kunjungan)}</p>
                    </div>
                </div>
            </div>
             <div className="bg-gray-50/70 px-5 py-3 flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Biaya</span>
                <span className="font-bold text-gray-900">{formatCurrency(kunjungan.total_biaya)}</span>
            </div>
        </div>
    );
};

export default function Riwayat({ riwayatProduk, riwayatKunjungan, auth }) {
    const [activeTab, setActiveTab] = useState('produk');

    const TabButton = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center w-full justify-center sm:w-auto px-4 py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-colors ${
                activeTab === tabName ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <>
            <Head title="Riwayat Pesanan" />
            <SiteHeader auth={auth} />

            <main className="bg-gray-50 font-sans min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Riwayat Transaksi Saya</h1>

                    <div className="bg-white p-2 rounded-xl shadow-sm border mb-8 flex space-x-2">
                        <TabButton tabName="produk" label="Pesanan Produk" icon={<FiShoppingBag className="mr-2"/>}/>
                        <TabButton tabName="kunjungan" label="Jadwal Kunjungan" icon={<FiCalendar className="mr-2"/>}/>
                    </div>

                    <div>
                        {activeTab === 'produk' && (
                            <div className="space-y-6">
                                {riwayatProduk.length > 0 ? (
                                    riwayatProduk.map(pesanan => <PesananProdukCard key={pesanan.id} pesanan={pesanan} />)
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                                        <FiArchive className="mx-auto text-5xl text-gray-300"/>
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
                                        <FiCalendar className="mx-auto text-5xl text-gray-300"/>
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

            <FooterNote />
        </>
    );
}
