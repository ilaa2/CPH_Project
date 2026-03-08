import React, { useState, useEffect } from 'react';
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
        'Batal': 'bg-red-100 text-red-800',
        'completed': 'bg-green-100 text-green-800',
        'shipped': 'bg-blue-100 text-blue-800',
    };

    // Normalize status text
    const isPickup = ['Ambil Sendiri', 'Ambil di Toko', 'Ambil Langsung'].includes(pesanan.metode_pengiriman);
    const statusLabel = pesanan.status === 'completed' ? 'Selesai' :
        pesanan.status === 'shipped' ? (isPickup ? 'Siap Diambil' : 'Dikirim') :
            pesanan.status === 'pending' ? 'Menunggu Pembayaran' : pesanan.status;

    return (
        <div className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 overflow-hidden group">
            <Link href={route('customer.pesanan.show', pesanan.id)}>
                <div className="p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-green-600 text-sm flex items-center group-hover:text-green-700 transition-colors">
                                <FiArchive className="mr-2" />{pesanan.nomor_pesanan}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(pesanan.created_at)}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${statusStyles[pesanan.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <div className="border-t my-4 border-gray-100"></div>
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
            <div className="bg-gray-50/70 px-5 py-3 flex justify-between items-center text-sm border-t border-gray-100">
                {/* Actions: Left */}
                <div className="flex items-center gap-2">
                    {pesanan.ulasan?.length > 0 ? (
                        <Link href={route('customer.pesanan.show', pesanan.id)} className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors">
                            Lihat Ulasan
                        </Link>
                    ) : (
                        <Link href={route('customer.pesanan.show', pesanan.id)} className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors">
                            Lihat Detail
                        </Link>
                    )}
                </div>

                {/* Total: Right */}
                <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Total Pembayaran</span>
                    <p className="font-bold text-gray-900">{formatCurrency(pesanan.total)}</p>
                </div>
            </div>
        </div>
    );
};

const PesananKunjunganCard = ({ kunjungan }) => {
    const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formatJam = (jam) => jam ? jam.substring(0, 5) + ' WIB' : '-';

    const statusStyles = {
        'Selesai': 'bg-green-100 text-green-800',
        'Dijadwalkan': 'bg-blue-100 text-blue-800',
        'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-800',
        'Batal': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 overflow-hidden group">
            <Link href={route('customer.kunjungan.show', kunjungan.id)}>
                <div className="p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            {/* Header: Green ID (No Pembayaran) + Date */}
                            <p className="font-semibold text-green-600 text-sm flex items-center group-hover:text-green-700 transition-colors">
                                <FiCalendar className="mr-2" />
                                {kunjungan.midtrans_order_id || `BOOK-${kunjungan.id.toString().padStart(5, '0')}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(kunjungan.tanggal)}</p>
                        </div>
                        {/* Status Badge */}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${statusStyles[kunjungan.status] || 'bg-gray-100 text-gray-800'}`}>
                            {kunjungan.status}
                        </span>
                    </div>

                    <div className="border-t my-4 border-gray-100"></div>

                    {/* Content: Mocking Product Card Layout */}
                    <div className="flex items-center">
                        {/* Avatar for Visit Type */}
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border-2 border-white flex-shrink-0">
                            <FiUsers className="text-green-600 w-5 h-5" />
                        </div>

                        <div className="ml-4 flex-grow">
                            <p className="text-sm font-medium text-gray-800">
                                {kunjungan.tipe ? kunjungan.tipe.nama_tipe : 'Kunjungan'}
                                <span className="text-gray-500 font-normal text-xs ml-1">
                                    • {kunjungan.jumlah_pengunjung || (kunjungan.jumlah_dewasa + kunjungan.jumlah_anak)} Orang
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatJam(kunjungan.jam)} • Lihat detail kunjungan
                            </p>
                        </div>
                    </div>
                </div>
            </Link>

            <div className="bg-gray-50/70 px-5 py-3 flex justify-between items-center text-sm border-t border-gray-100">
                {/* Actions: Left */}
                <div className="flex items-center gap-2">
                    {kunjungan.payment_status === 'pending' && kunjungan.status !== 'Batal' ? (
                        <a href={route('customer.kunjungan.payment', kunjungan.id)} className="bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-green-700 transition-all text-xs animate-pulse">
                            Bayar Sekarang
                        </a>
                    ) : (
                        kunjungan.ulasan?.length > 0 ? (
                            <Link href={route('customer.kunjungan.show', kunjungan.id)} className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors">
                                Lihat Ulasan
                            </Link>
                        ) : (
                            <Link href={route('customer.kunjungan.show', kunjungan.id)} className="text-xs font-semibold text-gray-600 hover:text-green-600 transition-colors">
                                Lihat Detail
                            </Link>
                        )
                    )}
                </div>

                {/* Total: Right */}
                <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Total Biaya</span>
                    <p className="font-bold text-gray-900">{formatCurrency(kunjungan.total_biaya)}</p>
                </div>
            </div>
        </div>
    );
};


export default function Riwayat({ riwayatProduk, riwayatKunjungan, auth }) {
    // Check URL hash to determine initial tab
    const getInitialTab = () => {
        if (typeof window !== 'undefined' && window.location.hash === '#kunjungan') {
            return 'kunjungan';
        }
        return 'produk';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Handle hash changes
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#kunjungan') {
                setActiveTab('kunjungan');
            } else if (window.location.hash === '#produk' || window.location.hash === '') {
                setActiveTab('produk');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
